const { User, Sequelize } = require('../models');
const { Op } = Sequelize;

const UserService = {
  // Generic function to retrieve users based on dynamic filters
  async getUsersByFilter({ username, email, id }) {
    try {
      const filter = {};

      // Conditional filters
      if (username) {
        filter.username = {
          [Op.iLike]: `%${username}%` // Case-insensitive partial match for Postgres
        };
      }
      if (email) {
        filter.email = {
          [Op.iLike]: `%${email}%` // Case-insensitive partial match for email
        };
      }
      if (id) {
        filter.user_id = {
          [Op.eq]: id // Exact match for id
        };
      }

      // Perform the database query
      const users = await User.findAll({
        where: filter
      });

      return users; // Return the found users
    } catch (error) {
      console.error('Error inside getUsersByFilter:', error.message); // Log error details
      throw new Error('Error retrieving users');
    }
  }
};

module.exports = UserService;
