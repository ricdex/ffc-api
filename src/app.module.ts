import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaModule } from './persona/persona.module';
import { OperacionModule } from './operacion/operacion.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('HOST'),
        port: configService.get('PORT'),
        username: configService.get('USERNAME'),
        password: configService.get('PASS'),
        database: configService.get('DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PersonaModule,
    OperacionModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
