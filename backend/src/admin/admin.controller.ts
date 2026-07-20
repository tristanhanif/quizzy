import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Patch('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Get('quizzes')
  async getAllQuizzes() {
    return this.adminService.getAllQuizzes();
  }

  @Delete('quizzes/:quizId')
  @HttpCode(HttpStatus.OK)
  async forceDeleteQuiz(@Param('quizId') quizId: string) {
    return this.adminService.forceDeleteQuiz(quizId);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('maintenance')
  async getMaintenanceMode() {
    return this.adminService.getMaintenanceMode();
  }

  @Post('maintenance')
  @HttpCode(HttpStatus.OK)
  async toggleMaintenanceMode(@Body() body: { enabled: boolean }) {
    return this.adminService.toggleMaintenanceMode(body.enabled);
  }

  @Get('active-sessions')
  async getActiveSessions() {
    return this.adminService.getActiveSessions();
  }

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  async sendBroadcast(@Body() body: { message: string }) {
    return this.adminService.sendBroadcast(body.message);
  }

  @Get('broadcast')
  async getBroadcast() {
    return this.adminService.getBroadcast();
  }

  @Delete('broadcast')
  @HttpCode(HttpStatus.OK)
  async clearBroadcast() {
    return this.adminService.clearBroadcast();
  }
}
