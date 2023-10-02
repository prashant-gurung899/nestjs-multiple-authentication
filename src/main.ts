import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors());

  // const config = new DocumentBuilder()
  //   .setTitle('Sahayatri Backend Api')
  //   .setDescription('The app for adventurers.')
  //   .setVersion('1.0')
  //   .addTag('meow')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  const config = new DocumentBuilder()
    .setTitle('Sahayatri App')
    .setDescription('The Sahayatri Guru API description')
    .setVersion('1.0')
    // .addTag('Loksewa Book')
    // .addTag('App')
    // .addTag('user')
    // .addTag('book')
    // .addTag('category')
    // .addTag('order')
    // .addTag('cart')
    // .addTag('supplier')

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'Authorization',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
