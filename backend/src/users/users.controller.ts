import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('search')
  async search(
    @Query('q') query: string,
  ) {
    return this.usersService.searchUsers(
      query ?? '',
    );
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @GetUser() user: any,
    @Body() body: any,
  ) {
    return this.usersService.updateProfile(
      user.id,
      body,
    );
  }

  @Get(':id')
  async getPublicProfile(
    @Param('id') id: string,
  ) {
    return this.usersService.getPublicProfile(
      id,
    );
  }
}