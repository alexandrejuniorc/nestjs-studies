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
  private readonly refreshTokens = [];
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

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: '60s' },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '1h' },
    );

    this.refreshTokens.push({ value: refreshToken });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const storedToken = this.refreshTokens.find(
      (token) => token.value === refreshToken,
    );
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.verify(refreshToken);
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = this.users.find((user) => user.id === payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newPayload = {
      username: user.email,
      sub: user.id,
      roles: user.roles,
    };

    const newAccessToken = this.jwtService.sign(
      { ...newPayload, type: 'access' },
      { expiresIn: '60s' },
    );

    const newRefreshToken = this.jwtService.sign(
      { ...newPayload, type: 'refresh' },
      { expiresIn: '1h' },
    );

    storedToken.value = newRefreshToken;

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
