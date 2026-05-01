const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');
const MissionCard = require('./missionModel');

const SharePoint = sequelize.define(
  'sharePoint',
  {
    id: {
      field: 'id', // database column name
      type: DataTypes.BIGINT, // database column type
      primaryKey: true, // primary key / not
      allowNull: false, // can it be null / not null
      autoIncrement: true, // autoincrement true for Primary key
    },
    url_link: {
      field: 'url_link',
      type: DataTypes.STRING,
      allowNull: true,
    },
    doc_mission_id: {
      //useful for defining foreing key relation as this field will act as FK in this table
      field: 'doc_mission_id',
      allowNull: true,
      type: DataTypes.BIGINT,
    },
  },
  { timestamps: false }
);
SharePoint.belongsTo(MissionCard, {
  foreignKey: 'doc_mission_id',
  as: 'missionCard_links', //alias defined by me
});

MissionCard.hasMany(SharePoint, { foreignKey: 'doc_mission_id', as: 'missionCard_links' });

module.exports = SharePoint;
