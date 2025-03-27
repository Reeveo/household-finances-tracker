import { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '@/config/swagger/config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
} 