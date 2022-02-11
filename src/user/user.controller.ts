import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userServerice: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/signup')
  async Signup(@Res() response, @Body() user: User) {
    const newUSer = await this.userServerice.signup(user);
    return response.status(HttpStatus.CREATED).json({
      newUSer,
    });
  }
  @Post('/signin')
  async SignIn(@Res() response, @Body() user: User) {
    const token = await this.userServerice.signin(user, this.jwtService);
    return response.status(HttpStatus.OK).json(token);
  }
}
