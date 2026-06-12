import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, MapPin, Stethoscope, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
    search: "",
  });

  const specializations = [
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Psychiatrist",
    "Orthopedic",
    "Ophthalmologist",
    "Gynecologist",
  ];

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
  ];

  useEffect(() => {
    fetchDoctors();
  }, [filters.specialization, filters.city]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialization)
        params.append("specialization", filters.specialization);
      if (filters.city) params.append("city", filters.city);

      const response = await axios.get(
        `http://localhost:5000/api/doctors?${params.toString()}`,
      );
      let doctorsData = response.data.doctors || [];

      if (filters.search) {
        doctorsData = doctorsData.filter(
          (d) =>
            d.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            d.specialization
              ?.toLowerCase()
              .includes(filters.search.toLowerCase()),
        );
      }

      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Demo data
      setDoctors([
        {
          id: 1,
          name: "Dr. Khalid Mehmood",
          specialization: "Cardiologist",
          fee: 3500,
          city: "Karachi",
          rating: 4.8,
          experience: 15,
        },
        {
          id: 2,
          name: "Dr. Sadia Khan",
          specialization: "Gynecologist",
          fee: 3000,
          city: "Karachi",
          rating: 4.9,
          experience: 12,
        },
        {
          id: 3,
          name: "Dr. Tariq Jamil",
          specialization: "Neurologist",
          fee: 4000,
          city: "Islamabad",
          rating: 4.7,
          experience: 10,
        },
        {
          id: 4,
          name: "Dr. Hina Shabbir",
          specialization: "Dermatologist",
          fee: 2500,
          city: "Lahore",
          rating: 4.6,
          experience: 8,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Find Doctors</h1>
          <p className="text-gray-500 mt-1">
            Book appointments with trusted healthcare professionals
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={filters.search}
              onChange={(e) => {
                handleFilterChange("search", e.target.value);
                fetchDoctors();
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Stethoscope
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={filters.specialization}
                onChange={(e) =>
                  handleFilterChange("specialization", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">
              No doctors found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {doctor.specialization}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                      <Star
                        size={16}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="font-semibold text-sm">
                        {doctor.rating || 4.5}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-gray-500 text-sm">
                      {doctor.experience} years experience
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {doctor.city}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Fee:{" "}
                      <span className="font-semibold text-blue-600">
                        Rs. {doctor.fee}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/booking/${doctor.id}`}
                      className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
