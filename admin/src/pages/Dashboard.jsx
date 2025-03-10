import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url, currency } from '../App';
import { toast } from 'react-toastify';
import { IoStatsChart } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { BiBook } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { MdPayment } from "react-icons/md";

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    recentOrders: [],
    bestSellers: [],
    salesByCategory: [],
    orderStatusDistribution: [],
    paymentMethodDistribution: [],
    monthlySales: [],
  });
  
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${backend_url}/api/analytics/dashboard`, 
        { dateRange }, 
        { headers: { Authorization: token } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder data for demo purposes
  useEffect(() => {
    // This is temporary data to visualize the UI before backend implementation
    const placeholderData = {
      totalRevenue: 12580,
      totalOrders: 124,
      totalProducts: 45,
      totalCustomers: 89,
      averageOrderValue: 101.45,
      recentOrders: [
        { _id: 'ord1', date: Date.now() - 86400000, amount: 98, status: 'Delivered', items: 3 },
        { _id: 'ord2', date: Date.now() - 172800000, amount: 145, status: 'Shipped', items: 2 },
        { _id: 'ord3', date: Date.now() - 259200000, amount: 65, status: 'Processing', items: 1 },
      ],
      bestSellers: [
        { _id: 'prod1', name: 'The Great Gatsby', sales: 15, revenue: 450 },
        { _id: 'prod2', name: 'To Kill a Mockingbird', sales: 12, revenue: 360 },
        { _id: 'prod3', name: 'Pride and Prejudice', sales: 10, revenue: 300 },
      ],
      salesByCategory: [
        { category: 'Fiction', sales: 45, percentage: 50 },
        { category: 'Children', sales: 20, percentage: 22 },
        { category: 'Business', sales: 15, percentage: 17 },
        { category: 'Academic', sales: 10, percentage: 11 },
      ],
      orderStatusDistribution: [
        { status: 'Order Placed', count: 25 },
        { status: 'Packing', count: 15 },
        { status: 'Shipped', count: 35 },
        { status: 'Out for delivery', count: 10 },
        { status: 'Delivered', count: 39 },
      ],
      paymentMethodDistribution: [
        { method: 'Stripe', count: 85, amount: 8650 },
        { method: 'COD', count: 39, amount: 3930 },
      ],
      monthlySales: [
        { month: 'Jan', sales: 3200 },
        { month: 'Feb', sales: 3800 },
        { month: 'Mar', sales: 2800 },
        { month: 'Apr', sales: 4200 },
        { month: 'May', sales: 5100 },
        { month: 'Jun', sales: 4800 },
      ],
    };
    
    setStats(placeholderData);
    setIsLoading(false);
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );

  const BarChart = ({ data, title }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm h-full">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{item.category || item.status || item.method}</span>
              <span className="text-xs text-gray-500">
                {item.percentage ? `${item.percentage}%` : item.sales || item.count}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-secondary rounded-full h-2" 
                style={{ width: `${item.percentage || (item.sales / Math.max(...data.map(d => d.sales)) * 100) || (item.count / Math.max(...data.map(d => d.count)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SalesChart = ({ data }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm h-full">
      <h3 className="font-bold mb-4">Monthly Sales</h3>
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-secondary rounded-t-md w-10" 
              style={{ 
                height: `${(item.sales / Math.max(...data.map(d => d.sales))) * 200}px`,
              }}
            ></div>
            <span className="text-xs mt-1">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-2 sm:px-8 mt-4 sm:mt-14 pb-8">
      <h2 className="text-3xl font-bold mb-6">Analytics Dashboard</h2>
      
      {/* Date Range Selector */}
      <div className="mb-6 flex space-x-2">
        <button 
          onClick={() => setDateRange('week')}
          className={`px-4 py-2 rounded-full text-sm ${dateRange === 'week' ? 'bg-secondary text-white' : 'bg-white'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => setDateRange('month')}
          className={`px-4 py-2 rounded-full text-sm ${dateRange === 'month' ? 'bg-secondary text-white' : 'bg-white'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => setDateRange('year')}
          className={`px-4 py-2 rounded-full text-sm ${dateRange === 'year' ? 'bg-secondary text-white' : 'bg-white'}`}
        >
          This Year
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse bg-secondary h-10 w-10 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Revenue" 
              value={`${currency}${stats.totalRevenue.toLocaleString('vi-VN')}`}
              icon={<IoStatsChart className="text-white text-xl" />}
              color="bg-secondary"
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={<TbTruckDelivery className="text-white text-xl" />}
              color="bg-secondaryOne"
            />
            <StatCard 
              title="Products" 
              value={stats.totalProducts} 
              icon={<BiBook className="text-white text-xl" />}
              color="bg-green-500"
            />
            <StatCard 
              title="Customers" 
              value={stats.totalCustomers} 
              icon={<FiUsers className="text-white text-xl" />}
              color="bg-blue-500"
            />
          </div>
          
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <SalesChart data={stats.monthlySales} />
            </div>
            <div>
              <BarChart data={stats.salesByCategory} title="Sales by Category" />
            </div>
          </div>
          
          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <BarChart data={stats.orderStatusDistribution} title="Order Status" />
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-4">Payment Methods</h3>
              <div className="flex gap-8">
                {stats.paymentMethodDistribution.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-4 rounded-full bg-primary">
                        <MdPayment className="text-secondary text-xl" />
                      </div>
                    </div>
                    <h4 className="font-bold">{item.method}</h4>
                    <p className="text-sm text-gray-500">{item.count} orders</p>
                    <p className="font-medium">{currency}{item.amount.toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Best Sellers & Recent Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-4">Best Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Sales</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bestSellers.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="text-right py-2">{product.sales}</td>
                        <td className="text-right py-2">{currency}{product.revenue.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Items</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="text-right py-2">{order.items}</td>
                        <td className="text-right py-2">{currency}{order.amount.toLocaleString('vi-VN')}</td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;