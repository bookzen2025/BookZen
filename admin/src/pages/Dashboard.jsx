import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url, currency } from '../App';
import { toast } from 'react-toastify';
import { IoStatsChart } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { BiBook } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { MdPayment, MdInventory, MdOutlineShowChart } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

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
        { _id: 'ord1', date: Date.now() - 86400000, amount: 98, status: 'Đã giao hàng', items: 3 },
        { _id: 'ord2', date: Date.now() - 172800000, amount: 145, status: 'Đã giao cho vận chuyển', items: 2 },
        { _id: 'ord3', date: Date.now() - 259200000, amount: 65, status: 'Đang xử lý', items: 1 },
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
        { status: 'Đã đặt hàng', count: 25 },
        { status: 'Đang đóng gói', count: 15 },
        { status: 'Đã giao cho vận chuyển', count: 35 },
        { status: 'Đang giao hàng', count: 10 },
        { status: 'Đã giao hàng', count: 39 },
      ],
      paymentMethodDistribution: [
        { method: 'Stripe', count: 85, amount: 8650 },
        { method: 'COD', count: 39, amount: 3930 },
      ],
      monthlySales: [
        { month: 'T1', sales: 3200 },
        { month: 'T2', sales: 3800 },
        { month: 'T3', sales: 2800 },
        { month: 'T4', sales: 4200 },
        { month: 'T5', sales: 5100 },
        { month: 'T6', sales: 4800 },
      ],
    };
    
    setStats(placeholderData);
    setIsLoading(false);
  }, []);

  // Chart Components
  const BarChart = ({ data, title, className }) => (
    <Card title={title} className={className}>
      <div className="space-y-5">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-body font-medium">{item.category || item.status || item.method}</span>
              <span className="text-small text-textSecondary">
                {item.percentage ? `${item.percentage}%` : item.sales || item.count}
              </span>
            </div>
            <div className="w-full bg-gray-10 rounded-full h-2">
              <div 
                className="bg-secondary rounded-full h-2" 
                style={{ width: `${item.percentage || (item.sales / Math.max(...data.map(d => d.sales)) * 100) || (item.count / Math.max(...data.map(d => d.count)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Sales Chart Component
  const SalesChart = ({ data, className }) => (
    <Card 
      title="Doanh số hàng tháng" 
      className={className}
      action={
        <div className="flex items-center text-small text-textSecondary">
          <MdOutlineShowChart className="mr-1" />
          <span>+12.5% so với tháng trước</span>
        </div>
      }
    >
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="bg-secondary/80 hover:bg-secondary transition-colors rounded-t-md w-full" 
              style={{ 
                height: `${(item.sales / Math.max(...data.map(d => d.sales))) * 200}px`,
              }}
            ></div>
            <span className="text-small mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  // Recent Orders Component
  const RecentOrders = ({ orders }) => (
    <Card 
      title="Đơn hàng gần đây" 
      action={
        <button className="text-small text-secondary font-medium hover:underline">Xem tất cả</button>
      }
    >
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-10 last:border-b-0">
            <div>
              <p className="text-body font-medium">#{order._id}</p>
              <p className="text-small text-textSecondary">
                {new Date(order.date).toLocaleDateString('vi-VN')} · {order.items} sản phẩm
              </p>
            </div>
            <div className="flex items-center">
              <span className={`text-small px-2 py-1 rounded-full ${
                order.status === 'Đã giao hàng' 
                  ? 'bg-success/10 text-success' 
                  : order.status === 'Đang xử lý' 
                  ? 'bg-warning/10 text-warning' 
                  : 'bg-info/10 text-info'
              }`}>
                {order.status}
              </span>
              <p className="ml-3 font-medium">{currency}{order.amount.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Best Sellers Component
  const BestSellers = ({ products }) => (
    <Card 
      title="Sách bán chạy" 
      action={
        <button className="text-small text-secondary font-medium hover:underline">Xem chi tiết</button>
      }
    >
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-10 last:border-b-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-medium mr-3">
                {index + 1}
              </div>
              <div>
                <p className="text-body font-medium">{product.name}</p>
                <p className="text-small text-textSecondary">{product.sales} đã bán</p>
              </div>
            </div>
            <p className="font-medium">{currency}{product.revenue.toLocaleString('vi-VN')}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  // Payment Methods Component
  const PaymentMethods = ({ data }) => (
    <Card title="Phương thức thanh toán">
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center p-4 rounded-card bg-gray-10/50">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-secondary/10">
                <MdPayment className="text-secondary text-xl" />
              </div>
            </div>
            <h4 className="text-body font-medium">{item.method}</h4>
            <p className="text-small text-textSecondary">{item.count} đơn hàng</p>
            <p className="text-h3 font-medium mt-2">{currency}{item.amount.toLocaleString('vi-VN')}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tổng quan" 
        subtitle="Thống kê và phân tích hoạt động kinh doanh" 
        actions={
          <div className="flex bg-white p-1 rounded-button shadow-sm">
            <button 
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 text-small rounded-button transition-colors ${dateRange === 'week' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 text-small rounded-button transition-colors ${dateRange === 'month' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
            >
              Tháng
            </button>
            <button 
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 text-small rounded-button transition-colors ${dateRange === 'year' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
            >
              Năm
            </button>
          </div>
        }
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Tổng doanh thu" 
              value={`${currency}${stats.totalRevenue.toLocaleString('vi-VN')}`}
              icon={<IoStatsChart className="text-xl" />}
              bgColor="bg-secondary/10"
              textColor="text-secondary"
            />
            <StatCard 
              title="Tổng đơn hàng" 
              value={stats.totalOrders} 
              icon={<TbTruckDelivery className="text-xl" />}
              bgColor="bg-info/10"
              textColor="text-info"
            />
            <StatCard 
              title="Sản phẩm" 
              value={stats.totalProducts} 
              icon={<BiBook className="text-xl" />}
              bgColor="bg-success/10"
              textColor="text-success"
            />
            <StatCard 
              title="Khách hàng" 
              value={stats.totalCustomers} 
              icon={<FiUsers className="text-xl" />}
              bgColor="bg-accent/10"
              textColor="text-accent"
            />
          </div>
          
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SalesChart data={stats.monthlySales} className="lg:col-span-2" />
            <BarChart data={stats.salesByCategory} title="Doanh số theo danh mục" />
          </div>
          
          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentOrders orders={stats.recentOrders} />
            <BestSellers products={stats.bestSellers} />
          </div>
          
          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart data={stats.orderStatusDistribution} title="Trạng thái đơn hàng" />
            <PaymentMethods data={stats.paymentMethodDistribution} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;