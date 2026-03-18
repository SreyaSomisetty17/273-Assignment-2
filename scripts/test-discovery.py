#!/usr/bin/env python3
"""
Service Discovery System - Automated Tester
Tests the microservice discovery system
"""

import requests
import time
import json
import sys
from collections import Counter

REGISTRY_URL = "http://localhost:3000"
SERVICE_NAME = "user-service"


class DiscoveryTester:
    def __init__(self):
        self.registry_url = REGISTRY_URL
        self.service_name = SERVICE_NAME
        self.test_results = {"passed": 0, "failed": 0, "errors": []}

    def test_registry_health(self):
        """Test if registry is running"""
        print("\n📋 Test 1: Registry Health Check")
        try:
            response = requests.get(f"{self.registry_url}/health", timeout=5)
            if response.status_code == 200:
                print("  ✅ Registry is healthy")
                self.test_results["passed"] += 1
                return True
            else:
                print(f"  ❌ Registry returned {response.status_code}")
                self.test_results["failed"] += 1
                return False
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Registry health: {str(e)}")
            return False

    def test_discover_services(self):
        """Test service discovery"""
        print("\n📋 Test 2: Discover Services")
        try:
            response = requests.get(
                f"{self.registry_url}/discover/{self.service_name}", timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                count = data.get("count", 0)
                print(f"  ✅ Discovered {count} instances of {self.service_name}")
                if count >= 2:
                    self.test_results["passed"] += 1
                    return data["instances"]
                else:
                    print(f"  ⚠️  Expected at least 2 instances, found {count}")
                    self.test_results["failed"] += 1
                    return None
            else:
                print(f"  ❌ Discovery returned {response.status_code}")
                self.test_results["failed"] += 1
                return None
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Service discovery: {str(e)}")
            return None

    def test_service_endpoints(self, instances):
        """Test service endpoints"""
        print("\n📋 Test 3: Service Endpoints")
        if not instances:
            print("  ⚠️  No instances to test")
            return False

        all_passed = True
        for instance in instances:
            service_id = instance.get("serviceId", "Unknown")
            host = instance.get("host")
            port = instance.get("port")

            if not host or not port:
                print(f"  ❌ Invalid instance data: {service_id}")
                all_passed = False
                continue

            try:
                url = f"http://{host}:{port}/users"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    source = data.get("source", "Unknown")
                    print(f"  ✅ {service_id}: {source}")
                else:
                    print(f"  ❌ {service_id} returned {response.status_code}")
                    all_passed = False
            except Exception as e:
                print(f"  ❌ {service_id}: {str(e)}")
                all_passed = False

        if all_passed:
            self.test_results["passed"] += 1
        else:
            self.test_results["failed"] += 1

        return all_passed

    def test_health_checks(self, instances):
        """Test health endpoints"""
        print("\n📋 Test 4: Health Checks")
        if not instances:
            print("  ⚠️  No instances to test")
            return False

        all_passed = True
        for instance in instances:
            service_id = instance.get("serviceId", "Unknown")
            host = instance.get("host")
            port = instance.get("port")

            if not host or not port:
                continue

            try:
                url = f"http://{host}:{port}/health"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    status = data.get("status", "unknown")
                    print(f"  ✅ {service_id}: {status}")
                else:
                    print(f"  ❌ {service_id} health check failed")
                    all_passed = False
            except Exception as e:
                print(f"  ❌ {service_id}: {str(e)}")
                all_passed = False

        if all_passed:
            self.test_results["passed"] += 1
        else:
            self.test_results["failed"] += 1

        return all_passed

    def test_load_balancing(self, instances):
        """Test random load balancing across instances"""
        print("\n📋 Test 5: Load Balancing (Random Selection)")
        if not instances or len(instances) < 2:
            print("  ⚠️  Need at least 2 instances")
            return False

        sources = []
        num_requests = 10

        print(f"  Making {num_requests} requests...")

        for i in range(num_requests):
            try:
                # Call any instance endpoint
                host = instances[0].get("host")
                port = instances[0].get("port")
                url = f"http://{host}:{port}/users"
                response = requests.get(url, timeout=5)

                if response.status_code == 200:
                    data = response.json()
                    source = data.get("source", "Unknown")
                    sources.append(source)
                    print(f"    Request {i+1}: {source}")

            except Exception as e:
                print(f"    Request {i+1}: Error - {str(e)}")
                return False

            time.sleep(0.1)  # Small delay between requests

        # Check if we got responses from multiple instances
        unique_sources = set(sources)
        if len(unique_sources) > 1:
            print(f"  ✅ Requests distributed across {len(unique_sources)} instances")
            print(f"     Distribution: {dict(Counter(sources))}")
            self.test_results["passed"] += 1
            return True
        else:
            print(f"  ⚠️  All requests went to same instance")
            self.test_results["failed"] += 1
            return False

    def test_registration_endpoints(self):
        """Test registry endpoints"""
        print("\n📋 Test 6: Registry Endpoints")
        try:
            # Test GET /services
            response = requests.get(f"{self.registry_url}/services", timeout=5)
            if response.status_code == 200:
                print("  ✅ GET /services endpoint works")
                self.test_results["passed"] += 1
                return True
            else:
                print(f"  ❌ GET /services failed with {response.status_code}")
                self.test_results["failed"] += 1
                return False
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.test_results["failed"] += 1
            self.test_results["errors"].append(f"Registry endpoints: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("🧪 SERVICE DISCOVERY - AUTOMATED TESTS")
        print("=" * 60)

        # Test 1: Registry health
        if not self.test_registry_health():
            print("\n❌ Registry is not running!")
            print("   Start it with: cd registry && npm start")
            sys.exit(1)

        time.sleep(1)

        # Test 2: Discover services
        instances = self.test_discover_services()

        time.sleep(1)

        # Test 3: Service endpoints
        self.test_service_endpoints(instances)

        time.sleep(1)

        # Test 4: Health checks
        self.test_health_checks(instances)

        time.sleep(1)

        # Test 5: Load balancing
        self.test_load_balancing(instances)

        time.sleep(1)

        # Test 6: Registry endpoints
        self.test_registration_endpoints()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        total = self.test_results["passed"] + self.test_results["failed"]
        passed = self.test_results["passed"]
        failed = self.test_results["failed"]
        errors = self.test_results["errors"]

        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests:  {total}")
        print(f"✅ Passed:    {passed}")
        print(f"❌ Failed:    {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")

        if errors:
            print("\n⚠️  Errors:")
            for error in errors:
                print(f"   - {error}")

        print("=" * 60)

        # Exit code
        if failed == 0:
            print("\n✅ All tests passed!")
            sys.exit(0)
        else:
            print(f"\n❌ {failed} test(s) failed")
            sys.exit(1)


if __name__ == "__main__":
    tester = DiscoveryTester()
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
