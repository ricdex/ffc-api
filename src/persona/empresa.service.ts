import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { ConfigService } from '@nestjs/config';

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
    const templateKey = this.configService.get('TEMPLATE_ID');
    const emailSender = this.configService.get('EMAIL_SENDER');

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
          },
        },
      ],

      template_id: templateKey,
    };

    await this.httpService
      .post('https://api.sendgrid.com/v3/mail/send', data, {
        headers: headersRequest,
      })
      .toPromise();
    return this.empresaRepository.save(empresa);
  }
}
