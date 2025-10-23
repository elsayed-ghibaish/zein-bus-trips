
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '@/graphql/mutations';
import { useAuthStore } from '@/utils/auth';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

// محاولة استيراد مكتبة الإشعارات فقط على المنصات المدعومة
let PushNotifications: any = null;
if (Capacitor.isNativePlatform()) {
  import('@capacitor/push-notifications').then(module => {
    PushNotifications = module.PushNotifications;
  }).catch(err => {
    console.error('Error importing push notifications module:', err);
  });
}

// صوت للإشعارات
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3';

export const usePushNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{title: string; body: string} | null>(null);
  const { userId } = useAuthStore();
  const [notificationSound] = useState(new Audio(NOTIFICATION_SOUND));
  const initializationAttempted = useRef(false);
  
  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      console.log('Push token successfully updated in the database');
    },
    onError: (error) => {
      console.error('Failed to update push token:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث رمز الإشعارات",
        variant: "destructive",
      });
    }
  });

  // تشغيل صوت الإشعار
  const playNotificationSound = useCallback(() => {
    try {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [notificationSound]);

  // تحديث رمز المستخدم في قاعدة البيانات
  const updateUserToken = useCallback(async (token: string) => {
    if (!userId) return;
    
    try {
      await updateUser({ 
        variables: { 
          id: userId, 
          expoPushToken: token 
        } 
      });
    } catch (error) {
      console.error('Error updating user token:', error);
    }
  }, [userId, updateUser]);

  // تسجيل الإشعارات للأجهزة المحمولة
  const registerMobilePushNotifications = useCallback(async () => {
    if (!userId || !PushNotifications) return;
    
    try {
      const permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        const requestStatus = await PushNotifications.requestPermissions();
        if (requestStatus.receive !== 'granted') {
          toast({
            title: "تم رفض الإشعارات",
            description: "لن تتلقى إشعارات من التطبيق",
            variant: "destructive",
          });
          return;
        }
      } else if (permissionStatus.receive !== 'granted') {
        toast({
          title: "تم رفض الإشعارات",
          description: "لن تتلقى إشعارات من التطبيق",
          variant: "destructive",
        });
        return;
      }
      
      // التسجيل مع FCM
      await PushNotifications.register();
      
      // إعداد المستمعين للإشعارات
      PushNotifications.addListener('registration', (token: { value: string }) => {
        console.log('Push registration success, token:', token.value);
        setPushToken(token.value);
        updateUserToken(token.value);
      });

      // استقبال الإشعارات في الخلفية
      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push received:', notification);
        playNotificationSound();
        setNotification({
          title: notification.title || 'إشعار جديد',
          body: notification.body || '',
        });
        
        // عرض إشعار محلي
        PushNotifications.createChannel({
          id: 'zein-notifications',
          name: 'Zein Bus Notifications',
          description: 'Zein Bus Trip notifications channel',
          importance: 5,
          visibility: 1,
          sound: 'notification.wav',
          vibration: true
        });
      });

      // التعامل مع الضغط على الإشعار
      PushNotifications.addListener('pushNotificationActionPerformed', 
        (notification: any) => {
          console.log('Push action performed:', notification);
          handleNotificationReceived({
            title: notification.notification.title || 'إشعار جديد',
            body: notification.notification.body || ''
          });
        }
      );
      
      toast({
        title: "تم تفعيل الإشعارات",
        description: "ستتلقى إشعارات لأهم التحديثات",
      });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الإشعارات",
        variant: "destructive",
      });
    }
  }, [userId, playNotificationSound, updateUserToken]);

  // تسجيل إشعارات الويب
  const registerWebPushNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // إنشاء رمز لإشعارات الويب
          const webToken = `web-${Date.now()}`;
          setPushToken(webToken);
          updateUserToken(webToken);
          
          toast({
            title: "تم تفعيل الإشعارات",
            description: "ستتلقى إشعارات لأهم التحديثات",
          });
        } else {
          toast({
            title: "تم رفض الإشعارات",
            description: "لن تتلقى إشعارات من التطبيق",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error registering for web push notifications:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الإشعارات",
        variant: "destructive",
      });
    }
  }, [userId, updateUserToken]);

  // التسجيل للإشعارات بناءً على المنصة
  const registerForPushNotifications = useCallback(async () => {
    if (initializationAttempted.current) return;
    
    initializationAttempted.current = true;
    
    if (Capacitor.isNativePlatform() && PushNotifications) {
      await registerMobilePushNotifications();
    } else if (!Capacitor.isNativePlatform()) {
      await registerWebPushNotifications();
    }
  }, [registerMobilePushNotifications, registerWebPushNotifications]);

  // التعامل مع الإشعارات المستلمة
  const handleNotificationReceived = useCallback((notification: { title: string; body: string }) => {
    setNotification(notification);
    playNotificationSound();
    
    // عرض إشعار
    toast({
      title: notification.title,
      description: notification.body,
    });
  }, [playNotificationSound]);

  useEffect(() => {
    // إعداد مستمعي إشعارات الويب
    if (!Capacitor.isNativePlatform() && 'Notification' in window) {
      // في التنفيذ الحقيقي، ستقوم بإعداد مستمعي أحداث مناسبين لإشعارات دفع الويب
      
      return () => {
        // تنظيف المستمعين
      };
    }
  }, []);

  return {
    pushToken,
    notification,
    registerForPushNotifications,
  };
};
