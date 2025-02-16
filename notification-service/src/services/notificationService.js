import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Notifications";

export const saveNotification = async (notification) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...notification,
      type: notification.type, // "forecast", "precipitation", "windSpeed"
      duration: notification.duration, // "7 days", "3 days"
    },
  };

  await ddb.send(new PutCommand(params));
};

export const fetchNotifications = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await ddb.send(new QueryCommand(params));
  return result.Items || [];
};

export const fetchAllNotifications = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const result = await ddb.send(new ScanCommand(params));
  return result.Items || [];
};

export const removeNotification = async (userId, notificationId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId,
      notificationId,
    },
  };

  await ddb.send(new DeleteCommand(params));
};

export const removeAllNotifications = async () => {
  try {
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await ddb.send(new ScanCommand(params));

    if (result.Items && result.Items.length > 0) {
      const deleteRequests = result.Items.map((item) => ({
        DeleteRequest: {
          Key: {
            userId: item.userId,
            notificationId: item.notificationId,
          },
        },
      }));

      const BATCH_SIZE = 25;
      for (let i = 0; i < deleteRequests.length; i += BATCH_SIZE) {
        const batchParams = {
          RequestItems: {
            [TABLE_NAME]: deleteRequests.slice(i, i + BATCH_SIZE),
          },
        };
        await ddb.send(new BatchWriteCommand(batchParams));
      }
    }
  } catch (error) {
    console.error("Error removing all notifications:", error);
    throw error;
  }
};
