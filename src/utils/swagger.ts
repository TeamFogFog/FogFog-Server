import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setUpSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('FogFog API Docs')
    .setDescription('FogFog API 문서입니다.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
};
