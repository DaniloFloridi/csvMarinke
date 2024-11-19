const sequelize = require('./config/database');
const fs = require('fs');
const csv = require('csv-parser');
const { DataTypes } = require('sequelize');
const { allowedNodeEnvironmentFlags } = require('process');

const Person = sequelize.define('Person', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allownull: false
    }
});

async function importCSV() {
    try {
        await sequelize.authenticate();
        await Person.sync();

        fs.createReadStream('dados.csv')
            .pipe(csv())
            .on('data', async (row) => {
                try {
                    await Person.create({
                        id: row.ID,
                        nome: row.Nome
                    });
                } catch (error) {
                    console.error('Erro ao inserir linha:', error);
                }
            })
            .on('end', () => {
                console.log('CSV importado com sucesso!');
            });
    } catch (error) {
        console.error('Erro na conexão:', error);
    }
}

importCSV();