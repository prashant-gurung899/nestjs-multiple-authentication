import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partial<CreateUserDto> => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user;
  },
);
