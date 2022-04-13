import { HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Operacion } from './entities/operacion.entity';
import { ConfigService } from '@nestjs/config';
import { EmpresaService } from 'src/persona/empresa.service';
var upload = require('./utils/upload');

@Injectable()
export class OperacionService {
  constructor(
    @InjectRepository(Operacion)
    private readonly operacionRepository: Repository<Operacion>,
    private configService: ConfigService,
    private httpService: HttpService,
    private empresaService: EmpresaService,
  ) {}

  async registrar(user : any, operacion: Operacion): Promise<Operacion> {
    
    //registrar en la bd
    const empresa = await this.empresaService.findByFactUser(user.factUser);
    if(empresa == null)
    {
      throw new NotFoundException();
    }
    const operacionRegistrada = await this.operacionRepository.save(operacion);
     
    //enviar correo (TODO)
    
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

    //2. registramos la operacion
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${loginResult.data.access_token}`,
    };

    const operacionResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/operations', 
      {
        "seller_id": user.factUser,
        "currency": "PEN",
        "cost_time_priority": 1,
        "debtor": {
            "tax_number": "0",
            "official_name": empresa.razonSocial,
        }
      },{
        headers: headersRequest,
      })
    .toPromise();

    //3. registramos el archivo
    const url = upload.uploadFile(null, null,this.configService,this.httpService)

    //4. agregamos el archivo legal
    const fileResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/kyc/invoices', 
      {
        "kyoperation_id": operacionResult.data.id,
        "number": "123123",
        "issue_date": "2020-01-01",
        "payment_date": "2020-12-12",
        "amount": "50000",
        "amount_currency": "PEN",
        "invoice_pdf_url": url,
        "invoice_xml_url": url,
        "category": 1,
        "affectation": 2,
        "affect_percentage": 10
      },{
        headers: headersRequest,
      })
    .toPromise();

    //5. Agregamos los contactos
    const contactsResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/kyc/business-rel-contacts', 
      {
        "first_name": operacionResult.data.id,
        "last_name": "123123",
        "email": "2020-01-01",
        "position": "2020-12-12",
        "other_position": "50000",
        "phone": "PEN",
        "business_rel": url,
      },{
        headers: headersRequest,
      })
    .toPromise();

    //6. Enviar a revision
    await this.httpService
    .patch('https://sandbox.facturedo.com/v2/kyc/operations/' + operacionResult.data.id, 
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
