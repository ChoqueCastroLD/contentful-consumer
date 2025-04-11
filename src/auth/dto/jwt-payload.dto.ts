import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty({ description: 'Unique identifier of the user' })
  sub: string;

  @ApiProperty({ description: 'Username of the user' })
  username: string;

  @ApiProperty({ description: 'Issued at timestamp' })
  iat: number;

  @ApiProperty({ description: 'Expiration timestamp' })
  exp: number;
}
