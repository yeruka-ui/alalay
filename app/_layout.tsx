import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { checkOnboardingComplete } from "@/utils/database";
import { USE_MOCK } from "@/utils/mockData";
import {
  configureNotifications,
  snoozeNotification,
  syncAllPendingNotifications,
} from "@/utils/notifications";
import { supabase } from "@/utils/supabase";
import {
  Inter_400Regular,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import type { Session } from "@supabase/supabase-js";
import * as SplashScreen from "expo-splash-screen";
import type * as NotificationsType from "expo-notifications";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_800ExtraBold });
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const notifSyncedRef = useRef<string | null>(null); // tracks last user id synced

  useEffect(() => {
    if (USE_MOCK) {
      // Skip real auth — treat as always logged in so the guard routes to dashboard
      setReady(true);
      return;
    }
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
    if (USE_MOCK) {
      setOnboardingDone(true);
      setProfileReady(true);
      return;
    }
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

    const isLoggedIn = USE_MOCK || !!session;
    const isDone = USE_MOCK || onboardingDone;

    if (!isLoggedIn) {
      if (!inAuth) router.replace("/onboard");
    } else if (!isDone) {
      if (!inOnboarding) router.replace("/(onboarding)/step1");
    } else {
      if (inAuth || inOnboarding) router.replace("/dashboard");
    }
  }, [ready, profileReady, session, onboardingDone, segments]);

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();
    if (Platform.OS === "android") {
      Text.defaultProps = Text.defaultProps ?? {};
      Text.defaultProps.style = { fontFamily: "Inter_400Regular" };
    }
  }, [fontsLoaded]);

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
    if (USE_MOCK) return; // expo-notifications not loaded in mock mode
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications: typeof NotificationsType = require("expo-notifications");
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
