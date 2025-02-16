export interface NotificationItem {
  userId: string;
  notificationId: string; // Unique ID from server
  latitude: number;
  longitude: number;
  threshold: string;
  comparator: string; // ">", "<", "="
  interval: number;
  location: string; // "San Diego"
  type: string; // "rain", "snow", "temperature", "wind", etc.
  range: number; // 1, 3, 7, 14
  createdAt?: string;
}

export interface NotificationPayload {
  userId: string;
  latitude: number;
  longitude: number;
  threshold: string;
  comparator: string;
  interval: number;
  location: string;
  type: string;
  range: number;
}

export interface NotificationsState {
  items: NotificationItem[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
