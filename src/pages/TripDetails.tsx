import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { GET_USER_BY_ID } from "@/graphql/queries";
import { CANCEL_BOOKING } from "@/graphql/mutations";
import { useAuthStore } from "@/utils/auth";
import { BookingData } from "@/types/graphql";
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  DollarSign,
  Users,
  Bus,
  ArrowRight,
} from "lucide-react";

const TripDetails: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user bookings
  const { data: userData, loading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });
  const user = userData?.usersPermissionsUser?.data;
  const allBookings = user?.attributes?.bookings?.data || [];
  const trip = allBookings.find((b: BookingData) => b.id === tripId);

  // Cancellation state
  const [isCancelled, setIsCancelled] = useState(false);
  useEffect(() => {
    if (trip) {
      setIsCancelled(trip.attributes.trip_status === "cancelled");
    }
  }, [trip]);

  // Mutation for cancelling booking
  const [cancelBooking, { loading: cancelLoading }] = useMutation(
    CANCEL_BOOKING,
    {
      onCompleted: () => {
        setIsCancelled(true);
        toast({ title: "تم إلغاء الرحلة", variant: "default" });
      },
      onError: (error) => {
        toast({
          title: "خطأ في إلغاء الرحلة",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  if (loading) {
    return (
      <Layout>
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="h-60 flex flex-col justify-center items-center bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-4">
                لم يتم العثور على الرحلة
              </h3>
              <Button onClick={() => navigate("/trips")}>
                العودة إلى الرحلات
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    destination,
    date,
    trip_type,
    trip_cost,
    trip_status,
    start_time,
    end_time,
    seats,
    payment_type,
    payment_status,
    area,
    start_point,
  } = trip.attributes;

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getStatusColor = () => {
    if (trip_status === "completed") return "bg-green-100 text-green-800";
    if (isCancelled) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  const getPaymentStatusColor = () => {
    if (payment_status === "paid") return "bg-green-100 text-green-800";
    if (payment_status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPaymentTypeIcon = () => {
    if (payment_type === "cash") return <DollarSign className="h-5 w-5" />;
    if (payment_type === "card") return <CreditCard className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="ml-2"
              onClick={() => navigate("/trips")}
            >
              <ArrowRight className="ml-1 h-5 w-5" />
              العودة للرحلات
            </Button>
            <h1 className="text-2xl font-bold">تفاصيل الرحلة</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>رحلة إلى {destination}</CardTitle>
                <div
                  className={`text-sm px-2 py-1 rounded-full ${getStatusColor()}`}
                >
                  {isCancelled
                    ? "ملغية"
                    : trip_status === "completed"
                    ? "مكتملة"
                    : "قادمة"}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trip Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">معلومات الرحلة</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">التاريخ</p>
                        <p>{formattedDate}</p>
                      </div>
                    </div>
                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">الوقت</p>
                        <p>
                          من {start_time} إلى {end_time}
                        </p>
                      </div>
                    </div>
                    {/* Area */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">منطقة الانطلاق</p>
                        <p>{area}</p>
                      </div>
                    </div>
                    {/* Start Point */}
                    <div className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">نقطة الانطلاق</p>
                        <p>{start_point}</p>
                      </div>
                    </div>
                    {/* Trip Type */}
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">نوع الرحلة</p>
                        <p>{trip_type}</p>
                      </div>
                    </div>
                    {/* Seats */}
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-zeinbus-primary" />
                      <div>
                        <p className="text-sm text-gray-500">عدد المقاعد</p>
                        <p>{seats} مقعد</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-zeinbus-primary" />
                    <div>
                      <p className="text-sm text-gray-500">التكلفة</p>
                      <p>{trip_cost} جنيه</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">تفاصيل الدفع</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {getPaymentTypeIcon()}
                      <div>
                        <p className="text-sm text-gray-500">طريقة الدفع</p>
                        <p>
                          {payment_type === "cash"
                            ? "كاش"
                            : payment_type === "card"
                            ? "بطاقة ائتمان"
                            : payment_type === "wallet"
                            ? "محفظة إلكترونية"
                            : payment_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-sm px-2 py-1 rounded-full ${getPaymentStatusColor()}`}
                      >
                        {payment_status ? "تم الدفع" : "لم يتم الدفع"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Passenger Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">معلومات المسافر</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">الاسم</p>
                      <p>
                        {trip.attributes.first_name} {trip.attributes.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                      <p>{trip.attributes.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p>{trip.attributes.phone}</p>
                  </div>
                </div>

                {/* Cancellation Button */}
                {!isCancelled && trip_status !== "completed" && (
                  <div className="border rounded-md p-4 bg-red-50 border-red-200 text-center">
                    <Button
                      variant="destructive"
                      onClick={() =>
                        cancelBooking({
                          variables: {
                            id: tripId,
                            data: {
                              trip_status: "cancelled",
                            },
                          },
                        })
                      }
                      disabled={cancelLoading}
                    >
                      إلغاء الرحلة
                    </Button>
                    <p className="text-xs text-red-600 mt-2">
                      لا يمكن إلغاء الرحلة قبل موعدها بأقل من 24 ساعة
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetails;
