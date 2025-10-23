
export interface NotificationData {
  id: string;
  attributes: {
    title: string;
    message: string;
    read: boolean;
    users: {
      data: Array<{
        id: string;
        attributes: {
          username: string;
        };
      }>;
    };
  };
}

export interface NotificationsResponse {
  notifications: {
    data: NotificationData[];
  };
}

export interface UpdateNotificationReadResponse {
  updateNotification: {
    data: {
      id: string;
      attributes: {
        read: boolean;
      };
    };
  };
}
