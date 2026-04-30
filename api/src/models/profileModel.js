const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection'); // Assuming you've configured your Sequelize instance
const User = require('./userModel');

const UserProfile = sequelize.define('Profile', {
  id: {
    field: 'id',
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactDetails: {
    type: DataTypes.STRING, // Consider an object with phone, address, etc. (optional)
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
  contactCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userProfileId: {
    field: 'user_profile_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  burden_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total_occupancy: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
});
UserProfile.belongsTo(User, { foreignKey: 'userProfileId', as: 'userProfile' });
User.hasOne(UserProfile, { foreignKey: 'userProfileId', as: 'userProfile' });

module.exports = UserProfile;
