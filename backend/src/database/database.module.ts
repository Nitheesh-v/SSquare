import { DynamicModule, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  getModelToken,
  ModelDefinition,
  MongooseModule,
} from "@nestjs/mongoose";
import { createInMemoryMongooseModel } from "./in-memory-model.factory";

const logger = new Logger("DatabaseModule");

function hasMongoUri(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
}

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    if (hasMongoUri()) {
      logger.log("Connecting to MongoDB via MONGODB_URI...");
      return {
        module: DatabaseModule,
        imports: [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>("database.uri"),
            }),
          }),
        ],
        exports: [MongooseModule],
      };
    }

    logger.log(
      "MONGODB_URI not set — using the local development RFQ store (.data/store.json). Configure MongoDB for production.",
    );
    return {
      module: DatabaseModule,
    };
  }

  static forFeature(models: ModelDefinition[]): DynamicModule {
    if (hasMongoUri()) {
      return MongooseModule.forFeature(models);
    }

    const providers = models.map((model) => ({
      provide: getModelToken(model.name),
      useValue: createInMemoryMongooseModel(model.name),
    }));

    return {
      module: DatabaseModule,
      providers,
      exports: providers,
    };
  }
}
