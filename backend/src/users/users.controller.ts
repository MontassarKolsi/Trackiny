import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';

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

  @Get(':id')
  async getPublicProfile(
    @Param('id') id: string,
  ) {
    return this.usersService.getPublicProfile(
      id,
    );
  }
}