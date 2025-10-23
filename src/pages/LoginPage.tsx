
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LOGIN } from '@/graphql/mutations';
import { useAuthStore } from '@/utils/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      console.log('Login successful:', data);
      const { jwt, user } = data.login;
      login(jwt, user.id);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً، ${user.username}!`,
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    console.log('Attempting login with:', { identifier, password });
    
    loginMutation({
      variables: {
        identifier,
        password,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 auth-pattern">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="text-zeinbus-primary" />
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات الدخول للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
                <Input
                  id="email"
                  placeholder="example@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                  <Label htmlFor="password">كلمة المرور</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-zeinbus-primary hover:bg-zeinbus-secondary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : "تسجيل الدخول"}
              </Button>
              <div className="text-center text-sm">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
