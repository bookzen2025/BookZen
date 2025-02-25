import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Helper function to get date range filters
const getDateRange = (range) => {
    const now = new Date();
    const startDate = new Date();
    
    switch(range) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    return {
        startDate: startDate.getTime(),
        endDate: now.getTime()
    };
};

// Dashboard analytics data
const getDashboardData = async (req, res) => {
    try {
        const { dateRange = 'month' } = req.body;
        const { startDate, endDate } = getDateRange(dateRange);
        
        // Get all orders within date range
        const orders = await orderModel.find({
            date: { $gte: startDate, $lte: endDate }
        });
        
        // Get all products
        const products = await productModel.find({});
        
        // Get all users
        const users = await userModel.find({});
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        
        // Calculate best selling products
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item._id]) {
                    productSales[item._id] = {
                        name: item.name,
                        sales: 0,
                        revenue: 0
                    };
                }
                productSales[item._id].sales += item.quantity;
                productSales[item._id].revenue += item.price * item.quantity;
            });
        });
        
        const bestSellers = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
        
        // Calculate sales by category
        const categorySales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!categorySales[item.category]) {
                    categorySales[item.category] = {
                        category: item.category,
                        sales: 0,
                        revenue: 0
                    };
                }
                categorySales[item.category].sales += item.quantity;
                categorySales[item.category].revenue += item.price * item.quantity;
            });
        });
        
        // Calculate percentages for categories
        const totalSales = Object.values(categorySales).reduce((sum, cat) => sum + cat.sales, 0);
        Object.values(categorySales).forEach(cat => {
            cat.percentage = totalSales > 0 ? Math.round((cat.sales / totalSales) * 100) : 0;
        });
        
        const salesByCategory = Object.values(categorySales)
            .sort((a, b) => b.sales - a.sales);
        
        // Calculate order status distribution
        const orderStatusCount = {};
        orders.forEach(order => {
            if (!orderStatusCount[order.status]) {
                orderStatusCount[order.status] = 0;
            }
            orderStatusCount[order.status]++;
        });
        
        const orderStatusDistribution = Object.entries(orderStatusCount).map(([status, count]) => ({
            status,
            count
        }));
        
        // Calculate payment method distribution
        const paymentMethodCount = {};
        const paymentMethodAmount = {};
        
        orders.forEach(order => {
            if (!paymentMethodCount[order.paymentMethod]) {
                paymentMethodCount[order.paymentMethod] = 0;
                paymentMethodAmount[order.paymentMethod] = 0;
            }
            paymentMethodCount[order.paymentMethod]++;
            paymentMethodAmount[order.paymentMethod] += order.amount;
        });
        
        const paymentMethodDistribution = Object.entries(paymentMethodCount).map(([method, count]) => ({
            method,
            count,
            amount: paymentMethodAmount[method]
        }));
        
        // Calculate monthly sales for the past 6 months
        const monthlySales = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
            
            const monthlyOrders = orders.filter(order => 
                order.date >= monthStart && order.date <= monthEnd
            );
            
            const monthlySalesAmount = monthlyOrders.reduce((sum, order) => sum + order.amount, 0);
            
            monthlySales.push({
                month: months[d.getMonth()],
                sales: monthlySalesAmount
            });
        }
        
        // Get recent orders
        const recentOrders = orders
            .sort((a, b) => b.date - a.date)
            .slice(0, 5)
            .map(order => ({
                _id: order._id,
                date: order.date,
                amount: order.amount,
                status: order.status,
                items: order.items.reduce((sum, item) => sum + item.quantity, 0)
            }));
        
        // Prepare the response
        const stats = {
            totalRevenue,
            totalOrders: orders.length,
            totalProducts: products.length,
            totalCustomers: users.length,
            averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
            recentOrders,
            bestSellers,
            salesByCategory,
            orderStatusDistribution,
            paymentMethodDistribution,
            monthlySales
        };
        
        res.json({ success: true, stats });
        
    } catch (error) {
        console.error("Analytics error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { getDashboardData };