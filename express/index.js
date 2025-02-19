const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const prisma = require('./prisma');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, password, isAdmin },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Items Routes
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/request', async (req, res) => {
  const { userId, itemId } = req.body;
  try {
    const request = await prisma.request.create({
      data: { userId, itemId, status: 'PENDING' },
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Admin Routes
app.get('/api/admin/requests', async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      include: { user: true, item: true },
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.post('/api/admin/approve', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await prisma.request.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

app.post('/api/admin/reject', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await prisma.request.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});