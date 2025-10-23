
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Bus } from "lucide-react";
import { BookingData } from "@/types/graphql";
import { useNavigate } from "react-router-dom";

interface TripCardProps {
  trip: BookingData;
  isPast?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ trip, isPast = false }) => {
  const navigate = useNavigate();

  const {
    destination,
    date,
    trip_status,
    start_time,
    end_time,
    seats,
    payment_status,
    area,
    start_point,
  } = trip.attributes;

  const formattedDate = new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getStatusColor = () => {
    if (trip_status === "completed") return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    if (trip_status === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
  };

  const getPaymentStatusColor = () => {
    if (payment_status === "paid") return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    if (payment_status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  };

  return (
    <Card className="overflow-hidden border-2 border-border hover:border-primary/20 transition-colors rtl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">رحلة إلى {destination}</h3>
          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {trip_status === "completed"
              ? "مكتملة"
              : trip_status === "cancelled"
              ? "ملغية"
              : "قادمة"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              من {start_time} إلى {end_time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {area} - {start_point}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bus className="h-4 w-4" />
            <span>عدد المقاعد: {seats}</span>
          </div>
        </div>
        <div className="mt-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor()}`}
          >
            {payment_status ? "تم الدفع" : "لم يتم الدفع"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/trips/${trip.id}`)}
        >
          عرض التفاصيل
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TripCard;
