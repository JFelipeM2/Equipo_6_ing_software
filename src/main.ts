import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './presentation/interceptors/TransformInterceptor';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExternalServicesDependency } from './infrastructure/env/ExternalServicesDependency';

class Main {
  private app: NestFastifyApplication;
  private externalServices: ExternalServicesDependency;

  public constructor() {
    this.externalServices = new ExternalServicesDependency();
    this.startServices();
  }

  private async startServices(): Promise<void> {
    try {
      await this.externalServices.startServices();
      await this.bootstrap();
    } catch (error) {
      console.error('Error during application startup:', error);
      process.exit(1);
    }
  }

  private async bootstrap() {
    this.app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    this.app.enableCors();

    this.setupInterceptors();
    this.setupPipes();
    this.setupSwagger();

    await this.app.listen(process.env.project_running_port);
    console.log(
      'Application is running on port:',
      process.env.project_running_port,
    );
  }

  private setupInterceptors() {
    this.app.useGlobalInterceptors(new TransformInterceptor());
  }

  private setupPipes() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      }),
    );
  }

  private setupSwagger() {
    const config = new DocumentBuilder()
      .setTitle('API specification')
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('api', this.app, document);
  }
}

new Main();
