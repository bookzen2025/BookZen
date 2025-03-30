# Tài liệu Yêu cầu Sản phẩm (PRD): Cải thiện Dự án BookZen

**Phiên bản:** 1.0
**Ngày:** 2025-03-30

## 1. Giới thiệu

Tài liệu này mô tả các yêu cầu và đề xuất cải tiến kỹ thuật cho dự án BookZen, dựa trên kết quả review code ban đầu. Mục tiêu là nâng cao chất lượng tổng thể của dự án, bao gồm khả năng bảo trì, hiệu năng, và bảo mật.

**Tổng quan dự án:** BookZen là một ứng dụng web thương mại điện tử bán sách, bao gồm:
*   **Backend:** API RESTful xây dựng bằng Node.js, Express, MongoDB.
*   **Frontend:** Giao diện người dùng (SPA) xây dựng bằng React, Vite, Tailwind CSS.
*   **Admin Panel:** Giao diện quản trị (SPA) xây dựng bằng React, Vite, Tailwind CSS.

Tài liệu này sẽ được sử dụng làm hướng dẫn cho việc triển khai các cải tiến bởi AI hoặc đội ngũ phát triển.

## 2. Mục tiêu (Goals)

*   **Nâng cao chất lượng code:** Cải thiện tính dễ đọc, dễ bảo trì, và khả năng mở rộng của mã nguồn. Tuân thủ các best practices.
*   **Tối ưu hiệu năng:** Giảm thời gian tải trang, tăng tốc độ phản hồi của ứng dụng phía client và server.
*   **Tăng cường bảo mật:** Áp dụng các biện pháp bảo mật cần thiết để bảo vệ dữ liệu và chống lại các lỗ hổng phổ biến.
*   **Cải thiện trải nghiệm phát triển:** Cung cấp tài liệu tốt hơn, chuẩn hóa quy trình.

## 3. Đề xuất cải thiện (Proposed Improvements)

### 3.1. Backend (`backend/`)

#### 3.1.1. Xử lý lỗi tập trung

*   **Hiện trạng:** Chưa có cơ chế xử lý lỗi tập trung rõ ràng. Các controller có thể đang tự xử lý lỗi hoặc không nhất quán.
*   **Đề xuất:**
    1.  Tạo một middleware xử lý lỗi (`errorHandlerMiddleware.js`) trong thư mục `backend/middleware/`.
    2.  Middleware này nhận 4 tham số `(err, req, res, next)`.
    3.  Bên trong middleware:
        *   Log lỗi chi tiết ra console hoặc hệ thống logging (ví dụ: sử dụng `winston` hoặc `pino` nếu cần).
        *   Xác định `statusCode` (mặc định là 500 nếu không có) và `message` từ đối tượng `err`.
        *   Gửi về response lỗi chuẩn hóa dạng JSON: `{ success: false, message: err.message || 'Internal Server Error', statusCode: err.statusCode || 500 }`.
    4.  Sử dụng middleware này ở cuối cùng trong chuỗi middleware trong `server.js`, sau tất cả các routes: `app.use(errorHandlerMiddleware)`.
    5.  Trong các controllers, khi có lỗi, sử dụng `next(error)` để chuyển lỗi đến middleware này thay vì `res.status(...).json(...)` trực tiếp. Tạo các lớp Error tùy chỉnh (ví dụ: `NotFoundError`, `BadRequestError`) kế thừa từ `Error` và có thuộc tính `statusCode`.
*   **Lợi ích:** Chuẩn hóa cách xử lý và trả về lỗi, giảm lặp code, dễ dàng theo dõi và debug.

#### 3.1.2. Validation chi tiết và nhất quán

