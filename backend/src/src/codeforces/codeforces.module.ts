import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';

import { CodeforcesController } from './codeforces.controller';

import { CodeforcesService } from './codeforces.service';

import { CodeforcesStateService } from './codeforces-state.service';

@Module({
  imports: [
    HttpModule,
  ],

  controllers: [
    CodeforcesController,
  ],

  providers: [
    CodeforcesService,
    CodeforcesStateService,
  ],

  exports: [
    CodeforcesService,
  ],
})
export class CodeforcesModule {}