import { useState, useEffect } from 'react';
import { getDoctors } from '../services/doctorService';

export const useDoctors = (filters = {}) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await getDoctors(filters);
        setDoctors(res.data.doctors || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [JSON.stringify(filters)]);

  return { doctors, loading, error };
};