*   **Hiện trạng:** Sử dụng thư viện `validator` nhưng chưa rõ cách áp dụng và mức độ bao phủ.
*   **Đề xuất:**
    1.  Sử dụng thư viện `express-validator` để thực hiện validation trong middleware.
    2.  Tạo các middleware validation riêng cho từng route hoặc nhóm route cần kiểm tra dữ liệu đầu vào (body, params, query). Ví dụ: `backend/middleware/validators/productValidator.js`.
    3.  Trong middleware validation, định nghĩa các quy tắc kiểm tra (ví dụ: `body('name').notEmpty().isString()`, `param('id').isMongoId()`).
    4.  Sau khi định nghĩa các quy tắc, thêm một middleware nhỏ để kiểm tra kết quả validation (`validationResult` từ `express-validator`) và gọi `next(new BadRequestError(errors.array()))` nếu có lỗi, hoặc `next()` nếu hợp lệ.
    5.  Áp dụng các middleware validation này vào trước controller tương ứng trong các tệp routes.
*   **Lợi ích:** Đảm bảo dữ liệu đầu vào hợp lệ trước khi đến controller, tăng cường bảo mật, code controller sạch hơn.

#### 3.1.3. Tối ưu luồng Upload File (Multer & Cloudinary)

*   **Hiện trạng:** Sử dụng thư mục `uploads` cục bộ và Cloudinary. Cần làm rõ luồng xử lý.
*   **Đề xuất:**
    1.  Review cấu hình Multer trong `backend/middleware/multer.js`.
    2.  **Ưu tiên:** Sử dụng `multer.memoryStorage()` để lưu file tạm thời trong bộ nhớ RAM thay vì ghi ra đĩa.
    3.  Trong controller xử lý upload (ví dụ: `productController.js`), lấy buffer file từ `req.file.buffer` và upload trực tiếp lên Cloudinary.
    4.  Nếu **bắt buộc** phải dùng `diskStorage` (ví dụ: file quá lớn), đảm bảo rằng sau khi upload thành công lên Cloudinary hoặc khi có lỗi xảy ra trong quá trình upload lên Cloudinary, file tạm trong thư mục `uploads` phải được xóa bằng `fs.unlink`.
*   **Lợi ích:** Giảm I/O đĩa không cần thiết, tránh lưu file rác trên server.

#### 3.1.4. Review và Tăng cường Bảo mật CSRF

*   **Hiện trạng:** Có tệp `middleware/csrf.js` nhưng chưa rõ cách triển khai và phạm vi áp dụng.
*   **Đề xuất:**
    1.  Review nội dung `middleware/csrf.js`.
    2.  **Đối với API cho SPA (React):** CSRF thường không phải là vấn đề lớn nếu sử dụng JWT trong Header (Authorization) thay vì cookie session. Đảm bảo rằng:
        *   Backend **không** sử dụng cookie session để xác thực API request từ SPA.
        *   Backend kiểm tra header `Authorization` chứa JWT.
        *   Cấu hình CORS chặt chẽ (`origin` chỉ cho phép domain frontend/admin).
        *   Xem xét kiểm tra thêm header `Origin` hoặc `Referer` nếu cần tăng cường.
    3.  **Nếu có các form HTML truyền thống (không phải SPA):** Middleware CSRF (ví dụ: sử dụng thư viện `csurf` hoặc kỹ thuật double submit cookie) là **bắt buộc** và cần được áp dụng cho tất cả các route xử lý request `POST`, `PUT`, `DELETE` từ các form này.
*   **Lợi ích:** Ngăn chặn tấn công Cross-Site Request Forgery hiệu quả tùy theo ngữ cảnh sử dụng.

#### 3.1.5. Tài liệu hóa API (Swagger/OpenAPI)

*   **Hiện trạng:** Không có tài liệu API tự động.
*   **Đề xuất:**
    1.  Cài đặt các thư viện: `swagger-jsdoc`, `swagger-ui-express`.
    2.  Định nghĩa cấu hình cho `swagger-jsdoc` (thông tin API, đường dẫn đến các tệp chứa định nghĩa route/comment JSDoc).
    3.  Thêm các comment JSDoc theo chuẩn OpenAPI/Swagger vào phía trên các định nghĩa route trong thư mục `backend/routes/` và các schema (nếu cần) để mô tả endpoints, parameters, request bodies, responses.
    4.  Trong `server.js`, tạo một route (ví dụ: `/api-docs`) sử dụng `swagger-ui-express` để phục vụ giao diện Swagger UI, dựa trên thông số kỹ thuật được tạo bởi `swagger-jsdoc`.
