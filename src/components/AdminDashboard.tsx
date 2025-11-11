import React, { useState, useEffect } from 'react';
import { LogOut, Shield, Users, Package, DollarSign, TrendingUp, Settings, Bell, Search } from 'lucide-react';
import AdminOrders from './AdminOrders';
import AdminTransactions from './AdminTransactions';
import EnhancedAdminOrders from './EnhancedAdminOrders';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState('SHEMI');
  const [loginTime, setLoginTime] = useState<string>('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>('');

  useEffect(() => {
    const loginTimestamp = localStorage.getItem('adminLoginTime');
    if (loginTimestamp) {
      setLoginTime(new Date(parseInt(loginTimestamp)).toLocaleString());
    }

    // Update session timer every minute
    const timer = setInterval(() => {
      const loginTimestamp = localStorage.getItem('adminLoginTime');
      if (loginTimestamp) {
        const loginTime = parseInt(loginTimestamp);
        const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        const timeLeft = sessionDuration - (Date.now() - loginTime);
        
        if (timeLeft <= 0) {
          handleLogout();
        } else {
          const hours = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          setSessionTimeLeft(`${hours}h ${minutes}m`);
        }
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    onLogout();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'enhanced-orders', name: 'Enhanced Orders', icon: Package },
    { id: 'transactions', name: 'M-Pesa Transactions', icon: DollarSign },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return <AdminOrders />;
      case 'enhanced-orders':
        return <EnhancedAdminOrders />;
      case 'transactions':
        return <AdminTransactions />;
      case 'customers':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-vantablack mb-4">Customer Management</h2>
            <p className="text-gray-600">Customer management features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-vantablack mb-4">Admin Settings</h2>
            <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
              <h3 className="text-lg font-semibold text-vantablack mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-vantablack">Session Timeout</p>
                    <p className="text-sm text-gray-600">Automatically log out after 2 hours</p>
                  </div>
                  <span className="text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-vantablack">Login Attempts Limit</p>
                    <p className="text-sm text-gray-600">Maximum 3 failed attempts before lockout</p>
                  </div>
                  <span className="text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-vantablack">Activity Logging</p>
                    <p className="text-sm text-gray-600">All admin actions are logged</p>
                  </div>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-vantablack mb-6">Admin Overview</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-vantablack">1,234</p>
                  </div>
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-vantablack">KSh 2.5M</p>
                  </div>
                  <DollarSign className="text-green-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-vantablack">856</p>
                  </div>
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth</p>
                    <p className="text-2xl font-bold text-vantablack">+23%</p>
                  </div>
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-3d border border-gray-100">
              <h3 className="text-lg font-semibold text-vantablack mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-vantablack">New order received</p>
                    <p className="text-xs text-gray-600">Order #LT20241228-0045 - iPhone 15 Pro Max</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-vantablack">M-Pesa payment confirmed</p>
                    <p className="text-xs text-gray-600">KSh 185,000 - Receipt: QGH7X8Y9Z0</p>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-vantablack">Order status updated</p>
                    <p className="text-xs text-gray-600">Order #LT20241228-0044 marked as shipped</p>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-3d border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-vantablack">Admin Portal</h1>
                <p className="text-xs text-gray-600">Lifetime Technology Kenya</p>
              </div>
            </div>

            {/* Admin Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Session Info */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-vantablack">Welcome, {adminUser}</p>
                <p className="text-xs text-gray-600">Session: {sessionTimeLeft} remaining</p>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-vantablack hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-3d hover:shadow-3d-hover"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-3d border border-gray-100 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-vantablack text-white shadow-3d'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Security Status */}
            <div className="mt-6 bg-white rounded-xl shadow-3d border border-gray-100 p-4">
              <h3 className="font-semibold text-vantablack mb-3 flex items-center">
                <Shield className="mr-2" size={16} />
                Security Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Login Time:</span>
                  <span className="text-vantablack font-medium">{loginTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Session:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <span className="text-blue-600 font-medium">Full Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-3d border border-gray-100 min-h-[600px]">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}