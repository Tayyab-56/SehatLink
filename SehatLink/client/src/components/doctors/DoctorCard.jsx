import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Calendar } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="card">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
          </div>
          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{doctor.rating || "4.5"}</span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin size={16} />
            <span>{doctor.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold">Rs.{doctor.fee}</span>
            <span>/ consultation</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            to={`/doctors/${doctor.id}`}
            className="flex-1 text-center btn-primary"
          >
            View Profile
          </Link>
          <Link
            to={`/booking/${doctor.id}`}
            className="flex-1 text-center btn-secondary flex items-center justify-center gap-1"
          >
            <Calendar size={16} />
            Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;