import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { ContentfulService } from '../modules/common/services/contentful.service';
import { Product } from '../modules/public/products/product.entity';
import { ProductsModule } from '../modules/public/products/products.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Product]),
    ProductsModule,
  ],
  providers: [SchedulerService, ContentfulService],
})
export class SchedulerModule {}
