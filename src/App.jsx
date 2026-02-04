import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// ============================================
// MAIN APP COMPONENT WITH ROUTING
// ============================================
function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // PAGE STATES
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'product', 'cart', 'checkout'
  const [selectedProductId, setSelectedProductId] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // ============================================
  // FETCH PRODUCTS
  // ============================================
  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      showNotification('Failed to load products', 'error');
    }
  };

  // ============================================
  // CART MANAGEMENT
  // ============================================
  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('perfume-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (updatedCart) => {
    localStorage.setItem('perfume-cart', JSON.stringify(updatedCart));
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity }];
    }

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    showNotification(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    showNotification('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    saveCartToStorage([]);
    showNotification('Cart cleared', 'info');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // ============================================
  // SEARCH & FILTER
  // ============================================
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterProducts(query, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterProducts(searchQuery, category);
  };

  const filterProducts = (query, category) => {
    let filtered = products;

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const navigateToProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const navigateToCart = () => {
    setCurrentPage('cart');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedProductId(null);
    window.scrollTo(0, 0);
  };

  const navigateToCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  // ============================================
  // RENDER PAGES
  // ============================================
  return (
    <div className="app">
      {/* HEADER */}
      <Header 
        searchQuery={searchQuery}
        onSearch={handleSearch}
        cartCount={getCartCount()}
        onCartClick={navigateToCart}
        onLogoClick={navigateToHome}
      />

      {/* NOTIFICATION */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* PAGE ROUTER */}
      {currentPage === 'home' && (
        <HomePage
          filteredProducts={filteredProducts}
          loading={loading}
          selectedCategory={selectedCategory}
          onCategoryFilter={handleCategoryFilter}
          onProductClick={navigateToProduct}
          onAddToCart={addToCart}
        />
      )}

      {currentPage === 'product' && (
        <ProductPage
          productId={selectedProductId}
          products={products}
          onAddToCart={addToCart}
          onBack={navigateToHome}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onContinueShopping={navigateToHome}
          onCheckout={navigateToCheckout}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          cart={cart}
          cartTotal={getCartTotal()}
          onOrderComplete={() => {
            clearCart();
            navigateToHome();
          }}
          onBack={navigateToCart}
          showNotification={showNotification}
          API_URL={API_URL}
        />
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ searchQuery, onSearch, cartCount, onCartClick, onLogoClick }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
              <img src="/images/LOGO.png" alt="Logo" className="logo-image" />
              <h1>TIHAMIS FRAGRANCE</h1>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search perfumes..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <button className="cart-button" onClick={onCartClick}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// HOME PAGE COMPONENT
// ============================================
function HomePage({ filteredProducts, loading, selectedCategory, onCategoryFilter, onProductClick, onAddToCart }) {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h2>Discover Your Signature Scent</h2>
          <p>Premium fragrances for every occasion</p>
        </div>
      </section>
      <br />
      <br />

      {/* PRODUCTS GRID */}
      <main className="container">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onViewDetails={() => onProductClick(product._id)}
                onAddToCart={() => onAddToCart(product)}
              />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="no-products">
            <p>No products found matching your search.</p>
          </div>
        )}
      </main>
    </>
  );
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
function ProductCard({ product, onViewDetails, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
        <img src={product.image} alt={product.name} />
        {product.featured && <span className="badge">Featured</span>}
        {product.originalPrice && (
          <span className="discount-badge">SALE</span>
        )}
      </div>
      <div className="product-info">
        <p className="brand">{product.brand}</p>
        <h3 className="product-name" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        <p className="product-description">
          {product.description.substring(0, 100)}...
        </p>
        <div className="rating">
          {'⭐'.repeat(Math.floor(product.rating))} {product.rating} ({product.reviews})
        </div>
        <div className="price-section">
          <div className="price">
            RS {product.price}
            {product.originalPrice && (
              <span className="original-price">RS {product.originalPrice}</span>
            )}
          </div>
          <span className="size">{product.size}</span>
        </div>
        <div className="product-actions">
          <button className="btn-primary" onClick={onAddToCart}>
            Add to Cart
          </button>
          <button className="btn-secondary" onClick={onViewDetails}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCT PAGE COMPONENT (NEW!)
// ============================================
function ProductPage({ productId, products, onAddToCart, onBack }) {
  const product = products.find(p => p._id === productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn-primary" onClick={onBack}>Back to Shop</button>
      </div>
    );
  }

  // Product images (main + additional angles)
  const productImages = [
    product.image,
  ];

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  return (
    <div className="product-page">
      <div className="container">
        <button className="back-button" onClick={onBack}>
          ← Back to Shop
        </button>

        <div className="product-details-grid">
          {/* IMAGE GALLERY */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={productImages[selectedImage]} alt={product.name} />
              {product.featured && <span className="badge">Featured</span>}
              {product.originalPrice && <span className="discount-badge">SALE</span>}
            </div>
            <div className="thumbnail-images">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="product-details-info">
            <p className="brand">{product.brand}</p>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="rating-large">
              {'⭐'.repeat(Math.floor(product.rating))} 
              <span className="rating-number">{product.rating}</span>
              <span className="reviews-count">({product.reviews} reviews)</span>
            </div>

            <div className="price-large">
              <span className="current-price">RS {product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="original-price-large">RS {product.originalPrice}</span>
                  <span className="savings">
                    Save RS {(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="stock-status">
              {product.inStock ? (
                <span className="in-stock">✓ In Stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="size-info">
              <strong>Size:</strong> {product.size}
            </div>

            <div className="description-full">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="fragrance-notes">
              <h3>Fragrance Notes</h3>
              <div className="notes-grid">
                <div className="note-category">
                  <h4>Top Notes</h4>
                  <p>{product.notes.top.join(', ')}</p>
                </div>
                <div className="note-category">
                  <h4>Heart Notes</h4>
                  <p>{product.notes.heart.join(', ')}</p>
                </div>
                <div className="note-category">
                  <h4>Base Notes</h4>
                  <p>{product.notes.base.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls-large">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button 
              className="add-to-cart-large" 
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CART PAGE COMPONENT (NEW!)
// ============================================
function CartPage({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onContinueShopping, onCheckout }) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Promo codes (in real app, validate with backend)
  const promoCodes = {
    'SAVE10': { discount: 10, type: 'percentage' },
    'SAVE20': { discount: 20, type: 'percentage' },
    'FIRSTORDER': { discount: 15, type: 'flat' },
    'WELCOME': { discount: 5, type: 'percentage' }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = (subtotal * appliedPromo.discount) / 100;
    } else {
      discount = appliedPromo.discount;
    }
  }

  const total = subtotal + tax + shipping - discount;

  const handleApplyPromo = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo(promo);
      alert(`Promo code applied! ${promo.type === 'percentage' ? promo.discount + '% off' : '$' + promo.discount + ' off'}`);
    } else {
      alert('Invalid promo code');
      setAppliedPromo(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some amazing perfumes to get started!</p>
            <button className="btn-primary" onClick={onContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="clear-cart-btn" onClick={onClearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          {/* CART ITEMS */}
          <div className="cart-items-section">
            {cart.map((item) => (
              <div key={item._id} className="cart-item-card">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="brand">{item.brand}</p>
                  <p className="size">{item.size}</p>
                  <p className="price">${item.price}</p>
                </div>
                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls-large">
                    <button onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}>−</button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item._id, parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <button onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                  <button className="remove-item-btn" onClick={() => onRemoveItem(item._id)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              {/* PROMO CODE */}
              <div className="promo-code-section">
                <label>Promo Code:</label>
                <div className="promo-input-group">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button onClick={handleApplyPromo}>Apply</button>
                </div>
                {appliedPromo && (
                  <p className="promo-applied">
                    ✓ Promo applied: {appliedPromo.type === 'percentage' ? `${appliedPromo.discount}% off` : `$${appliedPromo.discount} off`}
                  </p>
                )}
                <div className="promo-hints">
                  <small>Try: SAVE10, SAVE20, WELCOME</small>
                </div>
              </div>

              {/* TOTALS */}
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount-row">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="shipping-notice">
                  💡 Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
                </p>
              )}

              <button className="checkout-button" onClick={onCheckout}>
                Proceed to Checkout
              </button>

              <button className="continue-shopping-btn" onClick={onContinueShopping}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CHECKOUT PAGE COMPONENT
// ============================================
function CheckoutPage({ cart, cartTotal, onOrderComplete, onBack, showNotification, API_URL }) {
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const orderData = {
        customerName: checkoutForm.customerName,
        email: checkoutForm.email,
        phone: checkoutForm.phone,
        address: `${checkoutForm.address}, ${checkoutForm.city}, ${checkoutForm.zipCode}`,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: parseFloat(cartTotal)
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);
      
      showNotification('Order placed successfully! 🎉', 'success');
      alert(`Order confirmed! Order ID: ${response.data.orderId}\n\nThank you for your purchase!`);
      onOrderComplete();
    } catch (error) {
      console.error('Error placing order:', error);
      showNotification('Failed to place order. Please try again.', 'error');
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <button className="back-button" onClick={onBack}>
          ← Back to Cart
        </button>

        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.customerName}
                    onChange={(e) => setCheckoutForm({...checkoutForm, customerName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  required
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.zipCode}
                    onChange={(e) => setCheckoutForm({...checkoutForm, zipCode: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Information</h2>
              <div className="form-group">
                <label>Card Number *</label>
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={checkoutForm.cardNumber}
                  onChange={(e) => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={checkoutForm.expiryDate}
                    onChange={(e) => setCheckoutForm({...checkoutForm, expiryDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={checkoutForm.cvv}
                    onChange={(e) => setCheckoutForm({...checkoutForm, cvv: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="place-order-btn">
              Place Order - ${cartTotal.toFixed(2)}
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            {cart.map((item) => (
              <div key={item._id} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-total">
              <strong>Total:</strong>
              <strong>${cartTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FOOTER COMPONENT
// ============================================
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>© 2026 TIHAMIS FRAGRANCE. All rights reserved.</p>
        <p> Discover your signature scent</p>
      </div>
    </footer>
  );
}

export default App;