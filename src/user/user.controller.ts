import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/decorator/public.decorator';

@ApiTags('User')
// @ApiBearerAuth('jwt')
// @UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @ApiOperation({ summary: 'Create New User' })
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @ApiOperation({ summary: 'Find all Users' })
  @Get()
  @Public()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Find user by Id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get user by email.' })
  findOneEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @ApiOperation({ summary: 'Update user by id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
