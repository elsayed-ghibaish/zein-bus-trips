
import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img
        src="/logo.svg"
        alt="Logo"
        width={100}
        height={50}
        className="rounded-full hover:scale-105 transition-transform duration-300"
      />
    </Link>
  );
};

export default Logo;
