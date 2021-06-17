import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  HttpService,
  BadRequestException,
} from '@nestjs/common';

import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { EmpresaService } from './empresa.service';

import { Empresa } from './entities/empresa.entity';
import { RegistrarEmpresa } from './entities/empresa.dto';
import { validateCaptcha } from '../util/captcha';

@Controller('empresa')
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  @Get()
  async findAll(): Promise<Empresa[]> {
    return this.empresaService.findAll();
  }

  @Post('onboarding/:token')
  // eslint-disable-next-line prettier/prettier
  async registrarEmpresa(@Body() empresaDTO: RegistrarEmpresa, @Param() params): Promise<Empresa> {
    const secretKey = this.configService.get('RECAPTCHA');
    const result = await validateCaptcha(secretKey, params.token);

    if (!result.success) throw new BadRequestException();

    const empresa = new Empresa().fromDTO(empresaDTO);
    return this.empresaService.registrar(empresa);
  }
}
