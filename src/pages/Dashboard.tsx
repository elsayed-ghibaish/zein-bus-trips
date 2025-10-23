
import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import TripCard from '@/components/TripCard';
import UserAvatar from '@/components/UserAvatar';
import { GET_USER_BY_ID, GET_BOOKING_DASHBOARDS } from '@/graphql/queries';
import { useAuthStore } from '@/utils/auth';
import { BookingData } from '@/types/graphql';
import { Bus, Calendar, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  const { data: dashboardData, loading: dashboardLoading } = useQuery(GET_BOOKING_DASHBOARDS);

  const user = userData?.usersPermissionsUser?.data;
  const bookingDashboard = dashboardData?.bookingDashboards?.data?.[0]?.attributes;
  
  const upcomingBookings = user?.attributes?.bookings?.data
    .filter((booking: BookingData) => booking.attributes.trip_status !== 'completed' && booking.attributes.trip_status !== 'cancelled')
    .slice(0, 3);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {userLoading ? (
          <div className="h-64 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* User greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="flex items-center mb-4 md:mb-0">
                <UserAvatar 
                  photoUrl={user?.attributes?.photo?.data?.attributes?.url}
                  firstName={user?.attributes?.first_name}
                  lastName={user?.attributes?.last_name}
                  size="lg"
                  className="ml-4"
                />
                <div>
                  <h1 className="text-2xl font-bold">مرحباً {user?.attributes?.first_name}</h1>
                  <p className="text-gray-600">
                    نوع الاشتراك: {user?.attributes?.subscription || 'اشتراك قياسي'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/book')}
                className="bg-zeinbus-primary hover:bg-zeinbus-secondary"
                size="lg"
              >
                <Bus className="ml-2 h-5 w-5" />
                حجز رحلة جديدة
              </Button>
            </div>

            {/* Booking status */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="ml-2 h-5 w-5 text-zeinbus-primary" />
                    حالة الحجز
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <LoadingSpinner />
                  ) : bookingDashboard ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${bookingDashboard.booking_status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>الحجز {bookingDashboard.booking_status ? 'متاح' : 'غير متاح'} حالياً</span>
                      </div>
                      
                      {bookingDashboard.booking_status && (
                        <>
                          <p>تاريخ بدء الحجز: {new Date(bookingDashboard.booking_start_date).toLocaleDateString('ar-EG')}</p>
                          <p>وقت المغادرة: {typeof bookingDashboard.departure_time === 'string' ? bookingDashboard.departure_time : ''}</p>
                          <p>عدد المقاعد المتاحة: {bookingDashboard.available_bookings_count}</p>
                          
                          {bookingDashboard.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex">
                              <AlertTriangle className="h-5 w-5 text-amber-500 ml-2 flex-shrink-0" />
                              <p className="text-amber-800">{bookingDashboard.notes}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p>لا توجد معلومات متاحة عن حالة الحجز</p>
                  )}
                </CardContent>
                {bookingDashboard?.booking_status && (
                  <CardFooter>
                    <Button 
                      onClick={() => navigate('/book')}
                      className="w-full"
                    >
                      احجز الآن
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>

            {/* Upcoming bookings */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">الرحلات القادمة</h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/trips')}
                >
                  عرض الكل
                </Button>
              </div>

              {userLoading ? (
                <LoadingSpinner />
              ) : upcomingBookings && upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingBookings.map((booking: BookingData) => (
                    <TripCard key={booking.id} trip={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Bus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">لا توجد رحلات قادمة</h3>
                      <p className="text-gray-500 mb-4">لم تقم بحجز أي رحلات قادمة بعد</p>
                      <Button 
                        onClick={() => navigate('/book')}
                        className="bg-zeinbus-primary hover:bg-zeinbus-secondary"
                      >
                        حجز رحلة جديدة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
