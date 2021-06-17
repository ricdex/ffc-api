import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { ConfigService } from '@nestjs/config';
import { pdf2base64 } from 'pdf-to-base64';
import { generateLink } from '../util/keynua';
import { enviarCorreoEmpresaRegistro } from '../util/sendgrid';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepository.find();
  }

  async registrar(empresa: Empresa): Promise<Empresa> {
    //enviar correo
    const secretKey = this.configService.get('SENDGRID_API_KEY');
    const emailUrl = this.configService.get('SENDGRID_PATH');
    const templateKey = this.configService.get('TEMPLATE_ID');
    const emailSender = this.configService.get('EMAIL_SENDER');
    const keynuaPath = this.configService.get('KEYNUA_PATH');
    const keynuaKey = this.configService.get('KEYNUA_KEY');
    const keynuaToken = this.configService.get('KEYNUA_TOKEN');
    const keynuaLink = this.configService.get('KEYNUA_LINK');
    const documentPDF = this.configService.get('CONTRACT_PDF_URL');

    const base64Str = await pdf2base64(documentPDF);
    //generacion del link
    const tokenLinkUrl = await generateLink(
      keynuaToken,
      keynuaKey,
      base64Str,
      empresa.representanteLegal.nombre,
      empresa.representanteLegal.apellido,
      keynuaPath,
    );

    //generacion del correo
    await enviarCorreoEmpresaRegistro(
      secretKey,
      emailSender,
      empresa,
      keynuaLink,
      tokenLinkUrl,
      templateKey,
      emailUrl,
    );
    return this.empresaRepository.save(empresa);
  }
}
