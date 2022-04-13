import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { RegistrarOperacion } from './operacion.dto';

@Entity({ name: 'operaciones' })
export class Operacion {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column({ name: 'operation_id' })
  operationId: string;

  @Column({ name: 'business_relationship_id' })
  businessRelationshipId: string;

  @Column({ name: 'url_pdf' })
  urlPdf: string;

  @Column({ name: 'url_xml' })
  urlXml: string;

  @Column({ name: 'monto' })
  monto: number;

  @Column({ name: 'fecha_emision' })
  fechaEmision: Date;

  @Column({ name: 'fecha_pago' })
  fechaPago: Date;

  @Column({ name: 'categoria' })
  categoria: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  //contacto

  @Column({ name: 'first_name_contact' })
  nombreContacto: string;

  @Column({ name: 'last_name_contact' })
  apellidoContacto: string;

  @Column({ name: 'email_contact' })
  correoContacto: string;

  @Column({ name: 'telefono_contact' })
  telefonoContacto: string;

  @Column({ name: 'other_position_contact' })
  posicionContacto: string;


  fromDTO(dto: RegistrarOperacion) {
    this.urlPdf = dto.urlPdf;
    this.urlXml = dto.urlXml;
    this.nombreContacto = dto.nombreContacto;
    this.apellidoContacto = dto.apellidoContacto;
    this.telefonoContacto = dto.telefonoContacto;
    this.posicionContacto = dto.posicionContacto;
    this.monto = dto.monto;
    this.fechaEmision = dto.fechaEmision;
    this.fechaPago = dto.fechaPago;
    this.categoria = dto.categoria;


    return this;
  }
}
