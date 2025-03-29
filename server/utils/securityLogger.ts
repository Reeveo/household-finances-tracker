import winston from 'winston';
import { Request } from 'express';
import { securityLogging } from '../config/security';

// Create a logger instance
const logger = winston.createLogger({
  level: securityLogging.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security event types
export enum SecurityEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
  SECURITY_SETTINGS_CHANGE = 'security_settings_change',
  API_ACCESS = 'api_access',
  ERROR = 'error'
}

// Security event severity levels
export enum SecurityEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Security event interface
interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

// Create a security event
export const createSecurityEvent = (
  type: SecurityEventType,
  severity: SecurityEventSeverity,
  req: Request,
  details: Record<string, any> = {}
): SecurityEvent => {
  return {
    type,
    severity,
    userId: req.user?.id?.toString(),
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    details,
    timestamp: new Date()
  };
};

// Log a security event
export const logSecurityEvent = (
  type: SecurityEventType,
  severity: SecurityEventSeverity,
  req: Request,
  details: Record<string, any> = {}
): void => {
  if (!securityLogging.enabled) return;
  if (!securityLogging.logEvents.includes(type)) return;

  const event = createSecurityEvent(type, severity, req, details);
  logger.log(severity, JSON.stringify(event));
};

// Log a login attempt
export const logLoginAttempt = (
  req: Request,
  success: boolean,
  details: Record<string, any> = {}
): void => {
  const severity = success ? SecurityEventSeverity.INFO : SecurityEventSeverity.WARNING;
  logSecurityEvent(SecurityEventType.LOGIN, severity, req, {
    success,
    ...details
  });
};

// Log a logout
export const logLogout = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.LOGOUT, SecurityEventSeverity.INFO, req, details);
};

// Log a password change
export const logPasswordChange = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.PASSWORD_CHANGE, SecurityEventSeverity.INFO, req, details);
};

// Log a profile update
export const logProfileUpdate = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.PROFILE_UPDATE, SecurityEventSeverity.INFO, req, details);
};

// Log a security settings change
export const logSecuritySettingsChange = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.SECURITY_SETTINGS_CHANGE, SecurityEventSeverity.INFO, req, details);
};

// Log an API access
export const logApiAccess = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.API_ACCESS, SecurityEventSeverity.INFO, req, details);
};

// Log a security error
export const logSecurityError = (
  req: Request,
  error: Error,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.ERROR, SecurityEventSeverity.ERROR, req, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...details
  });
};

// Log a critical security event
export const logCriticalSecurityEvent = (
  req: Request,
  details: Record<string, any> = {}
): void => {
  logSecurityEvent(SecurityEventType.ERROR, SecurityEventSeverity.CRITICAL, req, details);
}; 