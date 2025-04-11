import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { Product } from './product.entity';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async syncProductsFromContentful(products: Product[]) {
    try {
      const existingProducts = await this.productRepository.find({
        withDeleted: true,
        select: ['id'],
      });
      const existingIds = new Set(existingProducts.map((p) => p.id));
      const newProducts = products.filter((p) => !existingIds.has(p.id));
      if (newProducts.length > 0) {
        await this.productRepository.insert(newProducts);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      throw new InternalServerErrorException('Failed to sync products');
    }
  }

  async getProducts(filter: FilterProductsDto) {
    const { name, category, minPrice, maxPrice, page = 1 } = filter;
    const [items, total] = await this.productRepository.findAndCount({
      where: {
        ...(name ? { name: ILike(`%${name}%`) } : {}),
        ...(category ? { category } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? { price: Between(minPrice ?? 0, maxPrice ?? 1_000_000) }
          : {}),
      },
      skip: (page - 1) * 5,
      take: 5,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page };
  }
  async deleteProduct(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      return false;
    }
    await this.productRepository.softDelete(id);
    return true;
  }

  async restoreProduct(id: string) {
    await this.productRepository.restore(id);
    return await this.findOne(id);
  }

  async findAll(filterDto: FilterProductsDto): Promise<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        minPrice,
        maxPrice,
        startDate,
        endDate,
      } = filterDto;

      const [items, total] = await this.productRepository.findAndCount({
        where: [
          {
            ...(search ? { name: ILike(`%${search}%`) } : {}),
            ...(minPrice !== undefined && maxPrice !== undefined
              ? { price: Between(minPrice, maxPrice) }
              : {}),
            ...(startDate && endDate
              ? {
                  createdAt: Between(new Date(startDate), new Date(endDate)),
                }
              : {}),
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: unknown) {
      console.log('error', error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Failed to fetch products: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch products: Unknown error',
      );
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Failed to fetch product: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to fetch product: Unknown error',
      );
    }
  }
}
