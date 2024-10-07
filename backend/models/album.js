'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Album extends Model {
    static associate(models) {
      // Many-to-One relationship: An album belongs to a user
      Album.belongsTo(models.User, { 
        foreignKey: 'userId',  // Foreign key pointing to User
        as: 'user',  // Alias for the user relation
        onDelete: 'CASCADE'  // Optional: Cascade delete
      });
    }
  }

  Album.init({
    album_id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {  // Foreign key linking to the User table
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Name of the table being referenced
        key: 'user_id', // Column in the 'users' table
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Album',
    tableName: 'albums',
    timestamps: false
  });
  
  return Album;
};
