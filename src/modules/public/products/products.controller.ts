import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ProductDto } from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieves a list of products with optional filtering and pagination',
  })
  @ApiOkResponse({
    description: 'List of products retrieved successfully',
    type: [ProductDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid filter parameters provided',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by product name',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering',
  })
  @Get()
  getAll(@Query() filter: FilterProductsDto) {
    return this.productService.getProducts(filter);
  }

  @ApiOperation({
    summary: 'Delete a product',
    description: 'Soft deletes a product by its ID',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product successfully deleted',
    type: ProductDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
