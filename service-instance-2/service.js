const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3002;
const SERVICE_ID = 'service-instance-2';
const SERVICE_NAME = 'user-service';
const REGISTRY_URL = 'http://localhost:3000';

app.use(express.json());

// Register service on startup
const registerService = async () => {
  try {
    await axios.post(`${REGISTRY_URL}/register`, {
      serviceName: SERVICE_NAME,
      serviceId: SERVICE_ID,
      host: 'localhost',
      port: PORT,
      metadata: {
        region: 'us-west-2',
        version: '1.0.0',
      },
    });
    console.log(`✓ Instance 2 registered with registry`);
  } catch (error) {
    console.error(`✗ Failed to register: ${error.message}`);
    // Retry after 2 seconds
    setTimeout(registerService, 2000);
  }
};

// Deregister service on shutdown
const deregisterService = async () => {
  try {
    await axios.delete(`${REGISTRY_URL}/deregister/${SERVICE_NAME}/${SERVICE_ID}`);
    console.log(`✓ Instance 2 deregistered from registry`);
  } catch (error) {
    console.error(`✗ Failed to deregister: ${error.message}`);
  }
};

// Service endpoint
app.get('/users', (req, res) => {
  res.json({
    source: `Instance 2 (${SERVICE_ID})`,
    data: [
      { id: 3, name: 'Charlie', email: 'charlie@example.com' },
      { id: 4, name: 'Diana', email: 'diana@example.com' },
    ],
    timestamp: new Date().toISOString(),
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({
    source: `Instance 2 (${SERVICE_ID})`,
    user: { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    instance: SERVICE_ID,
    uptime: process.uptime(),
  });
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await deregisterService();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await deregisterService();
  process.exit(0);
});

// Start service
app.listen(PORT, () => {
  console.log(`📦 Service Instance 2 running on http://localhost:${PORT}`);
  registerService();
});
