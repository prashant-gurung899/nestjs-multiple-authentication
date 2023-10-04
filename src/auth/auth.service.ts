import {
  HttpException,
  HttpStatus,
  Injectable,
  forwardRef,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TOKENS } from 'config';
import { Prisma, Role, User } from '@prisma/client';
import * as argon from 'argon2';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/decorator';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService, // private mailerService: MailerService,
  ) {}

  // Generates Access & Refresh Token
  async generateToken(payload: any) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
      },
      {
        secret: TOKENS.TOKEN_SECRET,
        expiresIn: TOKENS.TOKEN_EXPIRES_IN,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: payload.id,
        email: payload.email,
        role: payload.role,
      },
      {
        secret: TOKENS.REFRESH_TOKEN,
        expiresIn: TOKENS.REFRESH_TOKEN_EXPIRES_IN,
      },
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    // Checking If User Exists
    const user = await this.userService.findOneByEmail(email);

    // Verifying The Password
    const hashPassword = await argon.verify(user.password, password);

    if (!user || !hashPassword)
      throw new HttpException('Invalid Credentials', HttpStatus.CONFLICT);

    return user;
  }

  // Password Validation
  validatePassword(password: string) {
    const requirements = [
      { regex: /.{8,}/, index: 0, message: 'Min 8 Characters' },
      { regex: /[0-9]/, index: 1, message: 'Atleast One Number' },
      { regex: /[a-z]/, index: 2, message: 'Atleast One Lowercase Letter' },
      { regex: /[A-Z]/, index: 3, message: 'Atleast One Uppercase Letter' },
      {
        regex: /[^A-Za-z0-9]/,
        index: 4,
        message: 'Atleast One Special Character',
      },
    ];

    // Checking If The Password Matches The Requirement Regex
    requirements.forEach((item) => {
      const isValid = item.regex.test(password);

      if (!isValid)
        throw new HttpException(
          `Password Validation Failed: ${item.message}`,
          HttpStatus.FORBIDDEN,
        );
    });
  }

  //No refresh token code
  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return null;
    }
    const payload = { email: user.email, sub: user.id };
    const access_token = await this.jwtService.sign(payload, {
      secret: TOKENS.TOKEN_SECRET,
      expiresIn: TOKENS.TOKEN_EXPIRES_IN,
    });

    const refresh_token = await this.jwtService.sign(payload, {
      secret: TOKENS.REFRESH_TOKEN,
      expiresIn: TOKENS.REFRESH_TOKEN_EXPIRES_IN,
    });

    // const tokens = { access_token, refresh_token };

    // Check if a refresh token already exists for the user
    const existingRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { userId: user.id },
    });

    if (existingRefreshToken) {
      // Update the existing refresh token
      await this.prisma.refreshToken.update({
        where: { id: existingRefreshToken.id },
        data: {
          token_hash: await argon.hash(refresh_token),
        },
      });
    } else {
      // Create a new refresh token for the user
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token_hash: await argon.hash(refresh_token),
        },
      });
    }
    return { access_token, refresh_token };
  }

  // Sign in/up with google
  async withGoogle(req: Request, res: Response) {
    try {
      console.log(req.user);
      // If user already exists, then return user
      // else create new user, then return new user
      const user = await this.prisma.user.upsert({
        where: { email: req.user['email'] },
        update: {},
        create: {
          username: '',
          email: req.user['email'],
          googleId: req.user['googleId'],
          password: '',
          role: Role.USER,
        },
      });

      // Generate Jwt Tokens
      const jwtTokens = await this.generateToken(user);

      // Setting Jwt Tokens In Cookie of Browser
      res.cookie('at_token', jwtTokens.access_token);
      res.cookie('rt_token', jwtTokens.refresh_token);

      // Redirecting to the '/' after successful signinwithgoogle
      res.redirect('/');
    } catch (error) {
      console.error('Error in WithGoogle:', error);
      throw new HttpException(
        'Something Went Wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
