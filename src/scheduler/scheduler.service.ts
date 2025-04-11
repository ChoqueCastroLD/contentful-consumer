import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from '../modules/public/products/products.service';
import { ContentfulService } from '../modules/common/services/contentful.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly contentfulService: ContentfulService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchAndSyncProducts() {
    try {
      const products = await this.contentfulService.fetchProducts();
      this.logger.log(`First product ${JSON.stringify(products?.[0])}`);
      await this.productsService.syncProductsFromContentful(products);
      this.logger.log(`Synced ${products.length} products.`);
    } catch (error) {
      this.logger.error('Failed to sync products:', error);
      throw error;
    }
  }
}
