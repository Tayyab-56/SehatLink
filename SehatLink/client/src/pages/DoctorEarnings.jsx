import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  Download, Eye, CreditCard, Wallet, ArrowUpRight,
  ChevronRight, PieChart, Clock, CheckCircle, Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DoctorEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0,
    completed: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const fetchEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        toast.error('Please login again');
        setLoading(false);
        return;
      }
      
      console.log('Fetching earnings for userId:', userData.id);
      const response = await axios.get(`http://localhost:5000/api/doctors/earnings?userId=${userData.id}`);
      
      console.log('Earnings response:', response.data);
      
      if (response.data.success) {
        setEarnings(response.data.earnings);
        setTransactions(response.data.transactions || []);
        
        if (response.data.earnings.total === 0) {
          toast.success('No earnings yet. Complete appointments to see earnings.');
        }
      } else {
        setError(response.data.message || 'Failed to load earnings');
        toast.error(response.data.message || 'Failed to load earnings');
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError(error.response?.data?.message || 'Failed to load earnings');
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      title: 'Total Earnings', 
      value: `Rs. ${earnings.total.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'blue', 
      change: earnings.total > 0 ? '+0%' : '0%' 
    },
    { 
      title: 'This Month', 
      value: `Rs. ${earnings.thisMonth.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'green', 
      change: earnings.thisMonth > earnings.lastMonth ? '+8%' : earnings.thisMonth < earnings.lastMonth ? '-5%' : '0%'
    },
    { 
      title: 'Last Month', 
      value: `Rs. ${earnings.lastMonth.toLocaleString()}`, 
      icon: Calendar, 
      color: 'purple', 
      change: '-5%' 
    },
    { 
      title: 'Pending', 
      value: `Rs. ${earnings.pending.toLocaleString()}`, 
      icon: Clock, 
      color: 'yellow', 
      change: '+2%' 
    },
  ];

  const getCardColor = (color) => {
    const colors = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      purple: 'border-purple-500',
      yellow: 'border-yellow-500'
    };
    return colors[color] || 'border-gray-500';
  };

  const getCardBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      yellow: 'bg-yellow-100'
    };
    return colors[color] || 'bg-gray-100';
  };

  const getCardTextColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600'
    };
    return colors[color] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchEarnings}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Earnings Overview</h1>
        <p className="text-gray-500 mt-1">Track your income and payment history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${getCardColor(stat.color)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-green-600 text-xs">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 ${getCardBgColor(stat.color)} rounded-lg flex items-center justify-center`}>
                <stat.icon size={20} className={getCardTextColor(stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Earnings Overview</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  selectedPeriod === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setSelectedPeriod('year')}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  selectedPeriod === 'year' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            {earnings.total === 0 ? (
              <div className="text-center">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400">No earnings data available yet</p>
                <p className="text-gray-300 text-sm mt-1">Complete appointments to see earnings</p>
              </div>
            ) : (
              <p className="text-gray-400">Chart will appear here (Coming soon)</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Completed</span>
              <span className="font-bold text-green-600">Rs. {earnings.completed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Pending Clearance</span>
              <span className="font-bold text-yellow-600">Rs. {earnings.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Withdrawal Fee</span>
              <span className="font-bold text-red-600">Rs. 0</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Available for Withdrawal</span>
              <span className="font-bold text-green-600 text-lg">Rs. {earnings.completed.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => toast.success('Withdrawal feature coming soon')}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
          {transactions.length > 0 && (
            <button className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              <Download size={16} /> Export
            </button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Transactions will appear here after you complete appointments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{transaction.patient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{transaction.appointmentId}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">Rs. {transaction.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        transaction.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toast.success(`View details for appointment #${transaction.appointmentId}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorEarnings;