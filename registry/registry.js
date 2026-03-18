const express = require('express');
const app = express();
const PORT = 3000;

// In-memory service registry
let services = {};

// Middleware
app.use(express.json());

// Register a service
app.post('/register', (req, res) => {
  const { serviceName, serviceId, host, port, metadata } = req.body;

  if (!serviceName || !serviceId || !host || !port) {
    return res.status(400).json({
      error: 'Missing required fields: serviceName, serviceId, host, port',
    });
  }

  if (!services[serviceName]) {
    services[serviceName] = [];
  }

  const service = { serviceId, host, port, metadata, registeredAt: new Date() };
  services[serviceName].push(service);

  console.log(`✓ Service registered: ${serviceName} (${serviceId}) at ${host}:${port}`);
  res.status(201).json({
    success: true,
    message: `Service ${serviceName} registered successfully`,
    service,
  });
});

// Deregister a service
app.delete('/deregister/:serviceName/:serviceId', (req, res) => {
  const { serviceName, serviceId } = req.params;

  if (!services[serviceName]) {
    return res.status(404).json({ error: `Service ${serviceName} not found` });
  }

  const initialLength = services[serviceName].length;
  services[serviceName] = services[serviceName].filter((s) => s.serviceId !== serviceId);

  if (services[serviceName].length === initialLength) {
    return res.status(404).json({ error: `Service instance ${serviceId} not found` });
  }

  if (services[serviceName].length === 0) {
    delete services[serviceName];
  }

  console.log(`✓ Service deregistered: ${serviceName} (${serviceId})`);
  res.json({ success: true, message: `Service ${serviceName} (${serviceId}) deregistered` });
});

// Discover services
app.get('/discover/:serviceName', (req, res) => {
  const { serviceName } = req.params;

  if (!services[serviceName] || services[serviceName].length === 0) {
    return res.status(404).json({ error: `No instances of ${serviceName} found` });
  }

  res.json({
    serviceName,
    instances: services[serviceName],
    count: services[serviceName].length,
  });
});

// Get all registered services
app.get('/health', (req, res) => {
  res.json({ status: 'Registry is running', totalServices: Object.keys(services).length });
});

// Get all registered services
app.get('/services', (req, res) => {
  res.json(services);
});

// Start the registry
app.listen(PORT, () => {
  console.log(`🔍 Service Registry running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  POST   /register - Register a service`);
  console.log(`  DELETE /deregister/:serviceName/:serviceId - Deregister a service`);
  console.log(`  GET    /discover/:serviceName - Discover service instances`);
  console.log(`  GET    /services - List all services`);
  console.log(`  GET    /health - Registry health`);
});
