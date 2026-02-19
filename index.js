require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const connectDB = require('./app/config/db');
const adminRoutes = require('./app/routes/adminRoutes');
const sellerRoutes = require('./app/routes/sellerRoutes');
const errorHandler = require('./app/middleware/errorMiddleware');

const app = express();

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'app/uploads')));

app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
