import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuarioService } from 'src/persona/usuario.service';
import { EmpresaService } from 'src/persona/empresa.service';

@Injectable()
export class AuthService {
  constructor(
    private empresaService: EmpresaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(correo: string, pass: string): Promise<any> {
    try {
      const empresa = await this.empresaService.findByUser(
        correo,
      );
      const comparePass = await this.validatePassword(pass, empresa.usuario.contrasenha);
      if (empresa && comparePass) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { factUser, usuario, nombreContacto, apellidoContacto  } = empresa;
        return { factUser, usuario, nombreContacto, apellidoContacto };
      }
      return null;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = {
      correo: user.usuario.correo,
      factUser : user.factUser,
      nombreContacto : user.nombreContacto,
      apellidoContacto : user.apellidoContacto

    };
    return {
      access_token: this.jwtService.sign(payload),
      ...payload,
    };
  }

  // eslint-disable-next-line prettier/prettier
  async validatePassword(password: string, passwordDB: string): Promise<boolean> {
    return await bcrypt.compareSync(password, passwordDB);
  }
}
