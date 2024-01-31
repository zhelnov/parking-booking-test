import { Module } from '@nestjs/common';

import { TypeOrmGlobalModule } from './typeorm-global';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmGlobalModule.registerGlobalEntities()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
