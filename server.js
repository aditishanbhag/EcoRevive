// ============================================
// server.js — EcoRevive Backend (Node + Express + MySQL)
// ============================================

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcrypt');
const pool     = require('./db');

const app  = express();
const PORT = 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());                      // allow frontend to call this API
app.use(express.json());              // parse JSON request bodies
app.use(express.static(__dirname));   // serve your HTML/CSS/JS files


// ══════════════════════════════════════════════════════════
//  POST /api/signup  — Create a new user account
// ══════════════════════════════════════════════════════════
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash the password (never store plain text!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword]
    );

    // Return the new user (without the password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id:         result.insertId,
        firstName,
        lastName,
        email,
        ecoPoints:  100,   // starting bonus
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
//  POST /api/login  — Sign in with email + password
// ══════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Look up the user by email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Compare the entered password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Return user info (never return the hashed password)
    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id:        user.id,
        firstName: user.first_name,
        lastName:  user.last_name,
        email:     user.email,
        ecoPoints: user.eco_points,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET PRODUCTS
app.get('/api/products', async (req,res)=>{
  const [rows]=await pool.query("SELECT * FROM products");
  res.json(rows);
});

// ADD PRODUCT
app.post('/api/addProduct', async (req,res)=>{
  const {name,price,category}=req.body;
  await pool.query(
    "INSERT INTO products (name,price,category) VALUES (?,?,?)",
    [name,price,category]
  );
  res.json({success:true});
});

// ══════════════════════════════════════════════════════════
//  GET /api/user/:id  — Fetch user profile data
// ══════════════════════════════════════════════════════════
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, eco_points, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: {
        id:        user.id,
        firstName: user.first_name,
        lastName:  user.last_name,
        email:     user.email,
        ecoPoints: user.eco_points,
        joinedOn:  user.created_at,
      }
    });

  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// ── Start the Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 EcoRevive server running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT}/marketplace.html in your browser\n`);
});

// ADD PRODUCT
app.post('/api/addProduct', async (req,res)=>{
  const {name,price,category}=req.body;
  await pool.query(
    "INSERT INTO products (name,price,category) VALUES (?,?,?)",
    [name,price,category]
  );
  res.json({success:true});
});

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products");
  res.json(rows);
});

//credit points deduction
app.post('/api/deductPoints', async (req,res)=>{
  const {points} = req.body;

  await pool.query(
    "UPDATE users SET eco_points = eco_points - ? WHERE id = 1",
    [points]
  );

  res.json({success:true});
});

//razorpay
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_ShTcQ52gv8tIPX",
  key_secret: "LG4ylVKPYzx5dpSbBbK8hpUq"
});

//order api
app.post("/api/createOrder", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: "order_rcptid_11"
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

//update impact
app.post('/api/updateImpact', async (req,res)=>{
  const { items, co2, water, energy } = req.body;

  await pool.query(`
    UPDATE impact
    SET 
      items_reused = items_reused + ?,
      co2_saved = co2_saved + ?,
      water_saved = water_saved + ?,
      energy_saved = energy_saved + ?
    WHERE id = 1
  `,[items, co2, water, energy]);

  res.json({success:true});
});

//get impact data
app.get('/api/impact', async (req,res)=>{
  const [rows] = await pool.query("SELECT * FROM impact WHERE id=1");
  res.json(rows[0]);
});

//add points on reading articles
app.post('/api/addPoints', async (req,res)=>{
  const {points} = req.body;

  await pool.query(
    "UPDATE users SET eco_points = eco_points + ? WHERE id = 1",
    [points]
  );

  res.json({success:true});
});