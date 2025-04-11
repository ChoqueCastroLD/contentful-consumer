import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    getProducts: jest.fn(),
    deleteProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return products with filters', async () => {
      const mockProducts = [
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

      mockProductsService.getProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAll(filter);

      expect(result).toEqual(mockProducts);
      expect(mockProductsService.getProducts).toHaveBeenCalledWith(filter);
    });

    it('should return products without filters', async () => {
      const mockProducts = [
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

      mockProductsService.getProducts.mockResolvedValue(mockProducts);

      const result = await controller.getAll({});

      expect(result).toEqual(mockProducts);
      expect(mockProductsService.getProducts).toHaveBeenCalledWith({});
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const productId = '1';
      const mockResult = {
        id: productId,
        name: 'Product 1',
      };

      mockProductsService.deleteProduct.mockResolvedValue(mockResult);

      const result = await controller.delete(productId);

      expect(result).toEqual(mockResult);
      expect(mockProductsService.deleteProduct).toHaveBeenCalledWith(productId);
    });

    it('should handle non-existent product', async () => {
      const productId = 'non-existent';
      mockProductsService.deleteProduct.mockResolvedValue(null);

      const result = await controller.delete(productId);

      expect(result).toBeNull();
      expect(mockProductsService.deleteProduct).toHaveBeenCalledWith(productId);
    });
  });
});
