const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'example@test.com',
  password: '123654',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('top-secret routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('create a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    expect(res.status).toBe(200);
    const { firstName, lastName, email } = mockUser;
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('POST /api/v1/sessions signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'example@test.com', password: '123654' });
    expect(res.status).toEqual(200);
  });

  it('DELETE /api/v1/users/sessions logs out a user', async () => {
    const agent = request.agent(app);
    // const user = await UserService.create({ ...mockUser });

    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'example@test.com', password: '123654' });

    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
  });

  it('returns the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const me = await agent.get('/api/v1/users/me');

    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('GET /api/v1/secrets returns list of secrets for authenticated users', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent.get('/api/v1/secrets');
    expect(resp.status).toBe(200);
    expect(resp.body.length).toBe(3);
    expect(resp.body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('POST /api/v1/secrets allows users to create secrets', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent
      .post('/api/v1/secrets')
      .send({ title: 'Birds are not real', description: 'they are drones' });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ message: 'secret creation successful!' });
  });

  afterAll(() => {
    pool.end();
  });
});
