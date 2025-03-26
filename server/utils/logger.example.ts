import logger, { createLogger } from './logger';

// Example of using the default logger
function loggerExample(): void {
  // Basic logging
  logger.info('Application started');
  logger.debug('Debug information', { details: 'Some debug data' });
  logger.warn('Warning message', { source: 'example' });
  logger.error('Error occurred', { 
    error: new Error('Example error'),
    additionalInfo: 'Some context' 
  });

  // Using child logger with context
  const userLogger = createLogger('UserService');
  userLogger.info('User action', { 
    userId: '123',
    action: 'login' 
  });

  // Example of structured logging
  logger.info('API request completed', {
    method: 'GET',
    path: '/api/users',
    statusCode: 200,
    responseTime: '150ms'
  });

  // Example of error logging with stack trace
  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('Caught an error', { error });
  }
}

export default loggerExample; 