import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search/:displayId')
  async searchByDisplayId(@Param('displayId') displayId: string) {
    return this.usersService.searchByDisplayId(displayId);
  }

  @Get('profile/:displayId')
  async getUserProfile(@Param('displayId') displayId: string) {
    return this.usersService.getUserProfile(displayId);
  }

  @Post('mutual')
  @HttpCode(HttpStatus.CREATED)
  async sendMutualRequest(@Request() req, @Body() body: { targetDisplayId: string }) {
    return this.usersService.sendMutualRequest(req.user.userId, body.targetDisplayId);
  }

  @Post('mutual/accept')
  @HttpCode(HttpStatus.OK)
  async acceptMutualRequest(@Request() req, @Body() body: { mutualId: string }) {
    return this.usersService.acceptMutualRequest(req.user.userId, body.mutualId);
  }

  @Post('mutual/decline')
  @HttpCode(HttpStatus.OK)
  async declineMutualRequest(@Request() req, @Body() body: { mutualId: string }) {
    return this.usersService.declineMutualRequest(req.user.userId, body.mutualId);
  }

  @Delete('mutual/:mutualId')
  async removeMutual(@Request() req, @Param('mutualId') mutualId: string) {
    return this.usersService.removeMutual(req.user.userId, mutualId);
  }

  @Get('mutual/status/:targetUserId')
  async getMutualStatus(@Request() req, @Param('targetUserId') targetUserId: string) {
    return this.usersService.getMutualStatus(req.user.userId, targetUserId);
  }

  @Get('mutual/list')
  async getMyMutuals(@Request() req) {
    return this.usersService.getMyMutuals(req.user.userId);
  }

  @Get('mutual/pending')
  async getPendingMutuals(@Request() req) {
    return this.usersService.getPendingMutuals(req.user.userId);
  }

  @Get('mutual/count/:userId')
  async getMutualCount(@Param('userId') userId: string) {
    const count = await this.usersService.getMutualCount(userId);
    return { count };
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req, @Body() body: { fullName?: string; picture?: string }) {
    return this.usersService.updateProfile(req.user.userId, body);
  }
}
