import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backend_url, currency } from '../App';
import { toast } from 'react-toastify';
import { 
  IoStatsChart, 
  IoTrendingUp, 
  IoCalendarOutline,
  IoWalletOutline
} from "react-icons/io5";
import { FiUsers, FiActivity, FiTrendingUp } from "react-icons/fi";
import { BiBook, BiTrendingUp } from "react-icons/bi";
import { TbTruckDelivery, TbChartBar, TbCircleCheck } from "react-icons/tb";
import { MdPayment, MdInventory, MdOutlineShowChart, MdOutlineAttachMoney } from "react-icons/md";
import { FaRegCalendarAlt, FaChartPie, FaChartLine, FaStar } from "react-icons/fa";
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title,
  Filler
);

// Dữ liệu mẫu mặc định
const defaultData = {
  totalRevenue: 12580,
  totalOrders: 124,
  totalProducts: 45,
  totalCustomers: 89,
  averageOrderValue: 101.45,
  recentOrders: [
    { _id: 'ord1', date: Date.now() - 86400000, amount: 98, status: 'Đã giao hàng', items: 3, customer: 'Nguyễn Văn A' },
    { _id: 'ord2', date: Date.now() - 172800000, amount: 145, status: 'Đã giao cho vận chuyển', items: 2, customer: 'Trần Thị B' },
    { _id: 'ord3', date: Date.now() - 259200000, amount: 65, status: 'Đang xử lý', items: 1, customer: 'Lê Văn C' },
    { _id: 'ord4', date: Date.now() - 345600000, amount: 120, status: 'Đã giao hàng', items: 4, customer: 'Phạm Thị D' },
    { _id: 'ord5', date: Date.now() - 432000000, amount: 200, status: 'Đang đóng gói', items: 2, customer: 'Hoàng Văn E' },
  ],
  bestSellers: [
    { _id: 'prod1', name: 'Đắc Nhân Tâm', sales: 15, revenue: 450, rating: 4.8 },
    { _id: 'prod2', name: 'Nhà Giả Kim', sales: 12, revenue: 360, rating: 4.7 },
    { _id: 'prod3', name: 'Tư Duy Phản Biện', sales: 10, revenue: 300, rating: 4.5 },
    { _id: 'prod4', name: 'Đọc Vị Bất Kỳ Ai', sales: 8, revenue: 240, rating: 4.6 },
    { _id: 'prod5', name: 'Người Giàu Có Nhất Thành Babylon', sales: 7, revenue: 210, rating: 4.4 },
  ],
  salesByCategory: [
    { category: 'Văn học', sales: 45, percentage: 50, color: 'rgba(99, 102, 241, 0.8)' },
    { category: 'Thiếu nhi', sales: 20, percentage: 22, color: 'rgba(14, 165, 233, 0.8)' },
    { category: 'Kinh tế', sales: 15, percentage: 17, color: 'rgba(52, 211, 153, 0.8)' },
    { category: 'Giáo dục', sales: 10, percentage: 11, color: 'rgba(249, 115, 22, 0.8)' },
  ],
  orderStatusDistribution: [
    { status: 'Đã đặt hàng', count: 25, color: 'rgba(99, 102, 241, 0.8)' },
    { status: 'Đang đóng gói', count: 15, color: 'rgba(14, 165, 233, 0.8)' },
    { status: 'Đã giao cho vận chuyển', count: 35, color: 'rgba(52, 211, 153, 0.8)' },
    { status: 'Đang giao hàng', count: 10, color: 'rgba(249, 115, 22, 0.8)' },
    { status: 'Đã giao hàng', count: 39, color: 'rgba(236, 72, 153, 0.8)' },
  ],
  paymentMethodDistribution: [
    { method: 'Thẻ tín dụng', count: 85, amount: 8650, color: 'rgba(99, 102, 241, 0.8)' },
    { method: 'COD', count: 39, amount: 3930, color: 'rgba(52, 211, 153, 0.8)' },
  ],
  monthlySales: [
    { month: 'T1', sales: 3200, customers: 45 },
    { month: 'T2', sales: 3800, customers: 52 },
    { month: 'T3', sales: 2800, customers: 40 },
    { month: 'T4', sales: 4200, customers: 60 },
    { month: 'T5', sales: 5100, customers: 72 },
    { month: 'T6', sales: 4800, customers: 65 },
    { month: 'T7', sales: 6200, customers: 80 },
    { month: 'T8', sales: 5800, customers: 75 },
    { month: 'T9', sales: 7100, customers: 95 },
    { month: 'T10', sales: 6500, customers: 85 },
    { month: 'T11', sales: 8200, customers: 105 },
    { month: 'T12', sales: 9500, customers: 120 },
  ],
  dailyActivities: [
    { day: 'T2', orders: 15, pageviews: 250 },
    { day: 'T3', orders: 20, pageviews: 300 },
    { day: 'T4', orders: 18, pageviews: 280 },
    { day: 'T5', orders: 25, pageviews: 350 },
    { day: 'T6', orders: 30, pageviews: 400 },
    { day: 'T7', orders: 22, pageviews: 320 },
    { day: 'CN', orders: 17, pageviews: 290 },
  ]
};

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(defaultData); // Khởi tạo với dữ liệu mẫu
  
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonStats, setComparisonStats] = useState({
    revenue: { value: defaultData.totalRevenue, percentage: 12.5, trend: 'up' },
    orders: { value: defaultData.totalOrders, percentage: 8.2, trend: 'up' },
    customers: { value: defaultData.totalCustomers, percentage: 5.1, trend: 'up' },
    aov: { value: defaultData.averageOrderValue, percentage: 2.3, trend: 'down' }
  });

  // Refs cho hiệu ứng animate-on-scroll
  const chartsRef = useRef(null);

  useEffect(() => {
    // Log cho debugging
    console.log("Dashboard useEffect triggered");
    console.log("Current token value:", token);
    
    // Chỉ fetch data khi đã có token
    if (token) {
      console.log("Token exists, calling fetchDashboardData");
      fetchDashboardData();
    } else {
      console.log("No token, using mock data");
      // Dữ liệu mẫu khi không có token (cho phép trình duyệt hiển thị trang mà không bị lỗi)
      setMockData();
    }
    
    // Thêm hiệu ứng scroll với một thời gian chờ để đảm bảo DOM đã render
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fadeIn');
            }
          });
        },
        { threshold: 0.1 }
      );
      
      const elements = document.querySelectorAll('.animate-on-scroll');
      console.log("Found animate-on-scroll elements:", elements.length);
      
      if (elements.length > 0) {
        elements.forEach(el => observer.observe(el));
      } else {
        console.log("No animation elements found, will try again on next render");
      }
      
      return () => {
        if (elements.length > 0) {
          elements.forEach(el => observer.unobserve(el));
        }
      };
    }, 500); // Chờ 500ms để đảm bảo DOM đã render
    
  }, [token, dateRange]);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data...");
      console.log("Using backend URL:", backend_url);
      setIsLoading(true);
      setError(null);
      const response = await axios.post(
        `${backend_url}/api/analytics/dashboard`, 
        { dateRange }, 
        { headers: { Authorization: token } }
      );
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        console.log("Data fetched successfully:", response.data.stats);
        
        // Kết hợp dữ liệu từ API với dữ liệu mẫu cho các trường thiếu
        const apiStats = response.data.stats || {};
        
        // Tạo đối tượng stats mới với dữ liệu từ API hoặc sử dụng dữ liệu mẫu nếu thiếu
        const combinedStats = {
          totalRevenue: apiStats.totalRevenue || defaultData.totalRevenue,
          totalOrders: apiStats.totalOrders || defaultData.totalOrders,
          totalProducts: apiStats.totalProducts || defaultData.totalProducts,
          totalCustomers: apiStats.totalCustomers || defaultData.totalCustomers,
          averageOrderValue: apiStats.averageOrderValue || defaultData.averageOrderValue,
          
          // Sử dụng dữ liệu từ API nếu có, nếu không dùng dữ liệu mẫu
          recentOrders: apiStats.recentOrders || defaultData.recentOrders,
          bestSellers: apiStats.bestSellers || defaultData.bestSellers,
          salesByCategory: apiStats.salesByCategory || defaultData.salesByCategory,
          orderStatusDistribution: apiStats.orderStatusDistribution || defaultData.orderStatusDistribution,
          paymentMethodDistribution: apiStats.paymentMethodDistribution || defaultData.paymentMethodDistribution,
          monthlySales: apiStats.monthlySales || defaultData.monthlySales,
          dailyActivities: apiStats.dailyActivities || defaultData.dailyActivities
        };
        
        console.log("Combined stats:", combinedStats);
        
        // Cập nhật state với dữ liệu đã kết hợp
        setStats(combinedStats);
        
        // Set comparison stats (bình thường sẽ từ API)
        setComparisonStats({
          revenue: { value: combinedStats.totalRevenue, percentage: 12.5, trend: 'up' },
          orders: { value: combinedStats.totalOrders, percentage: 8.2, trend: 'up' },
          customers: { value: combinedStats.totalCustomers, percentage: 5.1, trend: 'up' },
          aov: { value: combinedStats.averageOrderValue, percentage: 2.3, trend: 'down' }
        });
      } else {
        console.error('API response indicates failure:', response.data.message);
        setError(response.data.message || 'Lỗi khi tải dữ liệu Dashboard');
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Lỗi kết nối đến máy chủ');
      toast.error('Error fetching dashboard data');
    } finally {
      setIsLoading(false);
      console.log("Loading state set to false");
      // Kiểm tra giá trị state sau khi cập nhật
      console.log("Current stats after fetch:", stats);
      console.log("Current isLoading state:", isLoading);
    }
  };

  // Tạo dữ liệu mẫu để tránh lỗi undefined
  const setMockData = () => {
    console.log("Setting mock data...");
    setStats(defaultData);
    
    // Set comparison stats
    setComparisonStats({
      revenue: { value: defaultData.totalRevenue, percentage: 12.5, trend: 'up' },
      orders: { value: defaultData.totalOrders, percentage: 8.2, trend: 'up' },
      customers: { value: defaultData.totalCustomers, percentage: 5.1, trend: 'up' },
      aov: { value: defaultData.averageOrderValue, percentage: 2.3, trend: 'down' }
    });
    
    setIsLoading(false);
    console.log("Mock data set, isLoading set to false");
    console.log("Current stats after mock:", stats);
  };

  // Chart Config for Sales
  const salesChartData = {
    labels: stats.monthlySales?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Doanh số',
        data: stats.monthlySales?.map(item => item.sales) || [],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Khách hàng',
        data: stats.monthlySales?.map(item => item.customers * 30) || [], // Scale for visualization
        borderColor: 'rgba(52, 211, 153, 1)',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(52, 211, 153, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1', 
      }
    ]
  };
  
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += currency + context.parsed.y.toLocaleString('vi-VN');
              } else {
                label += Math.round(context.parsed.y / 30) + ' khách hàng';
              }
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: function(value) {
            return currency + value.toLocaleString('vi-VN');
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: function(value) {
            return Math.round(value / 30) + ' KH';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };

  // Chart Config for Category Sales
  const categorySalesData = {
    labels: stats.salesByCategory?.map(item => item.category) || [],
    datasets: [
      {
        data: stats.salesByCategory?.map(item => item.sales) || [],
        backgroundColor: stats.salesByCategory?.map(item => item.color) || [],
        borderWidth: 0,
        borderRadius: 4,
        hoverOffset: 15,
      }
    ]
  };
  
  const categorySalesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null && context.dataset.data && context.dataset.data.length > 0) {
              const totalSales = Array.isArray(stats.salesByCategory) ? 
                stats.salesByCategory.reduce((a, b) => a + (b.sales || 0), 0) || 1 : 1;
              const percentage = ((context.dataset.data[context.dataIndex] / totalSales) * 100).toFixed(1);
              label += context.parsed + ' đã bán (' + percentage + '%)';
            }
            return label;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // Chart Config for Order Status
  const orderStatusData = {
    labels: stats.orderStatusDistribution?.map(item => item.status) || [],
    datasets: [
      {
        data: stats.orderStatusDistribution?.map(item => item.count) || [],
        backgroundColor: stats.orderStatusDistribution?.map(item => item.color) || [],
        borderWidth: 0,
      }
    ]
  };
  
  const orderStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 12,
      }
    },
    cutout: '70%',
  };

  // Chart Config for Weekly Activity
  const activityChartData = {
    labels: stats.dailyActivities?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Đơn hàng',
        data: stats.dailyActivities?.map(item => item.orders) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        barPercentage: 0.6,
        borderRadius: 4,
      },
      {
        label: 'Lượt xem',
        data: stats.dailyActivities?.map(item => item.pageviews / 10) || [], // Scaled for visualization
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        barPercentage: 0.6,
        borderRadius: 4,
      }
    ]
  };
  
  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y + ' đơn';
              } else {
                label += (context.parsed.y * 10) + ' lượt xem';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };

  // Recent Orders Component
  const RecentOrders = ({ orders = [] }) => (
    <Card 
      title="Đơn hàng gần đây" 
      action={
        <button className="text-small text-secondary font-medium hover:underline transition-all duration-200">
          Xem tất cả
        </button>
      }
    >
      <div className="rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-5">
              <th className="px-4 py-3 text-left text-small font-medium text-textSecondary">Mã đơn</th>
              <th className="px-4 py-3 text-left text-small font-medium text-textSecondary">Khách hàng</th>
              <th className="px-4 py-3 text-left text-small font-medium text-textSecondary">Ngày đặt</th>
              <th className="px-4 py-3 text-right text-small font-medium text-textSecondary">Trạng thái</th>
              <th className="px-4 py-3 text-right text-small font-medium text-textSecondary">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className="border-b border-gray-10 hover:bg-gray-5 transition-colors duration-150">
                <td className="px-4 py-3 text-small font-medium">#{order._id}</td>
                <td className="px-4 py-3 text-small">{order.customer}</td>
                <td className="px-4 py-3 text-small text-textSecondary">
                  {new Date(order.date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-small px-2 py-1 rounded-full inline-block ${
                    order.status === 'Đã giao hàng' 
                      ? 'bg-success/10 text-success' 
                      : order.status === 'Đang xử lý' 
                      ? 'bg-warning/10 text-warning'
                      : order.status === 'Đang đóng gói'
                      ? 'bg-info/10 text-info'
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-small font-medium text-right">
                  {currency}{order.amount.toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // Best Sellers Component
  const BestSellers = ({ products = [] }) => (
    <Card 
      title="Sách bán chạy" 
      action={
        <button className="text-small text-secondary font-medium hover:underline transition-all duration-200">
          Xem chi tiết
        </button>
      }
    >
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between p-3 border-b border-gray-10 last:border-b-0 hover:bg-gray-5 transition-colors duration-150 rounded-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary/80 to-secondary rounded-full flex items-center justify-center text-white font-medium mr-4">
                {index + 1}
              </div>
              <div>
                <p className="text-body font-medium">{product.name}</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`text-xs ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-small text-textSecondary ml-2">{product.rating}</span>
                  <span className="text-small text-textSecondary ml-4">{product.sales} đã bán</span>
                </div>
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
          <div key={index} className="p-4 rounded-card bg-gradient-to-br from-gray-5 to-gray-10/50 transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-white shadow-sm">
                <MdPayment className={`text-xl ${index === 0 ? 'text-secondary' : 'text-success'}`} />
              </div>
            </div>
            <h4 className="text-body font-medium text-center">{item.method}</h4>
            <p className="text-small text-textSecondary text-center">{item.count} đơn hàng</p>
            <p className="text-h3 font-medium mt-2 text-center">{currency}{item.amount.toLocaleString('vi-VN')}</p>
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
              className={`px-4 py-2 rounded-button ${dateRange === 'week' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
        >
              Tuần
        </button>
        <button 
          onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-button ${dateRange === 'month' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
        >
              Tháng
        </button>
        <button 
          onClick={() => setDateRange('year')}
              className={`px-4 py-2 rounded-button ${dateRange === 'year' ? 'bg-secondary text-white' : 'hover:bg-gray-10'}`}
        >
              Năm
        </button>
      </div>
        }
      />
      
      {console.log("Rendering component with isLoading:", isLoading, "and error:", error)}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 p-4 rounded-lg text-center my-8">
          <div className="text-error font-medium mb-2 text-lg">Đã xảy ra lỗi</div>
          <div className="text-error/90">{error}</div>
          <button 
            onClick={() => fetchDashboardData()} 
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          {console.log("Rendering data with stats:", stats)}
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Doanh thu"
              value={`${currency}${stats.totalRevenue.toLocaleString('vi-VN')}`}
              description={
                <span className={`flex items-center ${comparisonStats.revenue.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {comparisonStats.revenue.trend === 'up' ? <FiTrendingUp className="mr-1" /> : <FiActivity className="mr-1" />}
                  {comparisonStats.revenue.percentage}% so với kỳ trước
                </span>
              }
              icon={<MdOutlineAttachMoney />}
              colorClass="bg-secondary/10 text-secondary"
            />
            <StatCard 
              title="Đơn hàng"
              value={stats.totalOrders} 
              description={
                <span className={`flex items-center ${comparisonStats.orders.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {comparisonStats.orders.trend === 'up' ? <FiTrendingUp className="mr-1" /> : <FiActivity className="mr-1" />}
                  {comparisonStats.orders.percentage}% so với kỳ trước
                </span>
              }
              icon={<TbTruckDelivery />}
              colorClass="bg-info/10 text-info"
            />
            <StatCard 
              title="Khách hàng"
              value={stats.totalCustomers}
              description={
                <span className={`flex items-center ${comparisonStats.customers.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {comparisonStats.customers.trend === 'up' ? <FiTrendingUp className="mr-1" /> : <FiActivity className="mr-1" />}
                  {comparisonStats.customers.percentage}% so với kỳ trước
                </span>
              }
              icon={<FiUsers />}
              colorClass="bg-accent/10 text-accent"
            />
            <StatCard 
              title="Giá trị đơn hàng trung bình"
              value={`${currency}${stats.averageOrderValue.toLocaleString('vi-VN')}`}
              description={
                <span className={`flex items-center ${comparisonStats.aov.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {comparisonStats.aov.trend === 'up' ? <FiTrendingUp className="mr-1" /> : <FiActivity className="mr-1" />}
                  {comparisonStats.aov.percentage}% so với kỳ trước
                </span>
              }
              icon={<IoWalletOutline />}
              colorClass="bg-success/10 text-success"
            />
          </div>
          
          {/* Main charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card 
                title="Phân tích doanh số" 
                action={
                  <div className="flex items-center text-small text-success">
                    <BiTrendingUp className="mr-1" />
                    <span>+12.5% so với kỳ trước</span>
                  </div>
                }
              >
                <div className="h-80">
                  <Line data={salesChartData} options={salesChartOptions} />
                </div>
              </Card>
            </div>
            
            <div>
              <Card title="Bán hàng theo danh mục">
                <div className="h-80">
                  <Doughnut data={categorySalesData} options={categorySalesOptions} />
                </div>
              </Card>
            </div>
          </div>
          
          {/* Second row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <RecentOrders orders={stats.recentOrders} />
            </div>
            
            <div>
              <BestSellers products={stats.bestSellers} />
            </div>
          </div>

          {/* Third row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <Card title="Phân bố trạng thái đơn hàng">
                <div className="h-64">
                  <Doughnut data={orderStatusData} options={orderStatusOptions} />
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card title="Hoạt động trong tuần">
                <div className="h-64">
                  <Bar data={activityChartData} options={activityChartOptions} />
                </div>
              </Card>
            </div>
          </div>
          
          {/* Fourth row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <PaymentMethods data={stats.paymentMethodDistribution} />
            </div>
            
            <div className="lg:col-span-2">
              <Card 
                title="Sắp tới"
                icon={<IoCalendarOutline className="mr-2" />}
                className="bg-gradient-to-br from-white to-gray-5"
              >
                <div className="p-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-10 mb-3 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Black Friday Sale</h4>
                      <span className="text-small bg-warning/10 text-warning px-2 py-0.5 rounded-full">24/11/2023</span>
                    </div>
                    <p className="text-small text-textSecondary">Chuẩn bị chiến dịch giảm giá toàn bộ sách 20-50%</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-10 mb-3 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Kho sách mới</h4>
                      <span className="text-small bg-info/10 text-info px-2 py-0.5 rounded-full">15/12/2023</span>
                    </div>
                    <p className="text-small text-textSecondary">Nhập kho 200 đầu sách mới từ các NXB</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-10 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Tết Giáp Thìn 2024</h4>
                      <span className="text-small bg-success/10 text-success px-2 py-0.5 rounded-full">10/02/2024</span>
                    </div>
                    <p className="text-small text-textSecondary">Chuẩn bị quà tặng khách hàng dịp Tết</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;