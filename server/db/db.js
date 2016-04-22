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
  distance_traveled: {
    type: Sequelize.FLOAT
  },
  killedAt: {
    type: Sequelize.DATE
  }
});

Eve.hasOne(Eve, {foreignKey: 'parent_id'});

sequelize.sync(
  {force:true}
);

sequelize.query(
  'CREATE OR REPLACE FUNCTION get_progenitor(integer) RETURNS integer AS $$' +
    ' DECLARE' +
      ' generation INTEGER :=10;' +
      ' currentId INTEGER := $1;' +
    ' BEGIN' + 
      ' WHILE generation > 1 LOOP' +
        ' generation :=' +
          ' (SELECT b.generation FROM eves a' +
          ' JOIN eves b ON a.parent_id = b.id' +
          ' WHERE a.id = currentId);' +
        ' currentId :=' +
          ' (SELECT b.id FROM eves a' +
          ' JOIN eves b ON a.parent_id = b.id' +
          ' WHERE a.id = currentId);' +
      ' END LOOP;' +
    ' RETURN currentId;' +
  ' END;' + 
  ' $$ LANGUAGE plpgsql;'
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Eve = Eve;

module.exports = db;