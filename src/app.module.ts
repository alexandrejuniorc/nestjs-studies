import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevelopersModule } from './developers/developers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { StarWarsModule } from './star-wars/star-wars.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get('DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    DevelopersModule,
    StarWarsModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
