import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('star-wars')
export class StarWarsController {
  private readonly apiBaseUrl: string;

  constructor(config: ConfigService) {
    this.apiBaseUrl = config.get('STAR_WARS_API_BASE_URL');
  }

  @Get('characters')
  async getCharacters() {
    return axios
      .get(`${this.apiBaseUrl}/people`)
      .then((response) => response.data);
  }
}
