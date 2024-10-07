'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('albums', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      artist: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Reference to the Users table
          key: 'user_id',      // Column in the Users table
        },
        onDelete: 'CASCADE', // Optional: Cascade delete
        onUpdate: 'CASCADE', // Optional: Cascade update
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('albums');
  },
};
