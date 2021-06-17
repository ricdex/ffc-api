import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inversionista } from './entities/inversionista.entity';
import { ConfigService } from '@nestjs/config';
import { enviarCorreoRegistroInversionista } from '../util/sendgrid';
import { pdf2base64 } from 'pdf-to-base64';
import { generateLink } from 'src/util/keynua';

@Injectable()
export class InversionistaService {
  constructor(
    @InjectRepository(Inversionista)
    private readonly inversionistaRepository: Repository<Inversionista>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async findAll(): Promise<Inversionista[]> {
    return this.inversionistaRepository.find();
  }

  async registrar(inversionista: Inversionista): Promise<Inversionista> {
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
      inversionista.nombre,
      inversionista.apellido,
      keynuaPath,
    );

    await enviarCorreoRegistroInversionista(
      secretKey,
      emailSender,
      inversionista,
      keynuaLink,
      tokenLinkUrl,
      templateKey,
      emailUrl,
    );
    return this.inversionistaRepository.save(inversionista);
  }
}
