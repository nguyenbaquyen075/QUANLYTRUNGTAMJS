import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { openCart } = useCart();

  useEffect(() => {
    openCart();
    navigate('/Home/Courses', { replace: true });
  }, [navigate, openCart]);

  return null;
}
