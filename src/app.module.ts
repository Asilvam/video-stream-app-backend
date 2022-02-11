import {
    Logger,
    MiddlewareConsumer,
    Module,
    RequestMethod,
} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {MongooseModule} from '@nestjs/mongoose';
import {MulterModule} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {UserModule} from './user/user.module';
import {VideoModule} from './video/video.module';
import {v4 as uuidv4} from 'uuid';
import {isAuthenticated} from './app.middleware';
import {VideoController} from './video/video.controller';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {configVar} from './shared/config-var';
import {SharedModule} from './shared/shared.module';
import {LoggerMiddleware} from './shared/logger/logger.middleware';
import {Configuration} from './shared/env.enum';

export const secret = 'secret';
const configService = new ConfigService();

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot( process.env.MONGODB_CNN, {
            useNewUrlParser: true,
        }),
        MulterModule.register({
            storage: diskStorage({
                destination: './public',
                filename: (req, file, cb) => {
                    const ext = file.mimetype.split('/')[1];
                    cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
                },
            }),
        }),
        JwtModule.register({
            secret,
            signOptions: {expiresIn: '2h'},
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        UserModule,
        VideoModule,
        SharedModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    static port: number | string;

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(isAuthenticated)
            .exclude({path: 'video/:id', method: RequestMethod.GET})
            .forRoutes(VideoController);
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }

    constructor(private readonly configService: ConfigService) {
        AppModule.port = process.env.PORT;
        console.log(process.env.MONGODB_CNN);
        const logger = new Logger(AppModule.name);
        logger.log(
            `REST: ${this.configService.get(
                Configuration.NODE_NAME,
            )}, LIST ON PORT: ${this.configService.get(Configuration.PORT)}`,
        );
        logger.verbose(`Config VAR: ${JSON.stringify(configVar())}`);
    }
}
