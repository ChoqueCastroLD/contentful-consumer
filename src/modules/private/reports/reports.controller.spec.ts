import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ParseDatePipe } from '../../../common/pipes/parse-date.pipe';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    getDeletedProductsPercentage: jest.fn(),
    getNonDeletedProductsPercentage: jest.fn(),
    getProductStatsByPriceRange: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
        ParseDatePipe,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return percentage of deleted products', async () => {
      const expectedPercentage = 25;
      mockReportsService.getDeletedProductsPercentage.mockResolvedValue(
        expectedPercentage,
      );

      const result = await controller.getDeletedProductsPercentage();

      expect(result).toBe(expectedPercentage);
      expect(
        mockReportsService.getDeletedProductsPercentage,
      ).toHaveBeenCalled();
    });
  });

  describe('getNonDeletedProductsPercentage', () => {
    it('should handle price range filter', async () => {
      const expectedPercentage = 30;
      mockReportsService.getNonDeletedProductsPercentage.mockResolvedValue(
        expectedPercentage,
      );

      const result = await controller.getNonDeletedProductsPercentage(
        100,
        500,
        undefined,
        undefined,
      );

      expect(result).toBe(expectedPercentage);
      expect(
        mockReportsService.getNonDeletedProductsPercentage,
      ).toHaveBeenCalledWith({ min: 100, max: 500 }, undefined);
    });

    it('should handle date range filter', async () => {
      const expectedPercentage = 40;
      mockReportsService.getNonDeletedProductsPercentage.mockResolvedValue(
        expectedPercentage,
      );

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await controller.getNonDeletedProductsPercentage(
        undefined,
        undefined,
        startDate,
        endDate,
      );

      expect(result).toBe(expectedPercentage);
      expect(
        mockReportsService.getNonDeletedProductsPercentage,
      ).toHaveBeenCalledWith(undefined, { startDate, endDate });
    });

    it('should handle both price and date range filters', async () => {
      const expectedPercentage = 35;
      mockReportsService.getNonDeletedProductsPercentage.mockResolvedValue(
        expectedPercentage,
      );

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = await controller.getNonDeletedProductsPercentage(
        100,
        500,
        startDate,
        endDate,
      );

      expect(result).toBe(expectedPercentage);
      expect(
        mockReportsService.getNonDeletedProductsPercentage,
      ).toHaveBeenCalledWith({ min: 100, max: 500 }, { startDate, endDate });
    });
  });

  describe('getProductStatsByPriceRange', () => {
    it('should return statistics for default price ranges', async () => {
      const mockStats = [
        {
          range: '0-100',
          count: 5,
          averagePrice: 50,
          totalValue: 250,
        },
      ];
      mockReportsService.getProductStatsByPriceRange.mockResolvedValue(
        mockStats,
      );

      const result = await controller.getProductStatsByPriceRange();

      expect(result).toEqual(mockStats);
      expect(
        mockReportsService.getProductStatsByPriceRange,
      ).toHaveBeenCalledWith([
        { min: 0, max: 100 },
        { min: 101, max: 500 },
        { min: 501, max: 1000 },
        { min: 1001, max: 5000 },
        { min: 5001, max: Infinity },
      ]);
    });

    it('should return statistics for custom price ranges', async () => {
      const mockStats = [
        {
          range: '0-50',
          count: 3,
          averagePrice: 25,
          totalValue: 75,
        },
        {
          range: '51-100',
          count: 2,
          averagePrice: 75,
          totalValue: 150,
        },
      ];
      mockReportsService.getProductStatsByPriceRange.mockResolvedValue(
        mockStats,
      );

      const result =
        await controller.getProductStatsByPriceRange('0-50,51-100');

      expect(result).toEqual(mockStats);
      expect(
        mockReportsService.getProductStatsByPriceRange,
      ).toHaveBeenCalledWith([
        { min: 0, max: 50 },
        { min: 51, max: 100 },
      ]);
    });
  });
});
