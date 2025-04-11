import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../public/products/product.entity';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Not, IsNull } from 'typeorm';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeStats {
  range: string;
  count: number;
  averagePrice: number;
  totalValue: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getDeletedProductsPercentage(): Promise<number> {
    const totalProducts = await this.productRepository.count({
      withDeleted: true,
    });
    const deletedProducts = await this.productRepository.count({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });

    return (deletedProducts / totalProducts) * 100;
  }

  async getNonDeletedProductsPercentage(
    priceRange?: { min: number; max: number },
    dateRange?: { startDate: Date; endDate: Date },
  ): Promise<number> {
    const whereClause: FindOptionsWhere<Product> = {};

    if (priceRange) {
      whereClause.price = Between(priceRange.min, priceRange.max);
    }

    if (dateRange) {
      whereClause.createdAt = Between(dateRange.startDate, dateRange.endDate);
    }

    const totalProducts = await this.productRepository.count({
      where: whereClause,
      withDeleted: true,
    });

    const filteredProducts = await this.productRepository.count({
      where: { ...whereClause, deletedAt: IsNull() },
      withDeleted: true,
    });
    console.log('filteredProducts', filteredProducts);

    return (filteredProducts / totalProducts) * 100;
  }

  async getProductStatsByPriceRange(
    ranges: PriceRange[],
  ): Promise<PriceRangeStats[]> {
    const stats: PriceRangeStats[] = [];

    for (const range of ranges) {
      const products = await this.productRepository.find({
        where: {
          price: Between(range.min, range.max),
        },
      });

      const count = products.length;
      const totalValue = products.reduce(
        (sum, product) => sum + (product.price || 0),
        0,
      );
      const averagePrice = count > 0 ? totalValue / count : 0;

      stats.push({
        range: `${range.min}-${range.max === Infinity ? '∞' : range.max}`,
        count,
        averagePrice: Number(averagePrice.toFixed(2)),
        totalValue: Number(totalValue),
      });
    }

    return stats;
  }
}
