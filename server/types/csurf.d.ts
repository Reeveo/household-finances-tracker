declare module 'csurf' {
  import { Request, Response, NextFunction } from 'express';

  export interface CsrfOptions {
    cookie?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      maxAge?: number;
      path?: string;
    };
    ignoreMethods?: string[];
    value?: (req: Request) => string;
  }

  export interface CsrfRequest extends Request {
    csrfToken(): string;
  }

  function csrf(options?: CsrfOptions): (req: CsrfRequest, res: Response, next: NextFunction) => void;
  export = csrf;
} 