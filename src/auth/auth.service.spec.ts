import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return true for a valid token', () => {
      const mockToken = 'valid.token.here';
      const mockVerify = jest.fn().mockReturnValue({
        sub: 'admin',
        username: 'admin',
        iat: 1234567890,
        exp: 1234567890,
      });
      jest.spyOn(jwtService, 'verify').mockImplementation(mockVerify);

      const result = service.validateToken(mockToken);

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalledWith(mockToken);
    });

    it('should return false for an invalid token', () => {
      const mockToken = 'invalid.token.here';
      const mockVerify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });
      (jwtService.verify as jest.Mock) = mockVerify;

      const result = service.validateToken(mockToken);

      expect(result).toBe(false);
      expect(mockVerify).toHaveBeenCalledWith(mockToken);
    });
  });

  describe('generateToken', () => {
    it('should generate a token with the provided payload', () => {
      const mockPayload = {
        sub: 'admin',
        username: 'admin',
      };
      const mockToken = 'generated.token.here';
      const mockSign = jest.fn().mockReturnValue(mockToken);
      (jwtService.sign as jest.Mock) = mockSign;

      const result = service.generateToken(mockPayload.username);

      expect(result).toBe(mockToken);
      expect(mockSign).toHaveBeenCalledWith(mockPayload);
    });
  });
});
