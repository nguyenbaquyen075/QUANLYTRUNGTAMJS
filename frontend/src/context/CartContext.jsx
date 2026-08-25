import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('flashstudy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  const [registeredCourses, setRegisteredCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('flashstudy_registered');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load registered courses from localStorage:', err);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('flashstudy_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('flashstudy_registered', JSON.stringify(registeredCourses));
    } catch (err) {
      console.error('Failed to save registered courses to localStorage:', err);
    }
  }, [registeredCourses]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (course) => {
    const courseId = course.Id || course.id || course.CourseId;
    const exists = cartItems.some((item) => (item.Id || item.id || item.CourseId) === courseId);
    if (exists) {
      showToast(`⚠️ Khóa học "${course.Title || course.title || course.CourseName}" đã có trong giỏ hàng!`);
      return false;
    }

    const normalizedCourse = {
      Id: courseId,
      id: courseId,
      CourseId: courseId,
      Title: course.Title || course.title || course.CourseName || 'Khóa học FlashStudy',
      BasePrice: Number(course.BasePrice || course.price || course.Price || 1300000),
      Price: Number(course.BasePrice || course.price || course.Price || 1300000),
      ImageUrl: course.ImageUrl || course.image || course.ThumbnailUrl || '',
      TotalLessons: course.TotalLessons || course.videos || 36,
      Description: course.Description || course.desc || 'Khóa học chất lượng cao bám sát chương trình THPT'
    };

    setCartItems((prev) => [...prev, normalizedCourse]);
    showToast(`🛒 Đã thêm "${normalizedCourse.Title}" vào giỏ hàng!`);
    return true;
  };

  const removeFromCart = (courseId) => {
    setCartItems((prev) => prev.filter((item) => (item.Id || item.id || item.CourseId) !== courseId));
    showToast('🗑️ Đã xóa khóa học khỏi giỏ hàng.');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const registerCourse = (course) => {
    const courseId = course.Id || course.id || course.CourseId;
    const exists = registeredCourses.some((item) => (item.Id || item.id || item.CourseId) === courseId);
    if (!exists) {
      const normalizedCourse = {
        Id: courseId,
        id: courseId,
        CourseId: courseId,
        Title: course.Title || course.title || course.CourseName || 'Khóa học FlashStudy',
        BasePrice: Number(course.BasePrice || course.price || course.Price || 1300000),
        ImageUrl: course.ImageUrl || course.image || course.ThumbnailUrl || '',
        TotalLessons: course.TotalLessons || course.videos || 36,
        registeredAt: new Date().toISOString(),
        status: 'Đã đăng ký'
      };
      setRegisteredCourses((prev) => [...prev, normalizedCourse]);
    }
    // Remove from cart if present
    setCartItems((prev) => prev.filter((item) => (item.Id || item.id || item.CourseId) !== courseId));
  };

  const isInCart = (courseId) => {
    return cartItems.some((item) => (item.Id || item.id || item.CourseId) === courseId);
  };

  const isRegistered = (courseId) => {
    return registeredCourses.some((item) => (item.Id || item.id || item.CourseId) === courseId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        registeredCourses,
        addToCart,
        removeFromCart,
        clearCart,
        registerCourse,
        isInCart,
        isRegistered,
        cartCount: cartItems.length,
        toastMessage,
        showToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-[#0c2340] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-bounce font-medium text-xs sm:text-sm">
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
