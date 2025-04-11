import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface TokenPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateToken(token: string): boolean {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      if (!payload.sub || !payload.username) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  generateToken(username: string): string {
    const payload: TokenPayload = {
      sub: username,
      username,
    };
    return this.jwtService.sign(payload);
  }
}
