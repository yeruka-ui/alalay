// expo-notifications is lazy-loaded (via require inside each function) so that
// importing this module doesn't crash Expo Go SDK 53+, which throws on any
// push-token registration attempt. In mock mode these functions are never
// called, so expo-notifications is never loaded.
import type * as NotificationsType from "expo-notifications";
import { Platform } from "react-native";
import { combineManilaDateTime, manilaDateString } from "./manilaTime";
import { supabase } from "./supabase";

export const ANDROID_CHANNEL_ID = "medication-reminders";

function N(): typeof NotificationsType {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-notifications");
}

// ─── Setup ───────────────────────────────────────────────────

export async function configureNotifications(): Promise<void> {
  const Notifications = N();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Medication reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 400, 250, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  await Notifications.setNotificationCategoryAsync("medication", [
    {
      identifier: "TAKE",
      buttonTitle: "Take",
      options: { opensAppToForeground: true },
    },
    {
      identifier: "SNOOZE",
      buttonTitle: "Snooze 10m",
      options: { opensAppToForeground: false },
    },
  ]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = N();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

// ─── Types ───────────────────────────────────────────────────

type ScheduleRow = {
  id: number;
  scheduled_date: string;
  scheduled_time: string | null;
  status: "pending" | "taken" | "missed" | "skipped";
  notification_id: string | null;
  medication: { name: string; dosage: string | null; instructions: string | null };
};

// ─── Schedule / Cancel ───────────────────────────────────────

export async function scheduleNotificationFor(
  row: ScheduleRow
): Promise<string | null> {
  if (row.status !== "pending" || !row.scheduled_time) return null;

  const fireAt = combineManilaDateTime(row.scheduled_date, row.scheduled_time);
  if (!fireAt || fireAt.getTime() <= Date.now() + 5_000) return null;

  const Notifications = N();
  const body = [row.medication.dosage, row.medication.instructions]
    .filter(Boolean)
    .join(" • ");

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to take ${row.medication.name}`,
      body: body || undefined,
      categoryIdentifier: "medication",
      data: { scheduleId: row.id },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  await supabase
    .from("medication_schedules")
    .update({ notification_id: notifId })
    .eq("id", row.id);

  return notifId;
}

export async function cancelNotificationFor(
  scheduleId: number,
  notificationId: string | null
): Promise<void> {
  if (notificationId) {
    await N().cancelScheduledNotificationAsync(notificationId).catch(
      () => undefined // already fired or cancelled — not an error
    );
  }
  await supabase
    .from("medication_schedules")
    .update({ notification_id: null })
    .eq("id", scheduleId);
}

// ─── Snooze ──────────────────────────────────────────────────

export async function snoozeNotification(
  scheduleId: number,
  medicationName: string,
  snoozeMinutes = 10
): Promise<void> {
  const Notifications = N();
  const fireAt = new Date(Date.now() + snoozeMinutes * 60_000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to take ${medicationName}`,
      body: `Snoozed reminder`,
      categoryIdentifier: "medication",
      data: { scheduleId },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

// ─── Sync on launch ──────────────────────────────────────────

export async function syncAllPendingNotifications(userId: string): Promise<void> {
  const today = manilaDateString(new Date());

  const { data } = await supabase
    .from("medication_schedules")
    .select(
      "id, scheduled_date, scheduled_time, status, notification_id, medication:medications(name, dosage, instructions)"
    )
    .eq("user_id", userId)
    .gte("scheduled_date", today);

  if (!data) return;

  for (const row of data) {
    const r = row as unknown as ScheduleRow;
    if (r.status === "pending" && !r.notification_id) {
      await scheduleNotificationFor(r);
    } else if (r.status !== "pending" && r.notification_id) {
      await cancelNotificationFor(r.id, r.notification_id);
    }
  }
}
