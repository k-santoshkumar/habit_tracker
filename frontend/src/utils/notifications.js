import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const TABLET_NOTIFICATION_OFFSET = 100000;
const POMODORO_NOTIFICATION_ID = 900001;

const isNative = Capacitor.isNativePlatform();

function parseTimeToNextDate(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    return scheduled;
}

function toNotificationId(rawId, offset = 0) {
    let hash = 0;
    const value = String(rawId);
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) + offset;
}

async function ensureNativePermissions() {
    if (!isNative) {
        return { display: 'granted' };
    }

    const permissions = await LocalNotifications.checkPermissions();
    if (permissions.display === 'granted') {
        return permissions;
    }

    return LocalNotifications.requestPermissions();
}

async function ensureExactAlarmPermission() {
    if (!isNative || Capacitor.getPlatform() !== 'android') {
        return;
    }

    const settings = await LocalNotifications.checkExactNotificationSetting();
    if (settings.value === 'granted') {
        return;
    }

    await LocalNotifications.changeExactNotificationSetting();
}

export async function requestNotificationAccess() {
    if (isNative) {
        const permissions = await ensureNativePermissions();
        if (permissions.display !== 'granted') {
            return false;
        }
        await ensureExactAlarmPermission();
        return true;
    }

    if (!('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export async function showInstantNotification(title, body) {
    const allowed = await requestNotificationAccess();
    if (!allowed) {
        return false;
    }

    if (isNative) {
        await LocalNotifications.schedule({
            notifications: [{
                id: Date.now() % 2147483000,
                title,
                body,
                schedule: { at: new Date(Date.now() + 1000) }
            }]
        });
        return true;
    }

    new Notification(title, { body });
    return true;
}

export async function syncTabletReminders(tablets, enabled) {
    if (!isNative) {
        return;
    }

    const notificationIds = tablets.map((tablet) => toNotificationId(tablet.id, TABLET_NOTIFICATION_OFFSET));

    if (notificationIds.length > 0) {
        await LocalNotifications.cancel({ notifications: notificationIds.map((id) => ({ id })) });
    }

    if (!enabled || tablets.length === 0) {
        return;
    }

    const allowed = await requestNotificationAccess();
    if (!allowed) {
        return;
    }

    const notifications = tablets
        .filter((tablet) => tablet.reminder_time)
        .map((tablet) => ({
            id: toNotificationId(tablet.id, TABLET_NOTIFICATION_OFFSET),
            title: tablet.critical ? `Critical tablet: ${tablet.name}` : `Tablet reminder: ${tablet.name}`,
            body: `${tablet.dose} • ${tablet.frequency}${tablet.timing ? ` • ${tablet.timing}` : ''}`,
            schedule: {
                at: parseTimeToNextDate(tablet.reminder_time),
                repeats: true,
                every: 'day',
                allowWhileIdle: true
            },
            extra: {
                tabletId: tablet.id
            }
        }));

    if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
    }
}

export async function schedulePomodoroNotification({ title, body, endsAt }) {
    const allowed = await requestNotificationAccess();
    if (!allowed) {
        return false;
    }

    if (isNative) {
        await LocalNotifications.cancel({ notifications: [{ id: POMODORO_NOTIFICATION_ID }] });
        await LocalNotifications.schedule({
            notifications: [{
                id: POMODORO_NOTIFICATION_ID,
                title,
                body,
                schedule: {
                    at: endsAt,
                    allowWhileIdle: true
                }
            }]
        });
        return true;
    }

    const delay = endsAt.getTime() - Date.now();
    if (delay > 0) {
        window.setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        }, delay);
        return true;
    }

    return false;
}

export async function cancelPomodoroNotification() {
    if (!isNative) {
        return;
    }

    await LocalNotifications.cancel({ notifications: [{ id: POMODORO_NOTIFICATION_ID }] });
}
