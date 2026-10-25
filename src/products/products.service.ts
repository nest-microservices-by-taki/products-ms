import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  private logger = new Logger('Product');
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    console.log({ createProductDto });
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.prisma.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true,
        },
      }),
      metadata: {
        page: page,
        total: totalPages,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
        available: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return this.prisma.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number) {
    // return this.prisma.product.delete({
    //   where: {
    //     id,
    //   },
    // });

    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }
}
