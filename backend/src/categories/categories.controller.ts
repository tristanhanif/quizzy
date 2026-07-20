import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { UserRole } from '../auth/dto/register.dto';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.userId, req.user.role);
  }
}
