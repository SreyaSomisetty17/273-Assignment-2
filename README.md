# Microservice Discovery System

A complete implementation of service discovery in microservices architecture with 2 service instances, a service registry, and a discovery client using round-robin/random load balancing.

## Architecture

```
┌────────────────────────────────────────────────┐
│         SERVICE DISCOVERY ARCHITECTURE         │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │     SERVICE REGISTRY (Port: 3000)        │ │
│  │  - Service Registration                  │ │
│  │  - Service Discovery                     │ │
│  │  - Instance Management                   │ │
│  └──────────────────────────────────────────┘ │
│                    ▲                           │
│         ┌──────────┼──────────┐                │
│         │          │          │                │
│         ▼          ▼          ▼                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Service 1  │ │ Service 2  │ │   Client   │ │
│  │ Port: 3001 │ │ Port: 3002 │ │ Discovers  │ │
│  │            │ │            │ │ & Calls    │ │
│  └────────────┘ └────────────┘ └────────────┘ │
│       ▲              ▲              │          │
│       └──────────────┴──────────────┘          │
│         Random/Round-Robin Load Balancing      │
│                                                │
└────────────────────────────────────────────────┘
```

## Components

### 1. **Service Registry** (`registry/`)
- Central registry for service registration and discovery
- REST API endpoints for managing service instances
- In-memory storage of service metadata
- **Port:** 3000

**Endpoints:**
```
POST   /register                          - Register a new service instance
DELETE /deregister/:serviceName/:serviceId - Deregister a service instance
GET    /discover/:serviceName              - Discover all instances of a service
GET    /services                           - List all registered services
GET    /health                             - Health check
```

### 2. **Service Instances** (`service-instance-1/` & `service-instance-2/`)
- Two identical microservice instances
- Automatically register with the registry on startup
- Provide `/users` endpoint with different data
- **Ports:** 3001 and 3002

**Endpoints:**
```
GET    /users              - Get list of users (different data per instance)
GET    /users/:id          - Get specific user by ID
GET    /health             - Health check
```

### 3. **Discovery Client** (`client/`)
- Discovers available service instances
- Implements random/round-robin load balancing
- Makes requests to random instances
- **No port** - runs as a standalone client

**Features:**
- Service discovery from registry
- Random instance selection
- Round-robin load balancing (optional)
- Automatic retry logic

## Setup Instructions

### Prerequisites
- Node.js v14+ 
- npm

### Installation

1. **Install dependencies for all components:**
```bash
# Registry
cd registry && npm install && cd ..

# Service Instance 1
cd service-instance-1 && npm install && cd ..

# Service Instance 2
cd service-instance-2 && npm install && cd ..

# Client
cd client && npm install && cd ..
```

Or use the automated setup script:
```bash
./scripts/setup.sh
```

## Running the Demo

### Option 1: Manual Start (Terminal tabs/windows)

**Terminal 1 - Start Registry:**
```bash
cd registry && npm start
```

**Terminal 2 - Start Service Instance 1:**
```bash
cd service-instance-1 && npm start
```

**Terminal 3 - Start Service Instance 2:**
```bash
cd service-instance-2 && npm start
```

**Terminal 4 - Start Discovery Client:**
```bash
cd client && npm start
```

### Option 2: Automated Start
```bash
./scripts/start-all.sh
```

### Option 3: Using Node Process Manager (pm2)
```bash
npm install -g pm2

# Start all services
pm2 start registry/registry.js --name "registry"
pm2 start service-instance-1/service.js --name "service-1"
pm2 start service-instance-2/service.js --name "service-2"

# Run client
cd client && npm start

# Stop all
pm2 kill
```

## Demo Output

When running the client, you'll see output like:

```
🔍 Service Registry running on http://localhost:3000
📦 Service Instance 1 running on http://localhost:3001
✓ Instance 1 registered with registry

📦 Service Instance 2 running on http://localhost:3002
✓ Instance 2 registered with registry

⏳ Waiting for services to register...

🔍 Discovering services...
✓ Discovered 2 instances of user-service

============================================================
DEMO: Making 5 requests to random instances
============================================================

--- Request 1 ---
📤 Calling: http://localhost:3001/users
   Selected Instance: service-instance-1
✓ Response from service-instance-1:
{
  "source": "Instance 1 (service-instance-1)",
  "data": [...],
  "timestamp": "2024-03-17T10:00:00.000Z"
}

--- Request 2 ---
📤 Calling: http://localhost:3002/users
   Selected Instance: service-instance-2
✓ Response from service-instance-2:
{
  "source": "Instance 2 (service-instance-2)",
  "data": [...],
  "timestamp": "2024-03-17T10:00:01.000Z"
}
```