*   **Lợi ích:** Cung cấp tài liệu API tương tác, dễ hiểu, giúp việc phát triển frontend/admin và kiểm thử dễ dàng hơn.

### 3.2. Frontend (`frontend/`)

#### 3.2.1. Tối ưu Quản lý State (`ShopContext`)

*   **Hiện trạng:** Sử dụng một `ShopContext` duy nhất có thể trở nên lớn và phức tạp.
*   **Đề xuất:**
    1.  Review chi tiết nội dung và phạm vi của `frontend/src/context/ShopContext.jsx`.
    2.  **Nếu Context quá lớn:** Tách thành các Context nhỏ hơn, chuyên biệt hơn theo chức năng (ví dụ: `AuthContext`, `CartContext`, `WishlistContext`, `ProductFilterContext`). Mỗi Context chỉ quản lý state và logic liên quan đến chức năng đó.
    3.  **Nếu logic phức tạp và nhiều re-render:** Cân nhắc chuyển sang sử dụng thư viện quản lý state nhẹ nhàng và hiệu quả hơn như **Zustand**. Zustand dễ tích hợp, giảm boilerplate và tối ưu re-render tốt hơn Context API thuần túy trong nhiều trường hợp.
*   **Lợi ích:** Cải thiện khả năng bảo trì, tổ chức code tốt hơn, tối ưu hiệu năng (giảm re-render không cần thiết).

#### 3.2.2. Tăng cường Tái sử dụng Logic (Custom Hooks)

*   **Hiện trạng:** Đã có `useAuth.js`, nhưng có thể còn nhiều logic lặp lại trong các component.
*   **Đề xuất:**
    1.  Rà soát mã nguồn trong các thư mục `frontend/src/pages/` và `frontend/src/components/`.
    2.  Xác định các đoạn logic lặp lại, ví dụ:
        *   Fetching dữ liệu từ API (bao gồm xử lý loading, error state).
        *   Tương tác với `localStorage` hoặc `sessionStorage`.
        *   Logic xử lý form phức tạp (ngoài những gì `react-hook-form` đã cung cấp).
        *   Logic liên quan đến định dạng dữ liệu, tính toán.
    3.  Trừu tượng hóa các logic này thành các custom hooks tái sử dụng được trong thư mục `frontend/src/hooks/`. Ví dụ: `useFetch(apiUrl, options)`, `useLocalStorage(key, initialValue)`, `useProductFilters()`.
