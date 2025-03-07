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
              <div key={book._id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex gap-4 mb-4">
                    <Link to={`/book/${book._id}`} className="block w-24 h-32 flex-shrink-0">
                      <div className="w-full h-full relative">
                        <img 
                          src={book.image} 
                          alt={book.name} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/book/${book._id}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-secondaryOne transition-colors">{book.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <p className="font-bold text-secondaryOne">{currency}{book.price.toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleAddToCart(book._id)}
                      className={`flex-1 py-2 px-3 rounded-lg bg-secondaryOne text-white flex items-center justify-center gap-1 transition-all ${isAdding[book._id] ? 'scale-105' : 'hover:bg-opacity-90'}`}
                    >
                      <TbShoppingBagPlus />
                      <span>Thêm vào giỏ</span>
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(book._id)}
                      className={`p-2 rounded-lg border border-gray-200 text-red-500 transition-all ${isRemoving[book._id] ? 'animate-pulse' : 'hover:bg-gray-50'}`}
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <FaHeart />
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