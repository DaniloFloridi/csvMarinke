const request = require('supertest');
const { app, Person, sequelize } = require('../index.js');

beforeAll(async () => {
    if (sequelize && typeof sequelize.sync === 'function') {
        await sequelize.sync({ force: true });
    }
});

afterAll(async () => {
    if (sequelize && typeof sequelize.close === 'function') {
        await sequelize.close();
    }
});

describe('Testando os endpoints de User', () => {
    it('POST /users - Deve criar um novo usuário', async () => {
        const response = await request(app).post('/users').send({
            id: 44,
            nome: 'João Silva',
            nota: 90
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Usuário criado com sucesso!');
    });

    it('GET /users - Deve retornar todos os usuários', async () => {
        const response = await request(app).get('/users');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuários recuperados com sucesso!');
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('GET /users/:id - Deve retornar um usuário específico', async () => {
        const response = await request(app).get('/users/44');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuário encontrado com sucesso!');
        expect(response.body.data.nome).toBe('João Silva');
    });

    it('PUT /users/:id - Deve atualizar um usuário', async () => {
        const response = await request(app).put('/users/44').send({ nome: 'João da Silva' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuário atualizado com sucesso!');
        expect(response.body.data.nome).toBe('João da Silva');
    });

    it('DELETE /users/:id - Deve deletar um usuário', async () => {
        const response = await request(app).delete('/users/44');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Usuário deletado com sucesso!');
    });
});