*   **Lợi ích:** Tuân thủ nguyên tắc DRY (Don't Repeat Yourself), code sạch hơn, dễ đọc và bảo trì.

#### 3.2.3. Hiển thị Footer nhất quán

*   **Hiện trạng:** Component `frontend/src/components/Footer.jsx` tồn tại nhưng không được render trong layout chính `App.jsx`.
*   **Đề xuất:**
    1.  Trong tệp `frontend/src/App.jsx`, import component `Footer`.
    2.  Thêm `<Footer />` vào bên trong thẻ `<main>`, đặt sau thẻ đóng `<Routes>`.
*   **Lợi ích:** Đảm bảo Footer hiển thị đồng nhất trên tất cả các trang của ứng dụng người dùng.

#### 3.2.4. Tối ưu hiệu năng React

*   **Hiện trạng:** Chưa rõ mức độ áp dụng các kỹ thuật tối ưu của React.
*   **Đề xuất:**
    1.  **Memoization:**
        *   Sử dụng `React.memo` bọc các component con nhận props và không cần re-render nếu props không thay đổi (đặc biệt là các component trong danh sách dài hoặc nhận object/array props).
        *   Sử dụng `useMemo` để cache kết quả của các phép tính toán phức tạp bên trong component, tránh tính toán lại mỗi lần re-render.
        *   Sử dụng `useCallback` để memoize các hàm callback được truyền xuống component con (đặc biệt là các hàm được truyền qua Context hoặc làm dependency cho `useEffect`), tránh việc component con re-render không cần thiết.
    2.  **Lazy Loading:**
        *   Sử dụng `React.lazy()` để import động các component trang (trong `frontend/src/App.jsx`).
        *   Bọc `<Routes>` bằng `<React.Suspense fallback={<div>Loading...</div>}>` để hiển thị trạng thái chờ trong khi component được tải.
*   **Lợi ích:** Giảm kích thước bundle ban đầu (lazy loading), giảm số lần re-render không cần thiết, cải thiện tốc độ phản hồi của ứng dụng.

### 3.3. Admin Panel (`admin/`)

#### 3.3.1. Loại bỏ Prop Drilling không cần thiết (`token`)

*   **Hiện trạng:** `token` được truyền từ `App.jsx` xuống các component trang (`Dashboard`, `Products`, v.v.).
*   **Đề xuất:**
    1.  Xác nhận lại mục đích của việc truyền `token`. Vì `axios` đã được cấu hình để tự động gửi token trong header `Authorization` (trong `admin/src/App.jsx`), việc truyền `token` xuống các trang con cho mục đích gọi API là **không cần thiết**.
    2.  Xóa prop `token` khỏi các component trang trong `admin/src/App.jsx` và khỏi định nghĩa props của các component trang đó.
    3.  Nếu `token` thực sự cần thiết cho một logic hiển thị nào đó trong component con (hiếm gặp), hãy cân nhắc tạo một `AuthContext` đơn giản cho admin để cung cấp token thay vì truyền prop qua nhiều cấp.
*   **Lợi ích:** Code sạch hơn, giảm sự phụ thuộc không cần thiết giữa các component.

#### 3.3.2. Quản lý State tập trung (nếu cần)

*   **Hiện trạng:** Chủ yếu sử dụng `useState` cục bộ.
*   **Đề xuất:**
    1.  Đánh giá nhu cầu chia sẻ state giữa các trang/component trong Admin Panel. Ví dụ: bộ lọc dữ liệu áp dụng chung, thông tin cấu hình, dữ liệu dashboard cần cập nhật ở nhiều nơi.
    2.  Nếu có nhu cầu chia sẻ state phức tạp, hãy tạo một hoặc nhiều React Context API riêng cho Admin Panel (ví dụ: `FilterContext`, `DashboardDataContext`) để quản lý state tập trung.
*   **Lợi ích:** Tránh prop drilling phức tạp, quản lý state nhất quán và dễ dàng hơn khi ứng dụng admin phát triển.

## 4. Phi mục tiêu (Non-Goals)

*   Thay đổi các thư viện/framework cốt lõi (React, Express, Vite, Tailwind).
*   Thay đổi cơ sở dữ liệu (MongoDB).
*   Thêm các tính năng nghiệp vụ hoàn toàn mới không liên quan đến cải tiến kỹ thuật.
*   Refactor toàn bộ cấu trúc dự án nếu không thực sự cần thiết cho các mục tiêu cải thiện đã nêu.

## 5. Chỉ số đo lường (Metrics - Tùy chọn)

*   **Hiệu năng Web:** Cải thiện điểm số Lighthouse (Performance, Best Practices, SEO). Giảm chỉ số Core Web Vitals (LCP, FID/INP, CLS).
*   **Chất lượng Code:** Giảm số lượng cảnh báo từ ESLint/linter. Tăng độ bao phủ của test (nếu có).
*   **Độ ổn định:** Giảm số lượng lỗi được ghi nhận trong hệ thống logging.

## 6. Phụ lục (Appendix)

*(Để trống hoặc thêm các tài liệu tham khảo, sơ đồ nếu cần)*
