import { type InferSelectModel } from 'drizzle-orm';
import { notification, notificationDevice } from '@/db/schema';

export type Notification = InferSelectModel<typeof notification>;
export type NotificationDevice = InferSelectModel<typeof notificationDevice>;
