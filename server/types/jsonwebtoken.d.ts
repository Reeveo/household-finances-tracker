import { UserRole } from './user';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
  }

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    subject?: string;
    issuer?: string;
    jwtid?: string;
    mutatePayload?: boolean;
    noTimestamp?: boolean;
    header?: object;
    encoding?: string;
  }

  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[];
    clockTimestamp?: number;
    clockTolerance?: number;
    complete?: boolean;
    issuer?: string | string[];
    jwtid?: string;
    nonce?: string;
    subject?: string;
    maxAge?: string | number;
    allowInvalidAsymmetricKeyTypes?: boolean;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions | undefined,
    callback?: (error: Error | null, decoded?: JwtPayload) => void
  ): JwtPayload;

  export function decode(
    token: string,
    options?: DecodeOptions
  ): null | JwtPayload | { [key: string]: any };
}
