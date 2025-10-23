
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zein.bustrips',
  appName: 'Zein-Bus-Trips',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      importance: "high",
      sound: "notification.wav",
      iconColor: "#488AFF",
      icon: "ic_stat_icon"
    }
  },
  server: {
    // استخدام الوضع التطويري المحلي بدلاً من الرابط البعيد
    androidScheme: "https",
    // يمكن أيضًا استخدام العنوان الداخلي للجهاز
    // url: "http://10.0.2.2:8080",
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
