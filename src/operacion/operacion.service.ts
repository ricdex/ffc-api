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

  async subirArchivo(file: Express.Multer.File) : Promise<string>
  {
    const loginResult = await this.httpService
    .post('https://auth-sandbox.facturedo.com/oauth/token', 
      {
        "client_id": "ML1p8BWbWEsnwTfFQgNYp0wftcQrZn5x",
        "client_secret": "xrwwrimypEh4Ha2b4IoaHVOW2l0ZIjmtKcHpiW2wqTu3ELuDyqf2CzEQyNElWlHO",
        "audience":"https://klimb-api-sandbox",
        "grant_type":"client_credentials"
      })
    .toPromise();

    return upload.uploadFile({
      "file_name" : file.filename,
      "file" : file.buffer
    }, loginResult.data.access_token,this.configService,this.httpService)
  }


  async registrar(user : any, operacion: Operacion): Promise<Operacion> {
    
    //registrar en la bd
    const empresa = await this.empresaService.findByFactUser(user.factUser);
    if(empresa == null)
    {
      throw new NotFoundException();
    }
    const operacionRegistrada = await this.operacionRepository.save(operacion);
     
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

    //3. agregamos el archivo legal
    const fileResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/kyc/invoices', 
      {
        "kyoperation_id": operacionResult.data.id,
        "number": "123123",
        "issue_date": operacion.fechaEmision,
        "payment_date": operacion.fechaPago,
        "amount": operacion.monto,
        "amount_currency": "PEN",
        "invoice_pdf_url": operacion.urlPdf,
        "invoice_xml_url": operacion.urlXml,
        "category": operacion.categoria,
        "affectation": 2,
        "affect_percentage": 10
      },{
        headers: headersRequest,
      })
    .toPromise();

    //5. Agregamos los contactos
    await this.httpService
    .post('https://sandbox.facturedo.com/v2/kyc/business-rel-contacts', 
      {
        "first_name": operacion.nombreContacto,
        "last_name": operacion.apellidoContacto,
        "email": operacion.correoContacto,
        "position": "1",
        "other_position": operacion.posicionContacto,
        "phone": operacion.telefonoContacto,
        "business_rel":  operacionResult.data.business_relationship,
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

    operacionRegistrada.operationId = operacionResult.data.id;
    operacionRegistrada.businessRelationshipId = operacionResult.data.business_relationship;

    return this.operacionRepository.save({
      id : operacion.id,
      ...operacion});

  }
}
