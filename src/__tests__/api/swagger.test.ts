import { createMocks } from 'node-mocks-http';
import swaggerHandler from '@/pages/api/swagger.json';
import { swaggerSpec } from '@/config/swagger/config';

describe('Swagger Documentation API', () => {
  it('should return swagger specification for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await swaggerHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(swaggerSpec);
    expect(res._getHeaders()['content-type']).toBe('application/json');
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await swaggerHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Method not allowed',
    });
  });
}); 