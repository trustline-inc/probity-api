import "express"

declare module "express" {
  export interface AuthRequest extends Request {
    user?: {
      iss: string;
      sub: string;
      aud: string[];
      iat: number;
      exp: number;
      azp: string;
      scope: string;
      permissions: string[];
    },
  }
}
