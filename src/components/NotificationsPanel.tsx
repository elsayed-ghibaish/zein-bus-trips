
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, UPDATE_NOTIFICATION_READ } from '@/graphql/queries';
import { NotificationsResponse, NotificationData } from '@/types/notification';
import { useAuthStore } from '@/utils/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsPanelProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  children, 
  open, 
  onOpenChange 
}) => {
  const { userId } = useAuthStore();

  const { data, loading, error, refetch } = useQuery<NotificationsResponse>(GET_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching notifications:', error);
    }
  });

  const [markAsRead] = useMutation(UPDATE_NOTIFICATION_READ, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    }
  });

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.attributes.read) {
      markAsRead({
        variables: { id: notification.id },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md" side="left">
        <SheetHeader className="text-right flex justify-between items-center pb-2 border-b">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
              <X className="h-5 w-5 text-muted-foreground hover:text-red-500" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
          <SheetTitle>الإشعارات</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          {loading ? (
            <div className="flex justify-center p-4">جاري التحميل...</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <div className="text-red-500 font-medium mb-2">حدث خطأ في تحميل الإشعارات</div>
              <div className="text-sm text-muted-foreground">
                يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
              </div>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => refetch()}
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : !data?.notifications?.data || data.notifications.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <div className="text-muted-foreground">لا توجد إشعارات</div>
            </div>
          ) : (
            <div className="space-y-4 rtl">
              {data.notifications.data.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-colors",
                    notification.attributes.read
                      ? "bg-background dark:bg-background"
                      : "bg-muted/50 font-medium border-primary/10 dark:bg-muted/20"
                  )}
                >
                  <h3 className="font-bold">{notification.attributes.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.attributes.message}
                  </p>
                  {!notification.attributes.read && (
                    <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
