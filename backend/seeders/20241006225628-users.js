'use strict';

const { User } = require('../models');  // Ensure to import your User model

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Sync the database (this is usually done outside of seeding)
      await queryInterface.sequelize.sync();

      // Seed initial users
      await User.bulkCreate(
        [
          { username: 'Nikos', email: 'nick@gmail.com', password: 'nikos321' },
          { username: 'George', email: 'george@yahoo.com', password: 'mycoolpassword78' }
        ],
        {
          fields: ['username', 'email', 'password'], // Specify which fields to insert
          ignoreDuplicates: true,  // Ignore duplicates
        }
      );

      console.log('Users seeded successfully.');
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove users seeded if you need to roll back the migration
    await queryInterface.bulkDelete('users', {
      username: { [Sequelize.Op.in]: ['Nikos', 'George'] },
    }, {});
  }
};
