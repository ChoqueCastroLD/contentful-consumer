import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ContentfulClientApi } from 'contentful';
import { Product } from '../../public/products/product.entity';

interface ContentfulProductFields {
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly client: ContentfulClientApi<undefined>;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      space: this.configService.get<string>('CONTENTFUL_SPACE_ID')!,
      accessToken: this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN')!,
      environment: this.configService.get<string>('CONTENTFUL_ENVIRONMENT')!,
    });
  }

  async fetchProducts(): Promise<Product[]> {
    this.logger.log('Fetching products from Contentful...');

    const contentType = this.configService.get<string>(
      'CONTENTFUL_CONTENT_TYPE',
    )!;
    const entries = await this.client.getEntries({
      content_type: contentType,
    });

    this.logger.debug(`Found ${entries.items.length} products in Contentful`);

    return entries.items.map((item) => {
      const fields = item.fields as unknown as ContentfulProductFields;

      return {
        id: item.sys.id,
        name: fields.name,
        description: fields.description ?? '',
        category: fields.category ?? '',
        price: fields.price ?? 0,
        createdAt: new Date(item.sys.createdAt),
        updatedAt: new Date(item.sys.updatedAt),
        deletedAt: null,
      };
    });
  }
}
