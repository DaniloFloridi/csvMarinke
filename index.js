const express = require('express');
const sequelize = require('./config/database');
const fs = require('fs');
const csv = require('csv-parser');
const { DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

if (!sequelize) {
    throw new Error('Conexão com o banco de dados não estabelecida.');
}

const Person = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nome'
    },
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'nota'
    }
}, {
    tableName: 'users',
    timestamps: false
});

// CREATE - POST
app.post('/users', async (req, res) => {
    try {
        const user = await Person.create(req.body);
        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            data: user
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Erro ao criar usuário',
            error: error.message 
        });
    }
});

// READ ALL - GET
app.get('/users', async (req, res) => {
    try {
        const users = await Person.findAll();
        res.json({
            message: 'Usuários recuperados com sucesso!',
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao buscar usuários',
            error: error.message 
        });
    }
});

// READ ONE - GET
app.get('/users/:id', async (req, res) => {
    try {
        const user = await Person.findByPk(req.params.id);
        if (user) {
            res.json({
                message: 'Usuário encontrado com sucesso!',
                data: user
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao buscar usuário',
            error: error.message 
        });
    }
});

// UPDATE - PUT
app.put('/users/:id', async (req, res) => {
    try {
        const [updated] = await Person.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await Person.findByPk(req.params.id);
            res.json({
                message: 'Usuário atualizado com sucesso!',
                data: updatedUser
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ 
            message: 'Erro ao atualizar usuário',
            error: error.message 
        });
    }
});

// DELETE
app.delete('/users/:id', async (req, res) => {
    try {
        const deleted = await Person.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(200).json({
                message: 'Usuário deletado com sucesso!'
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao deletar usuário',
            error: error.message 
        });
    }
});


app.post('/import-csv', async (req, res) => {
    try {
        await sequelize.authenticate();
        await Person.sync({ force: false });

        const rows = [];
        fs.createReadStream('dados.csv')
            .pipe(csv())
            .on('data', (row) => {
                rows.push({
                    id: parseInt(row.ID),
                    nome: row.Nome || row.NOME || row.nome,
                    nota: parseInt(row.Nota || row.NOTA || row.nota)
                });
            })
            .on('end', async () => {
                try {
                    await Person.bulkCreate(rows, {
                        updateOnDuplicate: ['nome', 'nota']
                    });
                    res.status(200).json({
                        message: 'CSV importado com sucesso!',
                        count: rows.length
                    });
                } catch (error) {
                    res.status(500).json({
                        message: 'Erro ao inserir dados',
                        error: error.message
                    });
                }
            })
            .on('error', (error) => {
                res.status(500).json({
                    message: 'Erro na leitura do CSV',
                    error: error.message
                });
            });
    } catch (error) {
        res.status(500).json({
            message: 'Erro na conexão',
            error: error.message
        });
    }
});

module.exports = { app, Person };

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}