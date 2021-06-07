import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';

import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get('correo/:correo')
  async findByCorreo(@Param() params): Promise<Usuario> {
    return this.usuarioService.findByCorreo(params.correo);
  }
}
