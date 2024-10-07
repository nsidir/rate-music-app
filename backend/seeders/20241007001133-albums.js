'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('albums', [
      {
        title: 'Abbey Road',
        artist: 'The Beatles',
        userId: 1,  // Assuming this user_id corresponds to Nikos
      },
      {
        title: 'Thriller',
        artist: 'Michael Jackson',
        userId: 1,  // Again, assuming this user_id corresponds to Nikos
      },
      {
        title: 'Dark Side of the Moon',
        artist: 'Pink Floyd',
        userId: 2,  // Assuming this user_id corresponds to George
      },
      {
        title: 'Back in Black',
        artist: 'AC/DC',
        userId: 2,  // Assuming this user_id corresponds to George
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('albums', null, {});
  }
};
