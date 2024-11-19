const sequelize = require('./config/database');

sequelize.authenticate()
    .then(() => {
    console.log('Deu certo !');
    })
    .catch(error => {
    console.error('Erro !', error);
    });
