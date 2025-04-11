import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ParseDatePipe } from '../../../common/pipes/parse-date.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

interface PriceRangeStats {
  range: string;
  count: number;
  averagePrice: number;
  totalValue: number;
}

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Get percentage of deleted products',
    description:
      'Calculates and returns the percentage of products that have been soft deleted',
  })
  @ApiOkResponse({
    description: 'Percentage of deleted products',
    type: Number,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @HttpCode(HttpStatus.OK)
  @Get('deleted-products-percentage')
  async getDeletedProductsPercentage(): Promise<number> {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @ApiOperation({
    summary: 'Get percentage of non-deleted products',
    description:
      'Calculates and returns the percentage of active products with optional filters',
  })
  @ApiOkResponse({
    description: 'Percentage of non-deleted products',
    type: Number,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid date format or price range',
  })
  @ApiQuery({
    name: 'priceMin',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'priceMax',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (YYYY-MM-DD)',
  })
  @HttpCode(HttpStatus.OK)
  @Get('non-deleted-products-percentage')
  async getNonDeletedProductsPercentage(
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('startDate', ParseDatePipe) startDate?: Date,
    @Query('endDate', ParseDatePipe) endDate?: Date,
  ): Promise<number> {
    const priceRange =
      priceMin && priceMax ? { min: priceMin, max: priceMax } : undefined;
    const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

    return this.reportsService.getNonDeletedProductsPercentage(
      priceRange,
      dateRange,
    );
  }

  @ApiOperation({
    summary: 'Get product statistics by price ranges',
    description:
      'Returns statistics for products grouped by custom or default price ranges',
  })
  @ApiOkResponse({
    description: 'Product statistics by price ranges',
    type: Object,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid price range format',
  })
  @ApiQuery({
    name: 'ranges',
    required: false,
    description:
      'Comma-separated price ranges (e.g., "0-100,101-500,501-1000")',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Get('price-range-stats')
  async getProductStatsByPriceRange(
    @Query('ranges') ranges?: string,
  ): Promise<PriceRangeStats[]> {
    const priceRanges = ranges
      ? ranges.split(',').map((range) => {
          const [min, max] = range.split('-').map(Number);
          return { min, max };
        })
      : [
          { min: 0, max: 100 },
          { min: 101, max: 500 },
          { min: 501, max: 1000 },
          { min: 1001, max: 5000 },
          { min: 5001, max: Infinity },
        ];

    return this.reportsService.getProductStatsByPriceRange(priceRanges);
  }
}
