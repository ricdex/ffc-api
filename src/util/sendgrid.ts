import { Empresa } from '../persona/entities/empresa.entity';
import { Inversionista } from '../persona/entities/inversionista.entity';

export async function enviarCorreoEmpresaRegistro(
  secretKey: any,
  emailSender: any,
  empresa: Empresa,
  keynuaLink: any,
  tokenLinkUrl: any,
  templateKey: any,
  emailUrl: any,
) {
  const headersRequest = {
    'Content-Type': 'application/json',
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
          dni: empresa.representanteLegal.nrodocumento,
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
}

export async function enviarCorreoRegistroInversionista(
  secretKey: any,
  emailSender: any,
  inversionista: Inversionista,
  templateKey: any,
  keynuaLink: any,
  tokenLinkUrl: any,
  emailUrl: any,
) {
  const headersRequest = {
    'Content-Type': 'application/json',
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
          dni: inversionista.nrodocumento,
          link: `${keynuaLink}?token=${tokenLinkUrl}`,
        },
      },
    ],

    template_id: templateKey,
  };

  await this.httpService
    .post(`${emailUrl}`, data, {
      headers: headersRequest,
    })
    .toPromise();
}
