const users = require('express').Router();
const UserService = require('../services/userService');

// GET users by query params: username, email, or id
users.get('/', async (req, res) => {
  try {
    const { username, email, id } = req.query;

    // Log the query parameters for debugging
    console.log('Received query params:', { username, email, id });

    // Call the service with the filter object
    const filteredUsers = await UserService.getUsersByFilter({ username, email, id });

    res.status(200).json(filteredUsers); // Send the filtered result
  } catch (error) {
    console.error('Error in userController:', error.message); // Log error details
    res.status(500).send('Error retrieving users');
  }
});

module.exports = users;
