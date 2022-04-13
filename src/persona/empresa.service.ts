import { HttpService, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { ConfigService } from '@nestjs/config';
var mailer = require('./utils/mail');

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

  async findByFactUser(factUser: string): Promise<Empresa> {
    const search: any = {
      'factUser': factUser,
    };
    return this.empresaRepository.findOne(search);
  }

  async findByUser(correo: string): Promise<Empresa> {
    const search: any = {
      'usuario.correo': correo,
    };
    return this.empresaRepository.findOne(search);
  }

  async registrar(empresa: Empresa): Promise<Empresa> {
    
    //registrar en la bd
    const empresaRegistrada = await this.empresaRepository.save(empresa);

    //enviar correo
    const secretKey = this.configService.get('SENDGRID_API_KEY');
    const templateKey = this.configService.get('TEMPLATE_ID');
    const emailSender = this.configService.get('EMAIL_SENDER');
    mailer.sendMail(secretKey,templateKey,emailSender,this.httpService);
    
    //enviar a facturedo
    //1. nos logeamos
    const loginResult = await this.httpService
    .post('https://auth-sandbox.facturedo.com/oauth/token', 
      {
        "client_id": "ML1p8BWbWEsnwTfFQgNYp0wftcQrZn5x",
        "client_secret": "xrwwrimypEh4Ha2b4IoaHVOW2l0ZIjmtKcHpiW2wqTu3ELuDyqf2CzEQyNElWlHO",
        "audience":"https://klimb-api-sandbox",
        "grant_type":"client_credentials"
      })
    .toPromise();

    //2. registramos la empresa
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${loginResult.data.access_token}`,
    };

    const empresaResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/accounts/user', 
      {
        "email": empresaRegistrada.usuario.correo,
        "user_type": 0,
        "password": empresaRegistrada.usuario.contrasenha,
        "phone": empresaRegistrada.telefonoContacto,
        "first_name": empresaRegistrada.nombreContacto,
        "last_name": empresaRegistrada.apellidoContacto,
        "maternal_last_name": ".",
        "country": 2,
        "id_number": empresaRegistrada.id,
        "entity": {
            "tax_number": "0",
            "official_name": empresaRegistrada.razonSocial,
            "brand_name": empresaRegistrada.razonSocial,
            "entity_type": 2,
            "address": empresaRegistrada.direccion
        }
      },{
        headers: headersRequest,
      })
    .toPromise();

    //3. representante legal
    const representanteResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/kyc/legal-reps', 
      {
        "first_name": empresaRegistrada.representanteLegal.nombre,
        "last_name": empresaRegistrada.representanteLegal.apellido,
        "maternal_last_name": ".",
        "email": empresaRegistrada.representanteLegal.correo,
        "position": 1,
        "phone": empresaRegistrada.representanteLegal.telefono,
        "id_number": empresaRegistrada.representanteLegal.nrodocumento,
        "birth_date": "2000-01-01",
        "seller": empresaResult.data.user
      },{
        headers: headersRequest,
      })
    .toPromise();

    //4. Enviar a revision
    await this.httpService
    .patch('https://sandbox.facturedo.com/v2/accounts/user/' + empresaResult.data.user, 
      {
        "status": 1
      },{
        headers: headersRequest,
      })
    .toPromise();

    empresaRegistrada.factUser = empresaResult.data.user;
    empresaRegistrada.factEntity = empresaResult.data.entity;
    empresaRegistrada.representanteLegal.factId = representanteResult.data.id;

    return this.empresaRepository.save({
      id : empresaRegistrada.id,
      ...empresaRegistrada});

  }
}
