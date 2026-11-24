import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);
  const port = Number(configService.get("app.port")) || 4000;
  const apiPrefix = String(configService.get("app.apiPrefix") || "api/v1");

  const origins = String(configService.get("app.corsOrigin") || "")
    .split(",")
    .filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : false,
    credentials: false,
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
    .setTitle("S Square Engineering Services API")
    .setDescription(
      "Server-to-server custom-manufacturing enquiry storage. No commerce, login, cart, payment or public enquiry-list endpoints are registered.",
    )
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Redirect root '/' to Swagger API documentation for immediate developer visibility
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get("/", (_req: any, res: any) => {
    res.redirect("/api/docs");
  });

  await app.listen(port, "0.0.0.0");
  logger.log(
    `S Square NestJS Backend running on http://0.0.0.0:${port}/${apiPrefix}`,
  );
  logger.log(`Swagger API Docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
