import { toast } from 'react-toastify';

// Cấu hình mặc định cho toast
export const toastConfig = {
  position: "top-right",
  autoClose: 1500, // Thời gian hiển thị 1.5 giây
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Các hàm toast với cấu hình mặc định
export const showSuccessToast = (message) => {
  toast.success(message, toastConfig);
};

export const showErrorToast = (message) => {
  toast.error(message, toastConfig);
};

export const showInfoToast = (message) => {
  toast.info(message, toastConfig);
};

export const showWarningToast = (message) => {
  toast.warning(message, toastConfig);
}; 