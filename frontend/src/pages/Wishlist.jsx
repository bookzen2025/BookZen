import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { TbShoppingBagPlus } from 'react-icons/tb';
import { FaHeart } from 'react-icons/fa';
import axios from 'axios';
import Footer from '../components/Footer';

const Wishlist = () => {
  const { 
    user, 
    wishlistItems, 
    getWishlist, 
    removeFromWishlist, 
    addToCart, 
    currency, 
    backendUrl 
  } = useContext(ShopContext);
  
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState({});
  const [isAdding, setIsAdding] = useState({});

  useEffect(() => {
    const fetchWishlistBooks = async () => {
      if (!user || !wishlistItems || wishlistItems.length === 0) {
        setWishlistBooks([]);
        setLoading(false);
        return;
      }
      
      try {
        // Lấy thông tin chi tiết của các sách trong wishlist
        const promises = wishlistItems.map(id => 
          axios.post(`${backendUrl}/api/product/single`, { productId: id })
        );
        
        const responses = await Promise.all(promises);
        const books = responses
          .filter(res => res.data.success)
          .map(res => res.data.product);
        
        setWishlistBooks(books);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlistBooks();
  }, [wishlistItems, user, backendUrl]);
  
  // Xử lý xóa khỏi wishlist
  const handleRemoveFromWishlist = async (id) => {
    setIsRemoving(prev => ({ ...prev, [id]: true }));
    
    try {
      await removeFromWishlist(id);
    } catch (error) {
      console.log(error);
    } finally {
      setIsRemoving(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (id) => {
    setIsAdding(prev => ({ ...prev, [id]: true }));
    addToCart(id);
    
    setTimeout(() => {
      setIsAdding(prev => ({ ...prev, [id]: false }));
    }, 500);
  };

  return (
    <section className="min-h-screen pt-28 pb-16">
      <div className="max-padd-container">
        <h1 className="text-3xl md:text-4xl font-bold text-tertiary mb-8">Danh sách yêu thích</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse bg-secondary h-10 w-10 rounded-full"></div>
          </div>
        ) : !user ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Vui lòng đăng nhập để xem danh sách yêu thích</h2>
            <Link to="/login" className="btn-secondaryOne inline-block">Đăng nhập</Link>
          </div>
        ) : wishlistBooks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Danh sách yêu thích của bạn đang trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm sách vào danh sách yêu thích để xem sau</p>
            <Link to="/shop" className="btn-secondaryOne inline-block">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistBooks.map(book => (
              <div key={book._id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="relative group">
                  <Link to={`/book/${book._id}`}>
                    <img 
                      src={book.image} 
                      alt={book.name} 
                      className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(book._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    disabled={isRemoving[book._id]}
                  >
                    {isRemoving[book._id] ? (
                      <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaHeart className="text-red-500 text-xl" />
                    )}
                  </button>
                </div>
                
                <div className="mt-4">
                  <Link to={`/book/${book._id}`}>
                    <h3 className="text-lg font-semibold line-clamp-1 hover:text-secondaryOne transition-colors">
                      {book.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{book.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-tertiary">{currency}{book.price.toLocaleString('vi-VN')}</p>
                    <button
                      onClick={() => handleAddToCart(book._id)}
                      className="p-2 bg-primary rounded-full hover:bg-gray-100 transition-colors"
                      disabled={isAdding[book._id]}
                    >
                      {isAdding[book._id] ? (
                        <div className="h-5 w-5 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <TbShoppingBagPlus className="text-xl text-secondary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
};

export default Wishlist; 