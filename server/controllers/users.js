const users = require('express').Router();
const db = require('../models');
const { User } = db;

// GET all users // Update the query to only return users with the username 'Nikos'
users.get('/', async (req, res) => {
  try {
    const allUsers = await User.findAll({
      where: {
        username: 'Nikos'
      }
    });
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).send("Error retrieving users");
    console.error(error);
  }
});

module.exports = users;

