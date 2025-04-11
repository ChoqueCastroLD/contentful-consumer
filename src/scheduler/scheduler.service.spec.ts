import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { ContentfulService } from '../modules/common/services/contentful.service';
import { ProductsService } from '../modules/public/products/products.service';
import { Product } from '../modules/public/products/product.entity';
import { ConfigService } from '@nestjs/config';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const mockContentfulService = {
    fetchProducts: jest.fn(),
  };

  const mockProductsService = {
    syncProductsFromContentful: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAndSyncProducts', () => {
    it('should successfully fetch and sync products', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          category: 'Category 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockContentfulService.fetchProducts.mockResolvedValue(mockProducts);
      mockProductsService.syncProductsFromContentful.mockResolvedValue(
        mockProducts,
      );

      await service.fetchAndSyncProducts();

      expect(mockContentfulService.fetchProducts).toHaveBeenCalled();
      expect(
        mockProductsService.syncProductsFromContentful,
      ).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle Contentful fetch error', async () => {
      const error = new Error('Contentful API error');
      mockContentfulService.fetchProducts.mockRejectedValue(error);

      await expect(service.fetchAndSyncProducts()).rejects.toThrow(error);
      expect(
        mockProductsService.syncProductsFromContentful,
      ).not.toHaveBeenCalled();
    });

    it('should handle sync error', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          category: 'Category 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const error = new Error('Sync error');
      mockContentfulService.fetchProducts.mockResolvedValue(mockProducts);
      mockProductsService.syncProductsFromContentful.mockRejectedValue(error);

      await expect(service.fetchAndSyncProducts()).rejects.toThrow(error);
      expect(mockContentfulService.fetchProducts).toHaveBeenCalled();
      expect(
        mockProductsService.syncProductsFromContentful,
      ).toHaveBeenCalledWith(mockProducts);
    });
  });
});
