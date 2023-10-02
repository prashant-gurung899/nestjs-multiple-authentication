import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { Public } from 'src/decorator/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CurrentUser } from 'src/decorator';
import { LocalAuthGuard } from './guards/local.guard';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  //sign up account
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register User' })
  // @ApiResponse({ status: 201, description: 'Return user .' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return user;
  }

  @Public()
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.WithGoogle(req);
  }
}
