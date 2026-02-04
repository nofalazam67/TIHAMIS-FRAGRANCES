// ============================================
// PERFUME E-COMMERCE BACKEND
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// MONGODB CONNECTION
// ============================================
const MONGODB_URI = 'mongodb://localhost:27017/perfume-store';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ============================================
// PRODUCT SCHEMA & MODEL
// ============================================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  size: { type: String, default: '100ml' },
  notes: {
    top: [String],
    heart: [String],
    base: [String]
  },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// ============================================
// ORDER SCHEMA & MODEL
// ============================================
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// ============================================
// INITIAL PRODUCT DATA
// ============================================
const initialProducts = [
  {
    name: "Royal OUD",
    brand: "Tihamis",
    price: 1600,
    originalPrice: 2000,
    description: "A sophisticated blend of dark florals and woody notes, perfect for evening wear. This luxurious fragrance embodies elegance and mystery.",
    image: "Royal OUD1.jpg",
    rating: 4.8,
    reviews: 342,
    inStock: true,
    size: "100ml",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Saffron"],
      heart: ["Rose", "Jasmine", "Violet"],
      base: ["Oud", "Vanilla", "Amber"]
    },
    featured: true
  },
  {
    name: "Citrus Dream",
    brand: "Fresh Essence",
    price: 64.99,
    originalPrice: 84.99,
    description: "A refreshing citrus fragrance that captures the essence of summer. Light, energetic, and perfect for daily wear.",
    category: "fresh",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
    rating: 4.6,
    reviews: 218,
    inStock: true,
    size: "75ml",
    notes: {
      top: ["Lemon", "Orange", "Grapefruit"],
      heart: ["Neroli", "Mint", "Green Tea"],
      base: ["Cedarwood", "Musk"]
    },
    featured: true
  },
  {
    name: "Midnight Rose",
    brand: "Fleur de Paris",
    price: 119.99,
    description: "An enchanting floral masterpiece with a hint of spice. Romantic and timeless, perfect for special occasions.",
    category: "floral",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59cce?w=500",
    rating: 4.9,
    reviews: 467,
    inStock: true,
    size: "100ml",
    notes: {
      top: ["Turkish Rose", "Blackcurrant", "Litchi"],
      heart: ["Peony", "Magnolia", "Freesia"],
      base: ["Patchouli", "White Musk", "Sandalwood"]
    },
    featured: false
  },
  {
    name: "Ocean Breeze",
    brand: "Aqua Vitae",
    price: 54.99,
    originalPrice: 74.99,
    description: "Feel the refreshing ocean spray with this aquatic fragrance. Clean, crisp, and invigorating.",
    category: "fresh",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500",
    rating: 4.4,
    reviews: 156,
    inStock: true,
    size: "75ml",
    notes: {
      top: ["Sea Salt", "Mint", "Bergamot"],
      heart: ["Lavender", "Rosemary", "Sage"],
      base: ["Driftwood", "Ambergris", "Oakmoss"]
    },
    featured: false
  },
  {
    name: "Amber Mystique",
    brand: "Oriental Treasures",
    price: 149.99,
    description: "A rich, warm amber fragrance with exotic spices. Luxurious and captivating, for those who dare to be different.",
    category: "oriental",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500",
    rating: 4.7,
    reviews: 289,
    inStock: true,
    size: "100ml",
    notes: {
      top: ["Cardamom", "Cinnamon", "Bergamot"],
      heart: ["Iris", "Orange Blossom", "Honey"],
      base: ["Amber", "Vanilla", "Tonka Bean"]
    },
    featured: true
  },
  {
    name: "Garden Paradise",
    brand: "Bloom & Co",
    price: 74.99,
    description: "Step into a blooming garden with this fresh floral fragrance. Light, airy, and perfect for spring days.",
    category: "floral",
    image: "https://images.unsplash.com/photo-1619994351824-4f6aebf7dd97?w=500",
    rating: 4.5,
    reviews: 193,
    inStock: true,
    size: "75ml",
    notes: {
      top: ["Apple Blossom", "Pear", "Mandarin"],
      heart: ["Lily of the Valley", "Jasmine", "Peach"],
      base: ["White Musk", "Blonde Woods"]
    },
    featured: false
  }
];

// ============================================
// SEED DATABASE (Run once)
// ============================================
async function seedDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log('✅ Database seeded with products');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

seedDatabase();

// ============================================
// API ROUTES
// ============================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// UPDATE product (name, price, image, etc.)
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
});


// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

// Get featured products
app.get('/api/products/featured/all', async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
});

// Search products
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error });
  }
});

// Filter products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering products', error });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, items, totalAmount } = req.body;
    
    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      items,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ 
      message: 'Order placed successfully!', 
      orderId: savedOrder._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
});

// Get statistics (for dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🌸 PERFUME STORE BACKEND RUNNING    ║
  ║                                        ║
  ║   Port: ${PORT}                        ║
  ║   Database: MongoDB                    ║
  ║   Status: ✅ Ready                     ║
  ╚════════════════════════════════════════╝
  `);
});