## API Testing Examples

### View all services in registry
```bash
curl http://localhost:3000/services
```

### Discover service instances
```bash
curl http://localhost:3000/discover/user-service
```

### Call service through client
```bash
curl http://localhost:3001/users
curl http://localhost:3002/users
```

### Check service health
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## Key Features

✅ **Service Registration** - Services auto-register with registry
✅ **Service Discovery** - Client discovers available instances
✅ **Load Balancing** - Random instance selection for each request
✅ **Health Checks** - Monitor service availability
✅ **Graceful Shutdown** - Automatic deregistration on shutdown
✅ **Retry Logic** - Automatic retry for registration failures
✅ **Metadata Support** - Store region, version, and other metadata

## Optional: Service Mesh Integration (Istio/Linkerd)

For production deployments, consider adding a service mesh:

### Benefits:
- **Traffic Routing** - Advanced load balancing policies
- **Observability** - Built-in tracing and monitoring
- **Security** - mTLS and authorization policies
- **Resilience** - Circuit breaking, retries, timeouts

### Example with Istio:
```yaml
# VirtualService for load balancing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - route:
    - destination:
        host: user-service
        subset: v1
      weight: 50
    - destination:
        host: user-service
        subset: v2
      weight: 50
```

## Project Structure

```
273-Assignment-2/
├── registry/
│   ├── registry.js          # Service registry server
│   └── package.json
├── service-instance-1/
│   ├── service.js           # First service instance
│   └── package.json
├── service-instance-2/
│   ├── service.js           # Second service instance
│   └── package.json
├── client/
│   ├── discovery-client.js  # Discovery client
│   └── package.json
├── diagrams/
│   ├── ARCHITECTURE.md      # Architecture diagram
│   └── service-mesh.md      # Service mesh diagram (optional)
├── scripts/
│   ├── setup.sh             # Installation script
│   └── start-all.sh         # Start all services script
└── README.md                # This file
```

## Troubleshooting

### Services fail to register
- Ensure registry is running first
- Check if ports 3000, 3001, 3002 are available
- Look for firewall issues

### Client can't discover services
- Wait 2+ seconds for services to register
- Check registry health: `curl http://localhost:3000/health`
- Verify services in registry: `curl http://localhost:3000/services`

### Connection refused errors
- Ensure all services are running
- Check port numbers in configuration files
- Try restarting all services

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework for services and registry
- **Axios** - HTTP client for service calls
- **JavaScript (ES6+)** - Programming language

## Load Balancing Strategies

### Current Implementation: Random Selection
- Each request randomly selects an available instance
- Good for simple load distribution

### Alternative: Round-Robin
- Cycles through instances sequentially
- More predictable load distribution
- Implementation included in client code

## Performance Considerations

- Registry lookup latency: ~1-2ms per discovery
- Service call latency: ~5-10ms per request
- Supported instances per service: Unlimited (limited by memory)
- Discovery refresh interval: Configurable

## Security Considerations

- ⚠️ Currently no authentication/authorization
- ⚠️ Services accessible from any client
- ✅ Graceful error handling
- ✅ Service validation on registration

For production:
- Implement JWT/OAuth2 authentication
- Add TLS/SSL encryption
- Implement rate limiting
- Add request validation

## Future Enhancements

- [ ] Service mesh integration (Istio/Linkerd)
- [ ] Health check monitoring
- [ ] Automatic instance removal on unhealthy status
- [ ] Service versioning
- [ ] Circuit breaker pattern
- [ ] Request tracing and logging
- [ ] Metrics collection and monitoring
- [ ] Database-backed registry persistence

## Demo Script

Run individual requests to see service discovery in action:

```javascript
// See discovery-client.js for full implementation
const client = new ServiceDiscoveryClient('user-service', 'http://localhost:3000');
await client.discoverServices();
await client.callService('/users'); // Random instance!
```

## License

MIT

## Author

Created for CMPE-273 Assignment 2 - Microservice Architecture

---

**For questions or issues, check the troubleshooting section or create an issue in the repository.**
