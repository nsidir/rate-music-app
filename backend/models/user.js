'use strict';
const { tab } = require('@testing-library/user-event/dist/tab');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Album, { 
        foreignKey: 'userId',  // Foreign key in the Album table
        as: 'albums',  // Alias for the albums relationship
        onDelete: 'CASCADE' // Optional: Cascade delete when a user is deleted
      });
    }
  }
  User.init({
    user_id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    password: { 
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });
  return User;
};