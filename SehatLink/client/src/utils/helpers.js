export const formatDate = (date) => new Date(date).toLocaleDateString();
export const formatDateTime = (date) => new Date(date).toLocaleString();
export const formatCurrency = (amount) => `Rs. ${amount.toLocaleString()}`;

export const getStatusColor = (status) => {
  const colors = { pending: 'yellow', confirmed: 'blue', completed: 'green', cancelled: 'red' };
  return colors[status] || 'gray';
};