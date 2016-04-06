var Sequelize = require("sequelize");

var db = {};
var sequelize = new Sequelize('evolution', 'iandeboisblanc', null, {
  dialect: 'postgres',
  host: 'localhost',
  port: '5432'
});

var Eve = sequelize.define('eve', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: Sequelize.INTEGER
  },
  generation: {
    type: Sequelize.INTEGER
  }
});

Eve.hasOne(Eve, {foreignKey: 'parent_id'});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Eve = Eve;

module.exports = db;