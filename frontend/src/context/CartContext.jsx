import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (meal, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.meal._id === meal._id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map((item) =>
          item.meal._id === meal._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevCart, { meal, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (mealId) => {
    setCart((prevCart) => prevCart.filter((item) => item.meal._id !== mealId));
  };

  // Update item quantity
  const updateQuantity = (mealId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.meal._id === mealId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedTimeSlot(null);
    localStorage.removeItem('cart');
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
  };

  // Calculate total calories
  const getTotalCalories = () => {
    return cart.reduce(
      (total, item) => total + item.meal.nutritionalInfo.calories * item.quantity,
      0
    );
  };

  // Calculate total proteins
  const getTotalProteins = () => {
    return cart.reduce(
      (total, item) => total + item.meal.nutritionalInfo.proteins * item.quantity,
      0
    );
  };

  // Get cart item count
  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    selectedTimeSlot,
    setSelectedTimeSlot,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalCalories,
    getTotalProteins,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;
