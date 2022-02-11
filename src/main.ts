import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  app.use('/healthz', (req, res) => {
    res.send('healthz ok');
  });

  app.setGlobalPrefix('api');
  await app.listen(AppModule.port);
}
bootstrap();
