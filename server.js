const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const cors = require('cors');
const billRoutes = require('./routes/billRoutes');
const path = require("path");
dotenv.config();
const app = express();
app.use(cors());

// app.use(cors({
//   origin: 'http://localhost:3000', // Adjust according to your frontend's URL
//   methods: ['GET', 'POST', 'DELETE'], // Add more methods as necessary
//   credentials: true, // Allow credentials (optional)
// }));

app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api/bill', billRoutes);

app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve the HTML page
});
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
