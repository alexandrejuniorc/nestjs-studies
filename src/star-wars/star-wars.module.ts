import { Module } from '@nestjs/common';
import { StarWarsController } from './star-wars.controller';

@Module({
  controllers: [StarWarsController],
})
export class StarWarsModule {}
