
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripCard from "@/components/TripCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { GET_USER_BY_ID } from "@/graphql/queries";
import { useAuthStore } from "@/utils/auth";
import { BookingData } from "@/types/graphql";
import { Bus } from "lucide-react";

const TripsPage: React.FC = () => {
  const { userId } = useAuthStore();
  const [tab, setTab] = useState("upcoming");
  const tabsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const { data: userData, loading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  const user = userData?.usersPermissionsUser?.data;
  const allBookings = user?.attributes?.bookings?.data || [];

  const upcomingBookings = allBookings.filter(
    (booking: BookingData) =>
      booking.attributes.trip_status !== "completed" &&
      booking.attributes.trip_status !== "cancelled"
  );

  const pastBookings = allBookings.filter(
    (booking: BookingData) =>
      booking.attributes.trip_status === "completed" ||
      booking.attributes.trip_status === "cancelled"
  );

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  // Add touch swipe functionality
  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (!tabsElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX.current;
      
      // If swipe distance is significant (more than 50px)
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          // Swipe right - show upcoming trips
          setTab("upcoming");
        } else {
          // Swipe left - show past trips
          setTab("past");
        }
      }
      
      touchStartX.current = null;
    };

    tabsElement.addEventListener("touchstart", handleTouchStart);
    tabsElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      tabsElement.removeEventListener("touchstart", handleTouchStart);
      tabsElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">رحلاتي</h1>

        <div ref={tabsRef}>
          <Tabs defaultValue="upcoming" value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/80 p-1 rounded-lg">
              <TabsTrigger 
                value="upcoming"
                className="text-md py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              >
                الرحلات القادمة
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="text-md py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
              >
                الرحلات السابقة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="focus:outline-none animate-fade-in">
              {loading ? (
                <div className="h-40 flex justify-center items-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingBookings.map((booking: BookingData) => (
                    <TripCard key={booking.id} trip={booking} />
                  ))}
                </div>
              ) : (
                <div className="h-60 flex flex-col justify-center items-center bg-accent rounded-lg border border-border">
                  <Bus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">
                    لا توجد رحلات قادمة
                  </h3>
                  <p className="text-muted-foreground">لم تقم بحجز أي رحلات قادمة بعد</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="focus:outline-none animate-fade-in">
              {loading ? (
                <div className="h-40 flex justify-center items-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastBookings.map((booking: BookingData) => (
                    <TripCard key={booking.id} trip={booking} isPast />
                  ))}
                </div>
              ) : (
                <div className="h-60 flex flex-col justify-center items-center bg-accent rounded-lg border border-border">
                  <Bus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">
                    لا توجد رحلات سابقة
                  </h3>
                  <p className="text-muted-foreground">لم تقم بأي رحلات سابقة</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TripsPage;
