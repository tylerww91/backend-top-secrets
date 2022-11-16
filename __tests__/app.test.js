const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
// const UserService = require('../lib/services/UserService');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'example@test.com',
  password: '123654',
};

/// for returns the current user route
// const registerAndLogin = async (userProps = {}) => {
//   const password = userProps.password ?? mockUser.password;

//   const agent = request.agent(app);

//   const user = await UserService.create({ ...mockUser, ...userProps});

//   const { email } = user;
//   await agent.post('/api/v1/users/sessions').send({ email, password })
// }

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
