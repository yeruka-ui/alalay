export type NotificationSessionDependencies = {
  configureNotifications: () => Promise<void>;
  requestNotificationPermissions: () => Promise<boolean>;
  syncAllPendingNotifications: (userId: string) => Promise<void>;
};

export async function initializeNotificationSession(
  userId: string,
  dependencies: NotificationSessionDependencies
): Promise<boolean> {
  await dependencies.configureNotifications();

  const granted = await dependencies.requestNotificationPermissions();
  if (!granted) return false;

  await dependencies.syncAllPendingNotifications(userId);
  return true;
}
