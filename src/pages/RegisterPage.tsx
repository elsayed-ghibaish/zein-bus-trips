
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';
import { REGISTER } from '@/graphql/mutations';
import { GET_AREAS, GET_UNIVERSITIES } from '@/graphql/queries';
import { useAuthStore } from '@/utils/auth';
import { AreaData, UniversityData } from '@/types/graphql';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [area, setArea] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [step, setStep] = useState(1);

  // Fetch areas and universities data
  const { data: areasData, loading: areasLoading } = useQuery(GET_AREAS);
  const { data: universitiesData, loading: universitiesLoading } = useQuery(GET_UNIVERSITIES);
  
  const areas = areasData?.areas?.data || [];
  const universities = universitiesData?.universities?.data || [];
  
  // Get places for selected area
  const selectedArea = areas.find((a: AreaData) => a.attributes.name === area);
  const places = selectedArea?.attributes.places.data || [];
  
  // Get faculties for selected university
  const selectedUniversity = universities.find(
    (u: UniversityData) => u.attributes.university_name === university
  );
  const faculties = selectedUniversity?.attributes.colleges.data || [];

  // Register mutation
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      const { jwt, user } = data.register;
      login(jwt, user.id);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً، ${user.username}!`,
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleNextStep = () => {
    if (step === 1) {
      if (!username || !email || !password || !confirmPassword) {
        toast({
          title: "خطأ في النموذج",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "خطأ في النموذج",
          description: "كلمات المرور غير متطابقة",
          variant: "destructive",
        });
        return;
      }
      
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phoneNumber || !area || !startPoint || !university || !faculty) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    registerMutation({
      variables: {
        username,
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        area,
        startPoint,
        university,
        faculty
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
            <CardTitle>إنشاء حساب جديد</CardTitle>
            <CardDescription>
              {step === 1 ? 'أدخل بيانات الحساب الأساسية' : 'أدخل بياناتك الشخصية'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            <CardContent className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">الاسم الأول</Label>
                      <Input
                        id="firstName"
                        placeholder="الاسم الأول"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">اسم العائلة</Label>
                      <Input
                        id="lastName"
                        placeholder="اسم العائلة"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="text-right"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="رقم الهاتف"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">المنطقة</Label>
                    {areasLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Select value={area} onValueChange={setArea}>
                        <SelectTrigger id="area" className="text-right">
                          <SelectValue placeholder="اختر المنطقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area: AreaData) => (
                            <SelectItem key={area.id} value={area.attributes.name}>
                              {area.attributes.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startPoint">نقطة الانطلاق</Label>
                    <Select 
                      value={startPoint} 
                      onValueChange={setStartPoint} 
                      disabled={!area || places.length === 0}
                    >
                      <SelectTrigger id="startPoint" className="text-right">
                        <SelectValue placeholder="اختر نقطة الانطلاق" />
                      </SelectTrigger>
                      <SelectContent>
                        {places.map((place: any) => (
                          <SelectItem key={place.id} value={place.attributes.place_name}>
                            {place.attributes.place_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">الجامعة</Label>
                    {universitiesLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Select value={university} onValueChange={setUniversity}>
                        <SelectTrigger id="university" className="text-right">
                          <SelectValue placeholder="اختر الجامعة" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni: UniversityData) => (
                            <SelectItem key={uni.id} value={uni.attributes.university_name}>
                              {uni.attributes.university_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">الكلية</Label>
                    <Select 
                      value={faculty} 
                      onValueChange={setFaculty}
                      disabled={!university || faculties.length === 0}
                    >
                      <SelectTrigger id="faculty" className="text-right">
                        <SelectValue placeholder="اختر الكلية" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((fac: any) => (
                          <SelectItem key={fac.id} value={fac.attributes.faculty_name}>
                            {fac.attributes.faculty_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className={`flex ${step === 1 ? 'justify-between' : 'flex-col space-y-4'}`}>
              {step === 1 ? (
                <>
                  <Link to="/login">
                    <Button type="button" variant="outline">العودة لتسجيل الدخول</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="bg-zeinbus-primary hover:bg-zeinbus-secondary"
                  >
                    التالي
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-between w-full">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handlePrevStep}
                    >
                      السابق
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-zeinbus-primary hover:bg-zeinbus-secondary"
                      disabled={registerLoading}
                    >
                      {registerLoading ? <LoadingSpinner size="sm" /> : "إنشاء الحساب"}
                    </Button>
                  </div>
                </>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
