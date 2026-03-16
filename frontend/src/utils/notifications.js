import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

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

    const request = await LocalNotifications.requestPermissions();

    // On Android 13+ this may require that POST_NOTIFICATIONS is in AndroidManifest
    // and user must allow notifications manually in settings if previously denied.
    return request;
}

async function ensureExactAlarmPermission() {
    if (!isNative || Capacitor.getPlatform() !== 'android') {
        return;
    }

    const settings = await LocalNotifications.checkExactNotificationSetting();
    if (settings.value === 'granted') {
        return;
    }

    try {
        await LocalNotifications.changeExactNotificationSetting();
    } catch (error) {
        console.warn('Exact alarm setting request failed or not available:', error);
    }
}

export async function requestNotificationAccess() {
    if (isNative) {
        const permissions = await ensureNativePermissions();
        if (!permissions || permissions.display !== 'granted') {
            console.warn('Notification permission not granted', permissions);
            return false;
        }

        await ensureExactAlarmPermission();
        return true;
    }

    if (!('Notification' in window)) {
        console.warn('Browser does not support Notification API');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.warn('Browser notification permission denied:', permission);
    }
    return permission === 'granted';
}

export async function getNotificationPermissionStatus() {
    if (isNative) {
        const permissions = await LocalNotifications.checkPermissions();
        const exactInfo = await LocalNotifications.checkExactNotificationSetting().catch(() => null);

        if (!permissions || !permissions.display) {
            return { status: 'prompt', exact: exactInfo?.value || 'unknown' };
        }

        if (permissions.display === 'granted') {
            return { status: 'granted', exact: exactInfo?.value || 'unknown' };
        }

        if (permissions.display === 'denied') {
            return { status: 'denied', exact: exactInfo?.value || 'unknown' };
        }

        return { status: permissions.display, exact: exactInfo?.value || 'unknown' };
    }

    if (!('Notification' in window)) {
        return { status: 'unsupported', exact: 'unsupported' };
    }

    return { status: Notification.permission, exact: 'n/a' };
}

export async function openNotificationSettings() {
    if (isNative) {
        try {
            if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
                await App.openUrl({ url: 'app-settings:' });
                return true;
            }
        } catch (error) {
            console.warn('Failed to open app settings:', error);
            return false;
        }
    }

    if (typeof window !== 'undefined') {
        try {
            window.alert('Please enable notifications in your browser settings.');
            return true;
        } catch {
            return false;
        }
    }

    return false;
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
