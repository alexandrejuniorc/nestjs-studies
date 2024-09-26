import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get database(): string {
    return this.config.get<string>('DATABASE');
  }

  get starWarsApiBaseUrl(): string {
    return this.config.get<string>('STAR_WARS_API_BASE_URL');
  }

  get starWarsApiProtagonistId(): number {
    return this.config.get<number>('STAR_WARS_API_PROTAGONIST_ID');
  }
}
