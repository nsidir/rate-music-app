// DEPENDENCIES
const express = require('express');
const { json, urlencoded } = express;
const app = express();
const Sequelize = require('sequelize');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// MIDDLEWARE
dotenv.config();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

// CONTROLLERS
const usersController = require('./controllers/users.js');
app.use('/api/users', usersController);

// LISTEN
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});