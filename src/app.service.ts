import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Server Details',
      data: {
        name: 'Server',
        version: '1.0',
        description: 'Hello, World!',
      },
    };
  }
}
