import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { Role } from '@prisma/client';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.username.includes(' ')) {
        throw new HttpException('Username cannot contain spaces', 400);
      }
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: createUserDto.username.toLocaleLowerCase() },
            { email: createUserDto.email.toLocaleLowerCase() },
          ],
        },
      });
      if (user) {
        console.log('user already exists');
        throw new HttpException('Username or Email already exist', 400);
        // throw new HttpException('Username or Email already exists', 400, {
        //   cause: new Error('Some Error'),
        // });
        // throw new HttpException({ message: "message", statusCode: 400, cause: new Error("Some Error") });
      }

      this.authService.validatePassword(createUserDto.password);

      const hashPassword = await argon.hash(createUserDto.password);
      createUserDto.password = hashPassword;

      const { password, ...newUser } = await this.prisma.user.create({
        data: {
          email: createUserDto.email.toLocaleLowerCase(),
          username: createUserDto.username.toLocaleLowerCase(),
          role: Role.USER,
          ...createUserDto,
        },
      });
      return { message: 'Created User Successfully', data: newUser };
    } catch (err) {
      throw new HttpException(
        'Something Went Wrong Creating User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  findAll() {
    return this.prisma.user.findMany();
    // try {
    //   return this.prisma.user.findMany();
    // } catch (err) {
    //   console.log(err);
    // }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: id } });

      return { message: 'Found User', data: user };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Something Went Wrong Finding User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOneByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new HttpException('User not found', 404);
      return { message: 'Found User', data: user };
    } catch (err) {
      throw new HttpException(
        'Something Went Wrong Finding User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        data: updateUserDto,
        where: { id: id },
      });

      return { message: 'User Updated Succesfully', data: user };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Something Went Wrong Updating User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id: id } });

      return { message: 'User Deleted Successfully' };
    } catch (e) {
      throw new HttpException(
        'Something Went Wrong Deleting User',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
