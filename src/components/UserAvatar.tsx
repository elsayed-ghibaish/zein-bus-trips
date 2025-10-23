
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from 'react';

interface UserAvatarProps {
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  photoUrl, 
  firstName = "", 
  lastName = "", 
  size = "md",
  className = ""
}) => {
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} />
      ) : null}
      <AvatarFallback className="bg-zeinbus-light text-zeinbus-primary">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
