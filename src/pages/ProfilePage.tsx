
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GET_USER_BY_ID, GET_AREAS, GET_UNIVERSITIES } from '@/graphql/queries';
import { UPDATE_USER, UPLOAD_PHOTO } from '@/graphql/mutations';
import { useAuthStore } from '@/utils/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import UserAvatar from '@/components/UserAvatar';
import { AreaData, UniversityData } from '@/types/graphql';
import { Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userId } = useAuthStore();
  const { toast } = useToast();
  
  // Fetch user data
  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  // Fetch areas and universities data
  const { data: areasData, loading: areasLoading } = useQuery(GET_AREAS);
  const { data: universitiesData, loading: universitiesLoading } = useQuery(GET_UNIVERSITIES);
  
  const user = userData?.usersPermissionsUser?.data;
  const areas = areasData?.areas?.data || [];
  const universities = universitiesData?.universities?.data || [];
  
  // Form state
  const [firstName, setFirstName] = useState(user?.attributes?.first_name || '');
  const [lastName, setLastName] = useState(user?.attributes?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.attributes?.phone_number || '');
  const [area, setArea] = useState(user?.attributes?.area || '');
  const [startPoint, setStartPoint] = useState(user?.attributes?.start_point || '');
  const [university, setUniversity] = useState(user?.attributes?.university || '');
  const [faculty, setFaculty] = useState(user?.attributes?.faculty || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get places for selected area
  const selectedArea = areas.find((a: AreaData) => a.attributes.name === area);
  const places = selectedArea?.attributes.places.data || [];
  
  // Get faculties for selected university
  const selectedUniversity = universities.find(
    (u: UniversityData) => u.attributes.university_name === university
  );
  const faculties = selectedUniversity?.attributes.colleges.data || [];

  // Update user mutation
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast({
        title: "تم تحديث البيانات بنجاح",
      });
      setIsEditing(false);
      refetchUser();
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Upload photo mutation
  const [uploadPhoto, { loading: uploadLoading }] = useMutation(UPLOAD_PHOTO, {
    onCompleted: () => {
      toast({
        title: "تم تحديث الصورة بنجاح",
      });
      refetchUser();
      setPhotoFile(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث الصورة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFirstName(user.attributes.first_name || '');
      setLastName(user.attributes.last_name || '');
      setPhoneNumber(user.attributes.phone_number || '');
      setArea(user.attributes.area || '');
      setStartPoint(user.attributes.start_point || '');
      setUniversity(user.attributes.university || '');
      setFaculty(user.attributes.faculty || '');
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      
      // Upload photo immediately when selected
      uploadPhoto({
        variables: {
          file: e.target.files[0],
          userId
        }
      });
    }
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

    updateUser({
      variables: {
        id: userId,
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

  if (userLoading || areasLoading || universitiesLoading) {
    return (
      <Layout>
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">الملف الشخصي</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>بياناتي الشخصية</CardTitle>
              <CardDescription>
                عرض وتعديل البيانات الشخصية الخاصة بك
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Profile photo */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <UserAvatar 
                    photoUrl={user?.attributes?.photo?.data?.attributes?.url}
                    firstName={user?.attributes?.first_name}
                    lastName={user?.attributes?.last_name}
                    size="lg"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <Camera className="h-6 w-6" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploadLoading}
                  />
                  {uploadLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* User details */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">الاسم الأول</h3>
                      <p>{user?.attributes?.first_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">اسم العائلة</h3>
                      <p>{user?.attributes?.last_name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">البريد الإلكتروني</h3>
                    <p>{user?.attributes?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">رقم الهاتف</h3>
                    <p>{user?.attributes?.phone_number}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">المنطقة</h3>
                      <p>{user?.attributes?.area}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">نقطة الانطلاق</h3>
                      <p>{user?.attributes?.start_point}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">الجامعة</h3>
                      <p>{user?.attributes?.university}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">الكلية</h3>
                      <p>{user?.attributes?.faculty}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">نوع الاشتراك</h3>
                    <p>{user?.attributes?.subscription || 'اشتراك قياسي'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">الاسم الأول</Label>
                      <Input
                        id="firstName"
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">المنطقة</Label>
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
                </form>
              )}
            </CardContent>
            
            <CardFooter>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-zeinbus-primary hover:bg-zeinbus-secondary"
                >
                  تعديل البيانات
                </Button>
              ) : (
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 bg-zeinbus-primary hover:bg-zeinbus-secondary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? <LoadingSpinner size="sm" /> : "حفظ التغييرات"}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
