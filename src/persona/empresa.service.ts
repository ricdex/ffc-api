import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { ConfigService } from '@nestjs/config';
import { pdf2base64 } from 'pdf-to-base64';

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
    const headersRequestKeynua = {
      'Content-Type': 'application/json',
      authorization: `${keynuaToken}`,
      'x-api-key': `${keynuaKey}`,
    };
    const dataKeynua = {
      title: 'Contrato de registro en FFC',
      languague: 'es',
      documents: [
        {
          name: 'CONTRATO_SERVICIOS_FFC.pdf',
          base64: base64Str,
        },
      ],
      users: [
        {
          name:
            empresa.representanteLegal.nombre +
            ' ' +
            empresa.representanteLegal.apellido,
          groups: ['signers'],
        },
      ],
    };
    const result = await this.httpService
      .post(`${keynuaPath}/contracts/v1`, dataKeynua, {
        headers: headersRequestKeynua,
      })
      .toPromise();

    const tokenLinkUrl = result.data.users[0].token;

    //generacion del correo
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${secretKey}`,
    };
    const data = {
      from: {
        email: emailSender,
      },
      personalizations: [
        {
          to: [
            {
              email: empresa.usuario.correo,
            },
          ],
          dynamic_template_data: {
            nombre: empresa.razonSocial.toUpperCase(),
            tipo: 'Empresa',
            dni: empresa.usuario.correo,
            link: `${keynuaLink}?token=${tokenLinkUrl}`,
          },
        },
      ],

      template_id: templateKey,
    };

    //enviar correo
    await this.httpService
      .post(`${emailUrl}`, data, {
        headers: headersRequest,
      })
      .toPromise();
    return this.empresaRepository.save(empresa);
  }
}
