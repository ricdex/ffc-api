import { Inversionista } from 'src/persona/entities/inversionista.entity';
import { Empresa } from '../persona/entities/empresa.entity';

export async function generateLink(
  keynuaToken: any,
  keynuaKey: any,
  base64Str: any,
  nombre: string,
  apellido: string,
  keynuaPath: any,
) {
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
        name: nombre + ' ' + apellido,
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
  return tokenLinkUrl;
}

