import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: 'customer',
    });
    const accessToken = await this.signToken(user);
    return {
      accessToken,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const user: any = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const safeUser =
      typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;

    const accessToken = await this.signToken(safeUser);
    return {
      accessToken,
      user: safeUser,
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private async signToken(user: any): Promise<string> {
    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.signAsync(payload);
  }
}
