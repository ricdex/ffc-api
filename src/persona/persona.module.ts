import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inversionista } from './entities/inversionista.entity';
import { Empresa } from './entities/empresa.entity';
import { EmpresaController } from './empresa.controller';
import { InversionistaController } from './inversionista.controller';
import { UsuarioController } from './usuario.controller';
import { InversionistaService } from './inversionista.service';
import { EmpresaService } from './empresa.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inversionista]),
    TypeOrmModule.forFeature([Empresa]),
    TypeOrmModule.forFeature([Usuario]),
    HttpModule,
  ],
  controllers: [EmpresaController, InversionistaController, UsuarioController],
  providers: [
    InversionistaService,
    ConfigService,
    EmpresaService,
    UsuarioService,
  ],
})
export class PersonaModule {}
