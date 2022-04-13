import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from './strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from 'src/persona/entities/usuario.entity';
import { PersonaModule } from 'src/persona/persona.module';
import { UsuarioService } from 'src/persona/usuario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PersonaModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  providers: [
    AuthService,
    UsuarioService,
    ConfigService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
