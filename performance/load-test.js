import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    'errors': ['rate<0.1'],           // Error rate must be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test homepage load
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 3s': (r) => r.timings.duration < 3000,
  });

  // Test login API
  const loginRes = http.post(`${BASE_URL}/api/login`, {
    username: 'testuser',
    password: 'testpass',
  });
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test dashboard load
  const dashboardRes = http.get(`${BASE_URL}/dashboard`);
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard loads under 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);
} 