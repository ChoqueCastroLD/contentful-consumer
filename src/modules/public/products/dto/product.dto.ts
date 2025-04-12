import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '4HZHurmc8Ld78PNnI1ReYh',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Apple Mi Watch',
  })
  name: string;

  @ApiProperty({
    description: 'Category the product belongs to',
    example: 'Smartwatch',
  })
  category: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 1410.29,
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    description: 'Date when the product was deleted',
    required: false,
    example: '2024-01-23T21:47:08.012Z',
    nullable: true,
  })
  deletedAt: Date;

  @ApiProperty({
    description: 'Date when the product was created',
    example: '2024-01-23T21:47:08.012Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the product was last updated',
    example: '2024-01-23T21:47:08.012Z',
  })
  updatedAt: Date;
}
