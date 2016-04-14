var sequelize = new Sequelize('database', 'charlie', '', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});
//
// // Or you can simply use a connection uri
// var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
