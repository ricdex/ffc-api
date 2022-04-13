import { Module } from '@nestjs/common';
import { OperacionController } from './operacion.controller';

@Module({
  controllers: [OperacionController]
})
export class OperacionModule {}
