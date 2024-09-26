import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { promisify } from 'node:util';
import { scrypt as _scrypt, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  private readonly users = [];
  private readonly scrypt = promisify(_scrypt);

  constructor(private readonly jwtService: JwtService) {}

  async signUp(email: string, password: string, roles: string[] = []) {
    const userExists = this.users.find((user) => user.email === email);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await this.scrypt(password, salt, 32)) as Buffer;
    const passwordHash = `${salt}.${hash.toString('hex')}`;

    const user = { id: uuid(), email, password: passwordHash, roles };

    this.users.push(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return result;
  }

  async signIn(email: string, password: string) {
    const user = this.users.find((user) => user.email === email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await this.scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.email,
      sub: user.id,
      roles: user.roles,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
