import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const token = authService.generateToken('admin');
  console.log('Generated JWT Token:', token);

  await app.close();
}

void bootstrap();
