import { HttpService } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { map } from "rxjs/internal/operators/map";

module.exports = {

  sendMail: async function(secretKey: any, 
    templateKey: any, 
    emailSender: any,
    correoUsuario: any,
    razonSocial: string,
    httpService: HttpService) 
  {
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
              email: correoUsuario,
            },
          ],
          dynamic_template_data: {
            nombre: razonSocial.toUpperCase(),
            tipo: 'Empresa',
          },
        },
      ],

      template_id: templateKey,
    };

    await httpService
      .post('https://api.sendgrid.com/v3/mail/send', data, {
        headers: headersRequest,
      })
      .toPromise();
  }

}