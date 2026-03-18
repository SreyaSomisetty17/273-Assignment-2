const axios = require('axios');

const REGISTRY_URL = 'http://localhost:3000';
const SERVICE_NAME = 'user-service';

class ServiceDiscoveryClient {
  constructor(serviceName, registryUrl) {
    this.serviceName = serviceName;
    this.registryUrl = registryUrl;
    this.instances = [];
    this.currentIndex = 0;
  }

  // Discover available service instances
  async discoverServices() {
    try {
      const response = await axios.get(`${this.registryUrl}/discover/${this.serviceName}`);
      this.instances = response.data.instances;
      console.log(`✓ Discovered ${this.instances.length} instances of ${this.serviceName}`);
      return this.instances;
    } catch (error) {
      console.error(`✗ Failed to discover services: ${error.message}`);
      throw error;
    }
  }

  // Get next instance using round-robin load balancing
  getNextInstance() {
    if (this.instances.length === 0) {
      throw new Error(`No instances available for ${this.serviceName}`);
    }
    const instance = this.instances[this.currentIndex % this.instances.length];
    this.currentIndex++;
    return instance;
  }

  // Get random instance
  getRandomInstance() {
    if (this.instances.length === 0) {
      throw new Error(`No instances available for ${this.serviceName}`);
    }
    const randomIndex = Math.floor(Math.random() * this.instances.length);
    return this.instances[randomIndex];
  }

  // Make a request to a random service instance
  async callService(endpoint, method = 'GET', data = null) {
    const instance = this.getRandomInstance();
    const url = `http://${instance.host}:${instance.port}${endpoint}`;

    try {
      console.log(`\n📤 Calling: ${url}`);
      console.log(`   Selected Instance: ${instance.serviceId}`);

      const response = await axios({
        method,
        url,
        data,
      });

      console.log(`✓ Response from ${instance.serviceId}:`);
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`✗ Failed to call service: ${error.message}`);
      throw error;
    }
  }
}

// Main demo
async function main() {
  try {
    // Create discovery client
    const client = new ServiceDiscoveryClient(SERVICE_NAME, REGISTRY_URL);

    // Wait for services to register (2 seconds)
    console.log('\n⏳ Waiting for services to register...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Discover services
    console.log('\n🔍 Discovering services...');
    await client.discoverServices();

    // Make multiple requests to demonstrate random instance selection
    console.log('\n' + '='.repeat(60));
    console.log('DEMO: Making 5 requests to random instances');
    console.log('='.repeat(60));

    for (let i = 1; i <= 5; i++) {
      console.log(`\n--- Request ${i} ---`);
      await client.callService('/users');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('DEMO COMPLETE');
    console.log('='.repeat(60));

    // Keep running to show continuous discovery
    console.log('\n📡 Continuing to discover services every 5 seconds...');
    setInterval(async () => {
      await client.discoverServices();
    }, 5000);
  } catch (error) {
    console.error('Demo failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ServiceDiscoveryClient;
