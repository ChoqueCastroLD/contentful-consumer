import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SchedulerService } from '../scheduler/scheduler.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const schedulerService = app.get(SchedulerService);

  try {
    await schedulerService.fetchAndSyncProducts();
    console.log('Products synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing products:', error);
    process.exit(1);
  }

  await app.close();
}

void bootstrap();
