const fastify = require('fastify')({ logger: true });
const jwt = require('@fastify/jwt');
const bcrypt = require('bcrypt');

const users = [];

fastify.register(jwt, {
  secret: 'your-secret-key',
});

fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://localhost:8080'], // Allow both origins
  credentials: true, // Allow credentials
});

fastify.post('/signup', async (request, reply) => {
  const { username, password } = request.body;

  if (users.find((u) => u.username === username)) {
    reply.code(400).send({ error: 'Username already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });

  reply.code(201).send({ message: 'User created successfully' });
});

fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    reply.code(401).send({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    reply.code(401).send({ error: 'Invalid credentials' });
    return;
  }

  const token = fastify.jwt.sign({ username });
  reply.send({ token });
});

fastify.get('/me', {
  preValidation: (request, reply) => request.jwtVerify(), // Verify JWT token
}, async (request, reply) => {
  // Since we have verified the token, we can access the username from the JWT payload
  const user = request.user; // user object contains decoded JWT payload
  reply.send({ username: user.username }); // Send back the username
});

fastify.get('/protected', {
  preValidation: (request, reply) => request.jwtVerify(),
}, async (request, reply) => {
  reply.send({ message: 'This is protected data', user: request.user });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log('Server is running on http://localhost:3000');
});
