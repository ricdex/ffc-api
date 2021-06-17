import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, HttpService, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrarInversionista } from './entities/inversionista.dto';

import { Inversionista } from './entities/inversionista.entity';
import { InversionistaService } from './inversionista.service';
import { validateCaptcha } from '../util/captcha';

@Controller('inversionista')
export class InversionistaController {
  constructor(
    private readonly inversionistaService: InversionistaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  @Get()
  async findAll(): Promise<Inversionista[]> {
    return this.inversionistaService.findAll();
  }

  @Post('onboarding/:token')
  // eslint-disable-next-line prettier/prettier
  async registrarEmpresa(@Body() inversionistaDTO: RegistrarInversionista, @Param() params): Promise<Inversionista> {
    const secretKey = this.configService.get('RECAPTCHA');
    const result = await validateCaptcha(secretKey, params.token);

    if (!result.success) throw new BadRequestException();

    const inversionista = new Inversionista().fromDTO(inversionistaDTO);
    return this.inversionistaService.registrar(inversionista);
  }

}
