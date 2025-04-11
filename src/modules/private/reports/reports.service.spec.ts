import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../public/products/product.entity';
import { Between, IsNull, Not } from 'typeorm';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockProductRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return correct percentage of deleted products', async () => {
      mockProductRepository.count.mockResolvedValueOnce(100); // total products
      mockProductRepository.count.mockResolvedValueOnce(25); // deleted products

      const result = await service.getDeletedProductsPercentage();
      expect(result).toBe(25);
      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(2, {
        where: { deletedAt: Not(IsNull()) },
        withDeleted: true,
      });
    });
  });

  describe('getNonDeletedProductsPercentage', () => {
    it('should return correct percentage with no filters', async () => {
      mockProductRepository.count
        .mockResolvedValueOnce(100) // total products
        .mockResolvedValueOnce(100); // filtered products

      const result = await service.getNonDeletedProductsPercentage();

      expect(result).toBe(100);
      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(1, {
        where: {},
        withDeleted: true,
      });
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(2, {
        where: { deletedAt: IsNull() },
        withDeleted: true,
      });
    });

    it('should return correct percentage with price range filter', async () => {
      mockProductRepository.count
        .mockResolvedValueOnce(100) // total products
        .mockResolvedValueOnce(30); // filtered products

      const result = await service.getNonDeletedProductsPercentage({
        min: 100,
        max: 500,
      });

      expect(result).toBe(30);
      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(1, {
        where: { price: Between(100, 500) },
        withDeleted: true,
      });
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(2, {
        where: { price: Between(100, 500), deletedAt: IsNull() },
        withDeleted: true,
      });
    });

    it('should return correct percentage with date range filter', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      mockProductRepository.count
        .mockResolvedValueOnce(100) // total products
        .mockResolvedValueOnce(40); // filtered products

      const result = await service.getNonDeletedProductsPercentage(undefined, {
        startDate,
        endDate,
      });

      expect(result).toBe(40);
      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(1, {
        where: { createdAt: Between(startDate, endDate) },
        withDeleted: true,
      });
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(2, {
        where: { createdAt: Between(startDate, endDate), deletedAt: IsNull() },
        withDeleted: true,
      });
    });

    it('should return correct percentage with both price and date range filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      mockProductRepository.count
        .mockResolvedValueOnce(100) // total products
        .mockResolvedValueOnce(20); // filtered products

      const result = await service.getNonDeletedProductsPercentage(
        { min: 100, max: 500 },
        { startDate, endDate },
      );

      expect(result).toBe(20);
      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(1, {
        where: {
          price: Between(100, 500),
          createdAt: Between(startDate, endDate),
        },
        withDeleted: true,
      });
      expect(mockProductRepository.count).toHaveBeenNthCalledWith(2, {
        where: {
          price: Between(100, 500),
          createdAt: Between(startDate, endDate),
          deletedAt: IsNull(),
        },
        withDeleted: true,
      });
    });
  });

  describe('getProductStatsByPriceRange', () => {
    it('should handle empty price ranges', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const ranges = [{ min: 0, max: 100 }];
      const result = await service.getProductStatsByPriceRange(ranges);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        range: '0-100',
        count: 0,
        averagePrice: 0,
        totalValue: 0,
      });
    });

    it('should calculate correct statistics for products in range', async () => {
      const mockProducts = [{ price: 50 }, { price: 75 }, { price: 100 }];
      mockProductRepository.find.mockResolvedValue(mockProducts);

      const ranges = [{ min: 0, max: 100 }];
      const result = await service.getProductStatsByPriceRange(ranges);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        range: '0-100',
        count: 3,
        averagePrice: 75,
        totalValue: 225,
      });
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: {
          price: Between(0, 100),
        },
      });
    });

    it('should handle infinite max range', async () => {
      mockProductRepository.find.mockResolvedValue([{ price: 1000 }]);

      const ranges = [{ min: 1000, max: Infinity }];
      const result = await service.getProductStatsByPriceRange(ranges);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        range: '1000-∞',
        count: 1,
        averagePrice: 1000,
        totalValue: 1000,
      });
    });

    it('should handle multiple price ranges', async () => {
      mockProductRepository.find
        .mockResolvedValueOnce([{ price: 50 }])
        .mockResolvedValueOnce([{ price: 150 }, { price: 200 }]);

      const ranges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
      ];
      const result = await service.getProductStatsByPriceRange(ranges);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        range: '0-100',
        count: 1,
        averagePrice: 50,
        totalValue: 50,
      });
      expect(result[1]).toEqual({
        range: '101-200',
        count: 2,
        averagePrice: 175,
        totalValue: 350,
      });
    });

    it('should handle products with undefined prices', async () => {
      const mockProducts = [
        { price: 100 },
        { price: undefined },
        { price: null },
      ];
      mockProductRepository.find.mockResolvedValue(mockProducts);

      const ranges = [{ min: 0, max: 100 }];
      const result = await service.getProductStatsByPriceRange(ranges);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        range: '0-100',
        count: 3,
        averagePrice: 33.33,
        totalValue: 100,
      });
    });
  });
});
