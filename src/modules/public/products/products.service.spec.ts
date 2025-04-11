import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ILike, Between } from 'typeorm';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findAndCount: jest.fn(),
    insert: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all active products', async () => {
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

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.getProducts({});

      expect(result).toEqual({
        items: mockProducts,
        total: 1,
        page: 1,
      });
      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 5,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return filtered products', async () => {
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

      const filter: FilterProductsDto = {
        minPrice: 50,
        maxPrice: 150,
        category: 'Category 1',
      };

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 1]);

      const result = await service.getProducts(filter);

      expect(result).toEqual({
        items: mockProducts,
        total: 1,
        page: 1,
      });
      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          category: 'Category 1',
          price: Between(50, 150),
        },
        skip: 0,
        take: 5,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return paginated products with filters', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 100,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Product 2',
          price: 200,
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockProductRepository.findAndCount.mockResolvedValue([mockProducts, 2]);

      const result = await service.findAll({
        page: 1,
        limit: 5,
        search: 'Product',
        minPrice: 100,
        maxPrice: 200,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
      });

      expect(result).toEqual({
        items: mockProducts,
        total: 2,
        page: 1,
        limit: 5,
        totalPages: 1,
      });

      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          {
            name: ILike('%Product%'),
            price: Between(100, 200),
            createdAt: Between(new Date('2024-01-01'), new Date('2024-01-02')),
          },
        ],
        skip: 0,
        take: 5,
      });
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        name: 'Product 1',
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
      });

      const deleted = await service.deleteProduct(productId);

      expect(deleted).toBeTruthy();
      expect(mockProductRepository.softDelete).toHaveBeenCalledWith(productId);
    });

    it('should return null for non-existent product', async () => {
      const productId = 'non-existent';
      mockProductRepository.findOne.mockResolvedValue(null);

      const deleted = await service.deleteProduct(productId);

      expect(deleted).toBeFalsy();
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('restoreProduct', () => {
    it('should restore a soft-deleted product', async () => {
      const productId = '1';
      const mockProduct = {
        id: productId,
        name: 'Product 1',
      };

      mockProductRepository.findOne.mockResolvedValueOnce(mockProduct);
      mockProductRepository.restore.mockResolvedValue(undefined);
      mockProductRepository.findOne.mockResolvedValueOnce(mockProduct);

      const restored = await service.restoreProduct(productId);

      expect(restored).toEqual(mockProduct);
      expect(mockProductRepository.restore).toHaveBeenCalledWith(productId);
      expect(mockProductRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('syncProductsFromContentful', () => {
    it('should sync products from Contentful', async () => {
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

      const existingProducts = [{ id: '2' }];
      mockProductRepository.find.mockResolvedValue(existingProducts);
      mockProductRepository.insert.mockResolvedValue(mockProducts);

      await service.syncProductsFromContentful(mockProducts);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        withDeleted: true,
        select: ['id'],
      });
      expect(mockProductRepository.insert).toHaveBeenCalledWith(mockProducts);
    });
  });
});
