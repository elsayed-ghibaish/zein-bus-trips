
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CREATE_BOOKING } from "@/graphql/mutations";
import {
  GET_USER_BY_ID,
  GET_BOOKING_DASHBOARDS,
  GET_AREAS,
} from "@/graphql/queries";
import { useAuthStore } from "@/utils/auth";
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Wallet,
  AlertTriangle,
  MapPin,
  Users,
  CheckCircle,
  Send,
  ChevronDown,
  Bus,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookingFormData } from "@/types/graphql";
import {
  calculateTripCost,
  generateAvailableDays,
  calculateAvailableSeats,
} from "@/utils/booking-utils";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";

// Interface for simplified place data to match our TripPoint usage
interface PlaceInfo {
  place_name: string;
  one_way_price?: number;
  return_price?: number;
  round_trip_price?: number;
  timing?: string[];
}

const INITIAL_FORM_DATA: BookingFormData = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  date: "",
  trip_type: "",
  area: "",
  start_point: "",
  destination: "",
  start_time: "",
  end_time: "",
  seats: "",
  payment_type: "cash",
  trip_cost: "0",
  user_id: "",
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuthStore();

  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM_DATA);
  const [selectedAreaPlaces, setSelectedAreaPlaces] = useState<PlaceInfo[]>([]);
  const [showDateDrawer, setShowDateDrawer] = useState(false);
  const [showTripTypeDrawer, setShowTripTypeDrawer] = useState(false);
  const [showStartPointDrawer, setShowStartPointDrawer] = useState(false);
  const [showSeatsDrawer, setShowSeatsDrawer] = useState(false);
  const [showReturnTimeDrawer, setShowReturnTimeDrawer] = useState(false);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);

  // Fetch user data
  const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  // Fetch booking dashboard data
  const { data: dashboardData, loading: dashboardLoading } = useQuery(
    GET_BOOKING_DASHBOARDS
  );

  // Fetch areas data
  const { data: areasData, loading: areasLoading } = useQuery(GET_AREAS);

  const user = userData?.usersPermissionsUser?.data;
  const bookingDashboard =
    dashboardData?.bookingDashboards?.data?.[0]?.attributes;
  const areas = areasData?.areas?.data || [];

  // Initialize form data with user information
  useEffect(() => {
    if (user?.attributes) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.attributes.first_name,
        last_name: user.attributes.last_name,
        email: user.attributes.email,
        phone: user.attributes.phone_number,
        destination: user.attributes.university || "جامعة الجلالة",
        area: user.attributes.area,
        start_point: user.attributes.start_point || "",
        user_id: user.id,
      }));
    }
  }, [user]);

  // Update selected area places when area changes
  useEffect(() => {
    if (areas.length > 0 && formData.area) {
      const selectedArea = areas.find(
        (area) => area.attributes.name === formData.area
      );

      if (selectedArea) {
        // Convert PlaceData to PlaceInfo format we need
        const places = selectedArea.attributes.places.data.map((place) => ({
          place_name: place.attributes.place_name,
          one_way_price: place.attributes.one_way_price,
          return_price: place.attributes.return_price,
          round_trip_price: place.attributes.round_trip_price,
          timing: place.attributes.timing,
        }));
        setSelectedAreaPlaces(places);
      } else {
        setSelectedAreaPlaces([]);
      }
    }
  }, [formData.area, areas]);

  // Create booking mutation
  const [createBooking, { loading: bookingLoading }] = useMutation(
    CREATE_BOOKING,
    {
      onCompleted: (data) => {
        toast({
          title: "تم حجز الرحلة بنجاح",
          description: "يمكنك الآن مشاهدة تفاصيل الرحلة في قائمة رحلاتي",
          variant: "default",
        });
        navigate(`/trips/${data.createBooking.data.id}`);
      },
      onError: (error) => {
        toast({
          title: "خطأ في حجز الرحلة",
          description: error.message,
          variant: "destructive",
        });
      },
      refetchQueries: [
        {
          query: GET_BOOKING_DASHBOARDS,
        },
        {
          query: GET_USER_BY_ID,
          variables: { id: userId },
        },
      ],
    }
  );

  // Available days for booking
  const availableDays = useMemo(() => {
    if (!bookingDashboard) return [];

    return generateAvailableDays(
      bookingDashboard.booking_start_date || new Date(),
      bookingDashboard.booking_days_count || 7,
      bookingDashboard.cancel_friday_booking || false,
      bookingDashboard.end_of_day_time
    );
  }, [bookingDashboard]);

  // Set initial date when available
  useEffect(() => {
    if (availableDays.length > 0 && !formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: availableDays[0].value,
      }));
    }
  }, [availableDays]);

  // Selected place calculation
  const selectedPlace = useMemo(() => {
    if (!selectedAreaPlaces.length || !formData.start_point) return null;
    return (
      selectedAreaPlaces.find(
        (place) => place.place_name === formData.start_point
      ) || null
    );
  }, [selectedAreaPlaces, formData.start_point]);

  // Trip cost calculation
  const tripCost = useMemo(() => {
    return calculateTripCost(formData.trip_type, formData.seats, selectedPlace);
  }, [formData.trip_type, formData.seats, selectedPlace]);

  // Update trip cost in form data
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      trip_cost: tripCost.toString(),
    }));
  }, [tripCost]);

  // Handle trip type change
  const handleTripTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      trip_type: value,
      // Reset end_time if changing away from return trips
      end_time: value === "ذهاب" ? "" : prev.end_time,
    }));
    setShowTripTypeDrawer(false);
  };

  // Handle payment type change
  const handlePaymentTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      payment_type: value,
    }));
    setShowPaymentDrawer(false);
  };

  // Calculate available seats for booking
  const availableSeatsAfterBooking = useMemo(() => {
    // This is a placeholder for the actual calculation
    // In a real implementation, you would calculate based on booked seats
    const totalOutboundSeats = 0; // This should come from booking data
    const totalReturnSeats = 0; // This should come from booking data

    return calculateAvailableSeats(
      formData.trip_type,
      bookingDashboard?.available_bookings_count || 0,
      totalOutboundSeats,
      totalReturnSeats
    );
  }, [formData.trip_type, bookingDashboard]);

  // Handle form submission
  const handleSubmit = () => {
    if (!bookingDashboard?.booking_status) {
      toast({
        title: "الحجز غير متاح حالياً",
        description: "يرجى المحاولة في وقت لاحق",
        variant: "destructive",
      });
      return;
    }

    if (!formData.trip_type) {
      toast({
        title: "يرجى اختيار نوع الرحلة",
        variant: "destructive",
      });
      return;
    }

    if (formData.trip_type !== "عودة" && !formData.start_point) {
      toast({
        title: "يرجى اختيار نقطة التحرك",
        variant: "destructive",
      });
      return;
    }

    if (!formData.seats || parseInt(formData.seats) <= 0) {
      toast({
        title: "يرجى اختيار عدد المقاعد",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.seats) > 4) {
      toast({
        title: "تجاوزت الحد الأقصى للمقاعد",
        description: "يمكنك حجز 4 مقاعد كحد أقصى",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.seats) > bookingDashboard.available_bookings_count) {
      toast({
        title: "عدد المقاعد المتاحة غير كافي",
        description: `عدد المقاعد المتاحة حالياً: ${bookingDashboard.available_bookings_count}`,
        variant: "destructive",
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: "يرجى اختيار تاريخ الرحلة",
        variant: "destructive",
      });
      return;
    }

    if (
      (formData.trip_type === "عودة" || formData.trip_type === "ذهاب وعودة") &&
      !formData.end_time
    ) {
      toast({
        title: "يرجى اختيار وقت العودة",
        variant: "destructive",
      });
      return;
    }

    // Get the departure time
    let departureTime = "";
    if (typeof bookingDashboard.departure_time === "string") {
      departureTime = bookingDashboard.departure_time;
    } else if (
      Array.isArray(bookingDashboard.departure_time) &&
      bookingDashboard.departure_time.length > 0
    ) {
      const firstTime = bookingDashboard.departure_time[0];
      departureTime =
        typeof firstTime === "string" ? firstTime : firstTime?.value || "09:00";
    } else {
      departureTime = "09:00"; // Default fallback
    }

    // Create the booking
    createBooking({
      variables: {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        destination: formData.destination,
        date: formData.date,
        tripType: formData.trip_type,
        tripCost: parseInt(formData.trip_cost),
        area: formData.area,
        startPoint: formData.start_point,
        startTime: departureTime,
        endTime: formData.end_time || "09:00", // Default end time
        seats: parseInt(formData.seats),
        // trip_Status: "pending",
        paymentType: formData.payment_type,
        // paymentStatus: "pending",
        userId: formData.user_id,
        publishedAt: new Date().toISOString(),
      },
    });
  };

  if (userLoading || dashboardLoading || areasLoading) {
    return (
      <Layout>
        <div className="h-64 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Check if booking is available
  const isBookingAvailable = bookingDashboard?.booking_status;

  // Available seat options
  const seatOptions = Array.from(
    { length: Math.min(availableSeatsAfterBooking, 4) },
    (_, i) => i + 1
  );

  // Format date for display
  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return "اختر تاريخ الرحلة";
    const day = availableDays.find(d => d.value === dateStr);
    return day ? day.label : "اختر تاريخ الرحلة";
  };

  // Format trip type for display
  const formatTripType = (type: string) => {
    switch (type) {
      case "ذهاب": return "ذهاب إلى الجامعة";
      case "عودة": return "عودة من الجامعة";
      case "ذهاب وعودة": return "ذهاب وعودة";
      default: return "اختر نوع الرحلة";
    }
  };

  // Format payment type for display
  const formatPaymentType = (type: string) => {
    switch (type) {
      case "cash": return "كاش";
      case "card": return "بطاقة ائتمان";
      case "wallet": return "محفظة إلكترونية";
      default: return "اختر طريقة الدفع";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in rtl">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-center slide-up">
            <h1 className="text-2xl font-bold mb-6">حجز رحلة جديدة</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              قم باختيار التفاصيل المناسبة لرحلتك
            </p>
          </div>

          <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-md hover-shadow pop-in">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Calendar className="ml-2 h-6 w-6" />
                تفاصيل الرحلة
              </CardTitle>
              <CardDescription className="text-white/90">
                اختر تاريخ الرحلة وعدد المقاعد وطريقة الدفع
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Booking status alert */}
              {!isBookingAvailable && (
                <div className="bg-red-50 dark:bg-red-900/20 border-r-4 border-red-600 rounded-md p-4 flex items-start rtl-slide-in">
                  <AlertTriangle className="h-5 w-5 text-red-600 ml-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300">
                      الحجز غير متاح حالياً
                    </h3>
                    <p className="text-red-700 dark:text-red-400 mt-1">
                      يرجى المحاولة في وقت لاحق أو التواصل مع إدارة النقل للمزيد
                      من المعلومات.
                    </p>
                  </div>
                </div>
              )}

              {/* Trip details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Clock className="ml-2 h-5 w-5 text-red-600" />
                  معلومات الرحلة
                </h3>

                {/* Date selection */}
                <Drawer open={showDateDrawer} onOpenChange={setShowDateDrawer}>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                      disabled={!isBookingAvailable || bookingLoading}
                    >
                      <span className="flex items-center">
                        <Calendar className="ml-2 h-5 w-5 text-red-600" />
                        <span>{formatSelectedDate(formData.date)}</span>
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="rtl">
                    <DrawerHeader>
                      <DrawerTitle className="text-lg font-bold">اختر تاريخ الرحلة</DrawerTitle>
                      <DrawerDescription>
                        حدد التاريخ المناسب لرحلتك
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-2">
                      <div className="grid gap-4 py-4">
                        {availableDays.map((day) => (
                          <Button
                            key={day.value}
                            variant={formData.date === day.value ? "default" : "outline"}
                            className={`w-full justify-start text-right py-6 ${
                              formData.date === day.value ? "bg-red-600 hover:bg-red-700" : ""
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, date: day.value }));
                              setShowDateDrawer(false);
                            }}
                          >
                            <Calendar className="ml-3 h-5 w-5" />
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">إغلاق</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                {/* Trip type selection */}
                <Drawer open={showTripTypeDrawer} onOpenChange={setShowTripTypeDrawer}>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                      disabled={!isBookingAvailable || bookingLoading}
                    >
                      <span className="flex items-center">
                        <Bus className="ml-2 h-5 w-5 text-red-600" />
                        <span>{formatTripType(formData.trip_type)}</span>
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="rtl">
                    <DrawerHeader>
                      <DrawerTitle className="text-lg font-bold">اختر نوع الرحلة</DrawerTitle>
                      <DrawerDescription>
                        حدد نوع الرحلة المناسب لك
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-2">
                      <RadioGroup
                        value={formData.trip_type}
                        onValueChange={handleTripTypeChange}
                        className="grid gap-4 py-4"
                      >
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.trip_type === "ذهاب" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="ذهاب" id="outbound" className="text-red-600" />
                            <Label htmlFor="outbound" className="font-medium cursor-pointer">ذهاب إلى الجامعة</Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.trip_type === "ذهاب" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                        
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.trip_type === "عودة" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="عودة" id="return" className="text-red-600" />
                            <Label htmlFor="return" className="font-medium cursor-pointer">عودة من الجامعة</Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.trip_type === "عودة" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                        
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.trip_type === "ذهاب وعودة" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="ذهاب وعودة" id="round" className="text-red-600" />
                            <Label htmlFor="round" className="font-medium cursor-pointer">ذهاب وعودة</Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.trip_type === "ذهاب وعودة" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                      </RadioGroup>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">إغلاق</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                {/* Start point */}
                {(formData.trip_type === "ذهاب" ||
                  formData.trip_type === "ذهاب وعودة") && (
                  <Drawer open={showStartPointDrawer} onOpenChange={setShowStartPointDrawer}>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                        disabled={!isBookingAvailable || !formData.area || bookingLoading}
                      >
                        <span className="flex items-center">
                          <MapPin className="ml-2 h-5 w-5 text-red-600" />
                          <span>{formData.start_point || "اختر نقطة التحرك"}</span>
                        </span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="rtl">
                      <DrawerHeader>
                        <DrawerTitle className="text-lg font-bold">اختر نقطة التحرك</DrawerTitle>
                        <DrawerDescription>
                          حدد نقطة الانطلاق المناسبة لك
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 py-2">
                        <div className="grid gap-4 py-4">
                          {selectedAreaPlaces.map((place) => (
                            <Button
                              key={place.place_name}
                              variant={formData.start_point === place.place_name ? "default" : "outline"}
                              className={`w-full justify-start text-right py-6 ${
                                formData.start_point === place.place_name ? "bg-red-600 hover:bg-red-700" : ""
                              }`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, start_point: place.place_name }));
                                setShowStartPointDrawer(false);
                              }}
                            >
                              <MapPin className="ml-3 h-5 w-5" />
                              {place.place_name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">إغلاق</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}

                {/* End time for return trips */}
                {(formData.trip_type === "عودة" ||
                  formData.trip_type === "ذهاب وعودة") && (
                  <Drawer open={showReturnTimeDrawer} onOpenChange={setShowReturnTimeDrawer}>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                        disabled={!isBookingAvailable || bookingLoading}
                      >
                        <span className="flex items-center">
                          <Clock className="ml-2 h-5 w-5 text-red-600" />
                          <span>{formData.end_time || "اختر وقت العودة"}</span>
                        </span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="rtl">
                      <DrawerHeader>
                        <DrawerTitle className="text-lg font-bold">اختر وقت العودة</DrawerTitle>
                        <DrawerDescription>
                          حدد وقت العودة المناسب لك
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 py-2">
                        <div className="grid gap-4 py-4">
                          {bookingDashboard?.departure_time.map((time) => (
                            <Button
                              key={time.value}
                              variant={formData.end_time === time.value ? "default" : "outline"}
                              className={`w-full justify-start text-right py-6 ${
                                formData.end_time === time.value ? "bg-red-600 hover:bg-red-700" : ""
                              }`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, end_time: time.value }));
                                setShowReturnTimeDrawer(false);
                              }}
                            >
                              <Clock className="ml-3 h-5 w-5" />
                              {time.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">إغلاق</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>

              <Separator className="my-4" />

              {/* Booking options */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <Users className="ml-2 h-5 w-5 text-red-600" />
                  خيارات الحجز
                </h3>

                {/* Seats selection */}
                <Drawer open={showSeatsDrawer} onOpenChange={setShowSeatsDrawer}>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                      disabled={!isBookingAvailable || !formData.trip_type || bookingLoading}
                    >
                      <span className="flex items-center">
                        <Users className="ml-2 h-5 w-5 text-red-600" />
                        <span>{formData.seats ? `${formData.seats} مقاعد` : "اختر عدد المقاعد"}</span>
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="rtl">
                    <DrawerHeader>
                      <DrawerTitle className="text-lg font-bold">اختر عدد المقاعد</DrawerTitle>
                      <DrawerDescription>
                        (الحد الأقصى 4 مقاعد) - المقاعد المتاحة: {bookingDashboard?.available_bookings_count || 0}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-2">
                      <div className="grid grid-cols-2 gap-4 py-4">
                        {seatOptions.length > 0 ? (
                          seatOptions.map((seat) => (
                            <Button
                              key={seat}
                              variant={formData.seats === seat.toString() ? "default" : "outline"}
                              className={`py-6 text-lg ${
                                formData.seats === seat.toString() ? "bg-red-600 hover:bg-red-700" : ""
                              }`}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, seats: seat.toString() }));
                                setShowSeatsDrawer(false);
                              }}
                            >
                              {seat}
                            </Button>
                          ))
                        ) : (
                          <p className="col-span-2 text-center text-gray-500 dark:text-gray-400">لا توجد مقاعد متاحة</p>
                        )}
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">إغلاق</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                {/* Payment method */}
                <Drawer open={showPaymentDrawer} onOpenChange={setShowPaymentDrawer}>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-right rtl pr-4 py-6 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                      disabled={!isBookingAvailable || bookingLoading}
                    >
                      <span className="flex items-center">
                        <DollarSign className="ml-2 h-5 w-5 text-red-600" />
                        <span>{formatPaymentType(formData.payment_type)}</span>
                      </span>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="rtl">
                    <DrawerHeader>
                      <DrawerTitle className="text-lg font-bold">اختر طريقة الدفع</DrawerTitle>
                      <DrawerDescription>
                        حدد طريقة الدفع المناسبة لك
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 py-2">
                      <RadioGroup
                        value={formData.payment_type}
                        onValueChange={handlePaymentTypeChange}
                        className="grid gap-4 py-4"
                      >
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.payment_type === "cash" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="cash" id="cash" className="text-red-600" />
                            <Label htmlFor="cash" className="font-medium cursor-pointer flex items-center">
                              كاش
                              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                            </Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.payment_type === "cash" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                        
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.payment_type === "card" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="card" id="card" className="text-red-600" />
                            <Label htmlFor="card" className="font-medium cursor-pointer flex items-center">
                              بطاقة ائتمان
                              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                            </Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.payment_type === "card" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                        
                        <div className={`flex items-center justify-between rounded-lg border p-4 ${formData.payment_type === "wallet" ? "border-red-600 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="wallet" id="wallet" className="text-red-600" />
                            <Label htmlFor="wallet" className="font-medium cursor-pointer flex items-center">
                              محفظة إلكترونية
                              <Wallet className="mr-2 h-5 w-5 text-purple-600" />
                            </Label>
                          </div>
                          <CheckCircle className={`h-5 w-5 ${formData.payment_type === "wallet" ? "text-red-600" : "text-transparent"}`} />
                        </div>
                      </RadioGroup>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">إغلاق</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>

              <Separator className="my-4" />

              {/* Booking summary */}
              <div className="space-y-3 pop-in">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <DollarSign className="ml-2 h-5 w-5 text-red-600" />
                  ملخص الحجز
                </h3>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-5 border border-gray-200 dark:border-gray-700">
                  {selectedPlace && formData.trip_type && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">نقطة التحرك:</span>
                      <span className="font-medium">
                        {formData.start_point || "غير محدد"}
                      </span>
                    </div>
                  )}

                  {formData.trip_type && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">نوع الرحلة:</span>
                      <span className="font-medium">{formData.trip_type}</span>
                    </div>
                  )}

                  {formData.start_point &&
                    selectedPlace &&
                    (selectedPlace.one_way_price ||
                      selectedPlace.return_price ||
                      selectedPlace.round_trip_price) && (
                      <>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700 dark:text-gray-300">سعر المقعد:</span>
                          <span className="font-medium">
                            {formData.trip_type === "ذهاب" &&
                            selectedPlace.one_way_price
                              ? `${selectedPlace.one_way_price} جنيه`
                              : formData.trip_type === "عودة" &&
                                selectedPlace.return_price
                              ? `${selectedPlace.return_price} جنيه`
                              : formData.trip_type === "ذهاب وعودة" &&
                                selectedPlace.round_trip_price
                              ? `${selectedPlace.round_trip_price} جنيه`
                              : "50 جنيه"}
                          </span>
                        </div>
                      </>
                    )}

                  {formData.seats && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">عدد المقاعد:</span>
                      <span className="font-medium">{formData.seats}</span>
                    </div>
                  )}

                  <Separator className="my-3 dark:bg-gray-700" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-red-600 dark:text-red-400">
                      {formData.trip_cost} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-6 rtl"
                disabled={
                  !isBookingAvailable ||
                  bookingLoading ||
                  !formData.trip_type ||
                  !formData.date
                }
                onClick={handleSubmit}
              >
                {bookingLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>تأكيد الحجز وإتمام الدفع</span>
                    <Send className="mr-2 h-5 w-5 rotate-12" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
