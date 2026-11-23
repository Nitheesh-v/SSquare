import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 4000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('S Square Engineering Services API')
    .setDescription(
      'NestJS REST API for S Square Engineering Services — Users, Auth, Categories, Products, Cart, and Custom Orders/RFQs.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Redirect root '/' to Swagger API documentation for immediate developer visibility
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: any, res: any) => {
    res.redirect('/api/docs');
  });

  await app.listen(port, '0.0.0.0');
  logger.log(
    `S Square NestJS Backend running on http://0.0.0.0:${port}/${apiPrefix}`,
  );
  logger.log(`Swagger API Docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
