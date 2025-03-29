declare module 'helmet' {
  import { RequestHandler } from 'express';
  function helmet(options?: any): RequestHandler;
  export = helmet;
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  function rateLimit(options?: any): RequestHandler;
  export = rateLimit;
}

declare module 'csurf' {
  import { RequestHandler } from 'express';
  function csrf(options?: any): RequestHandler;
  export = csrf;
}

declare module 'compression' {
  import { RequestHandler } from 'express';
  function compression(options?: any): RequestHandler;
  export = compression;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  function mongoSanitize(options?: any): RequestHandler;
  export = mongoSanitize;
}

declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xss(options?: any): RequestHandler;
  export = xss;
}

declare module 'hpp' {
  import { RequestHandler } from 'express';
  function hpp(options?: any): RequestHandler;
  export = hpp;
}

declare module 'express-validator' {
  import { RequestHandler } from 'express';
  export function body(field: string): any;
  export function validationResult(req: any): {
    isEmpty(): boolean;
    array(): any[];
  };
} 