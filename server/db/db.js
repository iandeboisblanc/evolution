var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];

var db = {};
var sequelize = new Sequelize(config.database, config.username, config.password, {
  dialect: config.dialect,
  host: config.host,
  port: config.port
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
  },
  body_parts: {
    type: Sequelize.JSON
  },
  limbs: {
    type: Sequelize.JSON
  },
  killedAt: {
    type: Sequelize.DATE
  }
});

Eve.hasOne(Eve, {foreignKey: 'parent_id'});

sequelize.sync(
  {force:true}
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Eve = Eve;

module.exports = db;