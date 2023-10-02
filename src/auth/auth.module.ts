import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { TOKENS } from 'config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: TOKENS.TOKEN_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    // MailerModule.forRoot({
    //   transport: {
    //     host: SMTP.HOST,
    //     port: SMTP.PORT,
    //     auth: {
    //       user: SMTP.USER,
    //       pass: SMTP.PASS,
    //     },
    //   },
    // }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
