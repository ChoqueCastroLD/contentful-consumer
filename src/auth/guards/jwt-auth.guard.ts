import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

interface RequestWithAuth {
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const bearerToken = request.headers?.authorization?.split(' ')[1];

    if (!bearerToken) {
      throw new UnauthorizedException('No token provided');
    }

    return this.authService.validateToken(bearerToken);
  }
}
