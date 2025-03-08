import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Footer from '../components/Footer';
import { TbShoppingBagPlus } from 'react-icons/tb';
import { FaBookOpen, FaCalendarAlt, FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa';
import { BsPersonFill, BsBuildingsFill } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currency, 
    addToCart, 
    backendUrl, 
    user, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    token
  } = useContext(ShopContext);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/product/single`, { productId: id });
        if (response.data.success) {
          setBook(response.data.product);
          
          // Fetch reviews if available
          if (response.data.product.reviews) {
            setReviews(response.data.product.reviews);
          }
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, backendUrl]);
  
  // Kiểm tra xem người dùng đã mua sách này chưa
  useEffect(() => {
    const checkUserPurchased = async () => {
      if (!user || !token) {
        setHasPurchased(false);
        return;
      }
      
      setCheckingPurchase(true);
      
      try {
        const response = await axios.post(
          `${backendUrl}/api/order/check-purchased`,
          { userId: user.id, productId: id },
          { 
            headers: { 
              token,
              'x-csrf-token': localStorage.getItem('csrfToken'),
              'csrf-token': localStorage.getItem('csrfToken')
            } 
          }
        );
        
        if (response.data.success) {
          setHasPurchased(response.data.hasPurchased);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setCheckingPurchase(false);
      }
    };
    
    if (book) {
      checkUserPurchased();
    }
  }, [user, token, id, book, backendUrl]);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(book._id);
    
    // Đặt lại trạng thái sau 500ms
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  // Xử lý thêm/xóa khỏi wishlist
  const handleWishlist = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/login');
      return;
    }
    
    setIsWishlisting(true);
    
    try {
      if (isInWishlist(book._id)) {
        await removeFromWishlist(book._id);
      } else {
        await addToWishlist(book._id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsWishlisting(false);
    }
  };

  // Xử lý thay đổi trong form đánh giá
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  // Xử lý gửi đánh giá mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    
    if (!hasPurchased) {
      toast.error('Bạn cần mua sản phẩm này trước khi đánh giá');
      return;
    }
    
    if (!newReview.comment) {
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      // Tự động lấy tên người dùng từ thông tin đăng nhập
      const reviewWithUserName = {
        ...newReview,
        name: user.name || user.email.split('@')[0] // Sử dụng tên người dùng hoặc phần đầu của email
      };
      
      const response = await axios.post(`${backendUrl}/api/product/review`, {
        productId: id,
        review: reviewWithUserName,
        userId: user.id
      }, { 
        headers: { 
          token,
          'x-csrf-token': localStorage.getItem('csrfToken'),
          'csrf-token': localStorage.getItem('csrfToken')
        } 
      });
      
      if (response.data.success) {
        toast.success('Đánh giá của bạn đã được gửi thành công!');
        
        // Cập nhật danh sách đánh giá
        if (response.data.reviews) {
          setReviews(response.data.reviews);
        } else {
          // Nếu API không trả về danh sách đánh giá mới, thêm đánh giá mới vào danh sách hiện tại
          setReviews(prev => [...prev, { ...reviewWithUserName, date: new Date().toISOString() }]);
        }
        
        // Reset form
        setNewReview({
          rating: 5,
          comment: ''
        });
      } else {
        toast.error(response.data.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Đã xảy ra lỗi khi gửi đánh giá');
      } else {
        toast.error('Đã xảy ra lỗi khi gửi đánh giá');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Hiển thị đánh giá dưới dạng sao
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  // Tính đánh giá trung bình
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="max-padd-container min-h-screen pt-28 flex items-center justify-center">
        <div className="animate-pulse bg-secondary h-10 w-10 rounded-full"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-padd-container min-h-screen pt-28 flex items-center justify-center">
        <p className="text-lg">Book not found</p>
      </div>
    );
  }

  return (
    <section className="max-padd-container min-h-screen">
      <div className="pt-28 pb-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Book Image với sticky behavior - Phiên bản desktop */}
          <div className="hidden md:block md:w-1/3">
            <div className="book-image-sticky">
              <div className="bg-primary p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="max-w-[300px] mx-auto aspect-[3/4] relative">
                  <img
                    src={book.image}
                    alt={book.name}
                    className="shadow-xl shadow-slate-900/30 rounded-lg w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị ảnh trên thiết bị di động */}
          <div className="md:hidden w-full mb-8">
            <div className="bg-primary p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="max-w-[300px] mx-auto aspect-[3/4] relative">
                <img
                  src={book.image}
                  alt={book.name}
                  className="shadow-xl shadow-slate-900/30 rounded-lg w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Book Details - Đảm bảo có đủ nội dung để cuộn */}
          <div className="w-full md:w-2/3" style={{ minHeight: '150vh' }}>
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="h1 text-tertiary mb-1 text-4xl md:text-5xl font-bold">{book.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="medium-16 text-secondary capitalize px-3 py-1 bg-primary rounded-full text-sm">{book.category}</span>
                  {book.author && (
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-1 w-1 rounded-full bg-gray-400"></span>
                      <span className="medium-16">By {book.author}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {renderStars(calculateAverageRating())}
                </div>
                <span className="font-medium">{calculateAverageRating()}</span>
                <span className="text-gray-500 text-sm">({reviews.length} đánh giá)</span>
              </div>

              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-bold text-secondaryOne">{currency}{book.price.toLocaleString('vi-VN')}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    className={`btn-secondaryOne flex items-center gap-2 transition-all duration-300 ${isAdding ? 'scale-105 shadow-md' : 'hover:shadow-md'}`}
                  >
                    <TbShoppingBagPlus className="text-lg" />
                    Thêm vào giỏ hàng
                  </button>
                  
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${isWishlisting ? 'animate-pulse' : ''}`}
                    title={isInWishlist(book?._id) ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                  >
                    {isInWishlist(book?._id) ? (
                      <FaHeart className="text-lg text-red-500" />
                    ) : (
                      <FaRegHeart className="text-lg text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Book Details Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-tertiary mb-4 flex items-center">
                  <span className="inline-block w-2 h-6 bg-secondary rounded-full mr-2"></span>
                  Book Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {book.author && (
                    <div className="flex items-center gap-3">
                      <BsPersonFill className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Author</p>
                        <p className="font-medium">{book.author}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.publisher && (
                    <div className="flex items-center gap-3">
                      <BsBuildingsFill className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Publisher</p>
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.publishedYear && (
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Published Year</p>
                        <p className="font-medium">{book.publishedYear}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.pages && (
                    <div className="flex items-center gap-3">
                      <FaBookOpen className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Pages</p>
                        <p className="font-medium">{book.pages}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-tertiary mb-4 flex items-center">
                  <span className="inline-block w-2 h-6 bg-secondary rounded-full mr-2"></span>
                  Description
                </h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-tertiary mb-4 flex items-center">
                  <span className="inline-block w-2 h-6 bg-secondary rounded-full mr-2"></span>
                  Đánh giá từ khách hàng
                </h4>

                {/* Reviews List */}
                <div className="space-y-6 mb-8">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold">{review.name}</h5>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              {review.date && (
                                <span className="text-xs text-gray-500">
                                  {new Date(review.date).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Chưa có đánh giá nào cho sách này.</p>
                  )}
                </div>

                {/* Add Review Form */}
                <div>
                  <h5 className="font-semibold text-lg mb-4">Thêm đánh giá của bạn</h5>
                  {user ? (
                    hasPurchased ? (
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                            Đánh giá
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              id="rating"
                              name="rating"
                              value={newReview.rating}
                              onChange={handleReviewChange}
                              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                              <option value="5">5 sao</option>
                              <option value="4">4 sao</option>
                              <option value="3">3 sao</option>
                              <option value="2">2 sao</option>
                              <option value="1">1 sao</option>
                            </select>
                            <div className="flex">
                              {renderStars(newReview.rating)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                            Nhận xét của bạn
                          </label>
                          <textarea
                            id="comment"
                            name="comment"
                            value={newReview.comment}
                            onChange={handleReviewChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                          ></textarea>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="btn-secondaryOne flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaShoppingBag className="text-gray-400" />
                          <p>Bạn cần mua sản phẩm này trước khi đánh giá</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600 mb-2">Vui lòng đăng nhập để gửi đánh giá</p>
                      <button 
                        onClick={() => navigate('/login')}
                        className="btn-secondaryOne"
                      >
                        Đăng nhập
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default BookDetail;