
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationsPanel from './NotificationsPanel';
import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '@/graphql/queries';
import { useAuthStore } from '@/utils/auth';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NotificationButton: React.FC = () => {
  const { userId } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data, error } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Notification query error:', error);
    }
  });

  const unreadCount = data?.notifications?.data?.filter(
    (notification: any) => !notification.attributes.read
  ).length || 0;

  return (
    <NotificationsPanel open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative" 
              aria-label="الإشعارات"
              onClick={() => setIsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center shadow-md"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>الإشعارات</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </NotificationsPanel>
  );
};

export default NotificationButton;
