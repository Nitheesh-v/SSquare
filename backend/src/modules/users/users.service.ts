import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();
    const existing = await this.userModel
      .findOne({ email: normalizedEmail })
      .exec();

    if (existing) {
      throw new ConflictException(
        `An account with email "${normalizedEmail}" already exists.`,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const created = await this.userModel.create({
      ...createUserDto,
      email: normalizedEmail,
      password: hashedPassword,
      role: createUserDto.role || 'customer',
      isActive: true,
    });

    const obj =
      typeof (created as any).toObject === 'function'
        ? (created as any).toObject()
        : { ...created };
    delete obj.password;
    return obj;
  }

  async findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      updateUserDto.email = updateUserDto.email.toLowerCase().trim();
    }
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return { deleted: true, id };
  }
}
