import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Package, User, Mail, MapPin, Truck, DollarSign, Calendar, Phone } from 'lucide-react';
import { EnhancedOrderManager, EnhancedOrder, OrderTracking } from '../lib/supabase-enhanced';

export default function EnhancedAdminOrders() {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<EnhancedOrder | null>(null);
  const [orderTracking, setOrderTracking] = useState<OrderTracking[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    thisMonthRevenue: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await EnhancedOrderManager.getAllOrdersWithDetails();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statistics = await EnhancedOrderManager.getOrderStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrderTracking = async (orderId: string) => {
    try {
      const tracking = await EnhancedOrderManager.getOrderTracking(orderId);
      setOrderTracking(tracking);
    } catch (error) {
      console.error('Error fetching order tracking:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number.includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items?.some(item => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={16} />;
      case 'processing':
      case 'shipped':
        return <Clock className="text-blue-600" size={16} />;
      default:
        return <Clock className="text-yellow-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await EnhancedOrderManager.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      await fetchStats();
      if (selectedOrder) {
        await fetchOrderTracking(orderId);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleOrderSelect = async (order: EnhancedOrder) => {
    setSelectedOrder(order);
    if (order.id) {
      await fetchOrderTracking(order.id);
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Customer', 'Phone', 'Email', 'Items', 'Total Amount', 'Status', 'Payment Method', 'Delivery Zone'].join(','),
      ...filteredOrders.map(order => [
        order.order_number || '',
        new Date(order.created_at || '').toLocaleDateString(),
        order.full_name,
        order.phone_number,
        order.email,
        order.order_items?.length || 0,
        order.total_amount || 0,
        order.status || 'pending',
        order.payment_method,
        order.delivery_zone?.name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vantablack border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vantablack mb-2">Enhanced Order Management</h1>
          <p className="text-gray-600">Comprehensive order tracking and customer management</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  KSh {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-vantablack">{stats.totalOrders}</p>
              </div>
              <Package className="text-vantablack" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
              </div>
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  KSh {stats.thisMonthRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-3d mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, order number, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent transition-all"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-vantablack focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={exportOrders}
              className="flex items-center space-x-2 bg-vantablack text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-3d hover:shadow-3d-hover"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Enhanced Orders Table */}
        <div className="bg-white rounded-xl shadow-3d overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items & Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-3" size={16} />
                        <div>
                          <div className="text-sm font-semibold text-vantablack">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at || '').toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.created_at || '').toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="text-gray-400 mr-3" size={16} />
                        <div>
                          <div className="text-sm font-medium text-vantablack">
                            {order.full_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone size={12} className="mr-1" />
                            {order.phone_number}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {order.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-vantablack">
                          {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {order.order_items?.map(item => item.product_name).join(', ')}
                        </div>
                        <div className="text-sm font-bold text-green-600 mt-1">
                          KSh {(order.total_amount || 0).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="text-gray-400 mr-2" size={14} />
                        <div>
                          <div className="text-sm text-vantablack">
                            {order.delivery_zone?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Fee: KSh {(order.delivery_fee || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        <span className="capitalize">{order.status || 'pending'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOrderSelect(order)}
                        className="text-vantablack hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Enhanced Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vantablack/75 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-3d">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-vantablack">Order Details - {selectedOrder.order_number}</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Items */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                    <Package className="mr-2" size={16} />
                    Order Items ({selectedOrder.order_items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center space-x-4">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-vantablack">{item.product_name}</h5>
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity} × KSh {item.unit_price.toLocaleString()}
                            </div>
                            {item.product_options && Object.keys(item.product_options).length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Object.entries(item.product_options).map(([key, value]) => (
                                  <span key={key} className="mr-2">{key}: {value}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">
                              KSh {item.total_price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <User className="mr-2" size={16} />
                      Customer Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.full_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.phone_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                      <MapPin className="mr-2" size={16} />
                      Delivery Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Zone:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.delivery_zone?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.delivery_address}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Delivery Fee:</span>
                        <p className="font-medium text-green-600">KSh {(selectedOrder.delivery_fee || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary & Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-4">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">KSh {(selectedOrder.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-medium">KSh {(selectedOrder.delivery_fee || 0).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-orange-200 pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-orange-800">Total:</span>
                          <span className="font-bold text-orange-600">KSh {(selectedOrder.total_amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <span className="text-gray-600">Payment Method:</span>
                        <p className="font-medium text-vantablack">{selectedOrder.payment_method}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Order Tracking</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {orderTracking.map((track, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-vantablack capitalize">{track.status}</p>
                            <p className="text-sm text-gray-600">{track.notes}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(track.created_at || '').toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-4">Update Order Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'paid', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id!, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === status
                            ? 'bg-vantablack text-white'
                            : 'bg-white text-vantablack border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}