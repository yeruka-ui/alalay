import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { checkOnboardingComplete } from "@/utils/database";
import {
  configureNotifications,
  snoozeNotification,
  syncAllPendingNotifications,
} from "@/utils/notifications";
import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const notifSyncedRef = useRef<string | null>(null); // tracks last user id synced

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Re-check onboarding whenever session or top-level segment changes.
  // This ensures that after the user finishes onboarding and navigates to
  // (app), the root guard sees onboardingDone = true and doesn't redirect back.
  useEffect(() => {
    if (!session) {
      setOnboardingDone(false);
      setProfileReady(true);
      return;
    }
    setProfileReady(false);
    checkOnboardingComplete()
      .then((done) => {
        setOnboardingDone(done);
        setProfileReady(true);
      })
      .catch(() => {
        setOnboardingDone(false);
        setProfileReady(true);
      });
  }, [session, segments[0]]);

  useEffect(() => {
    if (!ready || !profileReady) return;
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!session) {
      if (!inAuth) router.replace("/onboard");
    } else if (!onboardingDone) {
      if (!inOnboarding) router.replace("/(onboarding)/step1");
    } else {
      if (inAuth || inOnboarding) router.replace("/dashboard");
    }
  }, [ready, profileReady, session, onboardingDone, segments]);

  // Configure channel + sync scheduled notifications once per authenticated session
  useEffect(() => {
    if (!session || !onboardingDone) return;
    const userId = session.user.id;
    if (notifSyncedRef.current === userId) return;
    notifSyncedRef.current = userId;

    configureNotifications().then(() =>
      syncAllPendingNotifications(userId)
    );
  }, [session, onboardingDone]);

  // Reset sync ref on logout so the next login re-syncs
  useEffect(() => {
    if (!session) notifSyncedRef.current = null;
  }, [session]);

  // Handle notification action buttons (Snooze / Take)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const action = response.actionIdentifier;
        const data = response.notification.request.content.data as {
          scheduleId?: number;
        };
        const scheduleId = data?.scheduleId;
        const medName =
          response.notification.request.content.title?.replace(
            "Time to take ",
            ""
          ) ?? "medication";

        if (action === "SNOOZE" && scheduleId !== undefined) {
          snoozeNotification(scheduleId, medName, 10);
        } else if (action === "TAKE") {
          // Navigate to dashboard; user taps Take there
          router.push("/dashboard");
        }
      }
    );
    return () => sub.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <Slot />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
