import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks";
import {
  fetchNotifications,
  deleteNotification,
} from "../../redux/slices/notificationsSlice";
import { NotificationItem } from "../../types/notification";

interface LocationAlertsProps {
  userId: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

const LocationAlerts: React.FC<LocationAlertsProps> = ({
  userId,
  locationName,
  latitude,
  longitude,
}) => {
  const dispatch = useAppDispatch();
  const {
    items: notifications,
    status,
    error,
  } = useAppSelector((state) => state.notifications);

  // Fetch notifications on mount (or whenever userId changes)
  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [userId, dispatch]);

  let locationNotifs: NotificationItem[] = [];
  if (notifications) {
    locationNotifs = notifications.filter((notif) => {
      return notif.location === locationName && notif.userId === userId;
    });
  }

  const handleDelete = (notificationId: string) => {
    dispatch(deleteNotification({ userId, notificationId }));
  };

  if (status === "loading") {
    return <div className="mt-2 text-sm text-gray-500">Loading alerts...</div>;
  }
  if (status === "failed") {
    return (
      <div className="mt-2 text-sm text-red-500">
        Error loading alerts: {error}
      </div>
    );
  }

  if (!locationNotifs.length) {
    return (
      <div className="mt-2 text-sm text-gray-500">
        No alerts for this location.
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {locationNotifs.map((notif) => (
        <div
          key={notif.notificationId}
          className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded"
        >
          <div className="text-sm text-gray-700">
            <strong>{notif.type}</strong> {notif.comparator} {notif.threshold} |{" "}
            Range: {notif.range} day(s)
          </div>
          <button
            onClick={() => handleDelete(notif.notificationId)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default LocationAlerts;
