import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Calendar, Phone, Mail, Award } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        setDoctor(res.data.doctor);
        setReviews(res.data.reviews || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!doctor) return <div className="text-center py-12">Doctor not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-blue-50 p-8 text-center">
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-4xl font-bold">
              {doctor.name?.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold mt-4">{doctor.name}</h1>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
            <div className="flex justify-center items-center gap-1 mt-2">
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
              <span>{doctor.rating || '4.5'} / 5</span>
            </div>
          </div>
          <div className="md:w-2/3 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3"><MapPin /><div><p className="text-gray-500">Location</p><p className="font-medium">{doctor.city}</p></div></div>
              <div className="flex items-center gap-3"><Award /><div><p className="text-gray-500">Experience</p><p className="font-medium">{doctor.experience} years</p></div></div>
              <div className="flex items-center gap-3"><Phone /><div><p className="text-gray-500">Contact</p><p className="font-medium">{doctor.phone || 'Not available'}</p></div></div>
              <div className="flex items-center gap-3"><Mail /><div><p className="text-gray-500">Email</p><p className="font-medium">{doctor.email || 'Not available'}</p></div></div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Consultation Fee</p>
              <p className="text-2xl font-bold text-blue-600">Rs. {doctor.fee}</p>
            </div>
            <div className="mt-6">
              <Link to={`/booking/${doctor.id}`} className="btn-primary inline-flex items-center gap-2"><Calendar size={18} /> Book Appointment</Link>
            </div>
          </div>
        </div>
      </div>
      {reviews.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4">Patient Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div key={idx} className="border-b pb-4">
                <div className="flex items-center gap-2"><div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}</div><span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span></div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;