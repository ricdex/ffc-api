import { BadRequestException, Body, Controller, HttpService, Param, Post, UseGuards,
  Request,
  UseInterceptors,
  UploadedFile, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RegistrarOperacion } from './entities/operacion.dto';
import { Operacion } from './entities/operacion.entity';
import { OperacionService } from './operacion.service';


@Controller('operacion')
export class OperacionController {
    constructor(
      private readonly operacionService: OperacionService
    ) {}


  @UseGuards(JwtAuthGuard)
  @Post()
  async registrarOperacion(@Request() req ,@Body() operacionDTO: RegistrarOperacion, @Param() params): Promise<Operacion> {
    
    const operacion = new Operacion().fromDTO(operacionDTO);
    return this.operacionService.registrar(req.user,operacion);
  }


  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post("upload")
  async subirArchivo(@Request() req ,@UploadedFile() file: Express.Multer.File): Promise<string> {
    
    return this.operacionService.subirArchivo(file);
  }

}
