import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inversionista } from './entities/inversionista.entity';
import { ConfigService } from '@nestjs/config';

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
              email: inversionista.usuario.correo,
            },
          ],
          dynamic_template_data: {
            nombre: inversionista.nombre.toUpperCase(),
            tipo: 'Inversionista',
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
    return this.inversionistaRepository.save(inversionista);
  }
}
