const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const { request } = require('express');
const request = require('supertest');
const app = require('../lib/app');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'example@test.com',
  password: '123654',
};

describe('top-secret routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('create a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    const { firstName, lastName, email } = mockUser;
    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  afterAll(() => {
    pool.end();
  });
});
