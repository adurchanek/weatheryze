import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  NotificationItem,
  NotificationPayload,
  NotificationsState,
} from "../../types/notification";
import { getNotificationsServiceUrl } from "../../../config";

// Initial state
const initialState: NotificationsState = {
  items: null,
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  NotificationItem[], // Return type
  string, // userId
  { rejectValue: string }
>("notifications/fetchNotifications", async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      `/v1/${getNotificationsServiceUrl()}/notifications`,
      { params: { userId } },
    );
    // Response should be an array of NotificationItem
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Unknown error",
    );
  }
});

export const createNotification = createAsyncThunk<
  any,
  NotificationPayload,
  { rejectValue: string }
>("notifications/createNotification", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `/v1/${getNotificationsServiceUrl()}/notifications`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Unknown error",
    );
  }
});

interface DeleteNotificationParams {
  userId: string;
  notificationId: string;
}

export const deleteNotification = createAsyncThunk<
  { notificationId: string },
  DeleteNotificationParams,
  { rejectValue: string }
>("notifications/deleteNotification", async (params, { rejectWithValue }) => {
  const { userId, notificationId } = params;
  try {
    const response = await axiosInstance.delete(
      `/v1/${getNotificationsServiceUrl()}/notifications/${notificationId}`,
      { data: { userId } }, // pass userId in request body
    );
    return { notificationId };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Unknown error",
    );
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchNotifications.fulfilled,
        (state, action: PayloadAction<NotificationItem[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        },
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.items = null;
      });

    builder
      .addCase(createNotification.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.status = "failed";
        if (typeof action.payload === "string") {
          state.error = action.payload;
        } else {
          state.error = "Error creating notification.";
        }
      });

    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { notificationId } = action.payload;
        if (state.items) {
          state.items = state.items.filter(
            (item) => item.notificationId !== notificationId,
          );
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default notificationsSlice.reducer;
