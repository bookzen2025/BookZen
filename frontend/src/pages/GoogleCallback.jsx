import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGoogleCallback, loading } = useContext(ShopContext);

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // Lấy các tham số từ URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const userId = params.get('userId');
        const error = params.get('error');

        if (error) {
          toast.error('Đăng nhập Google thất bại');
          navigate('/login');
          return;
        }

        if (!token || !refreshToken || !userId) {
          toast.error('Thông tin đăng nhập không hợp lệ');
          navigate('/login');
          return;
        }

        // Xử lý callback
        const result = await handleGoogleCallback({ token, refreshToken, userId });

        if (result.success) {
          // Đặt flag để trang chủ hiển thị thông báo một lần duy nhất
          localStorage.setItem('showLoginSuccess', 'true');
          navigate('/');
        } else {
          toast.error(result.message || 'Đăng nhập thất bại');
          navigate('/login');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Đã xảy ra lỗi khi xử lý đăng nhập Google');
        navigate('/login');
      }
    };

    processGoogleCallback();
  }, [location, handleGoogleCallback, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleCallback; 