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
import { RegistrarEmpresa } from './empresa.dto';
import { RepresentanteLegal } from './representantelegal.entity';
import { Usuario } from './usuario.entity';

@Entity({ name: 'empresas' })
export class Empresa {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column()
  nrodocumento: string;

  @Column({ name: 'razon_social' })
  razonSocial: string;

  @Column({ name: 'actividad_economica' })
  actividadEconomica: string;

  @Column()
  direccion: string;

  @Column()
  provincia: string;

  @Column()
  departamento: string;

  @Column()
  distrito: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  //contacto

  @Column({ name: 'nombre_contacto' })
  nombreContacto: string;

  @Column({ name: 'apellido_contacto' })
  apellidoContacto: string;

  @Column({ name: 'telefono_contacto' })
  telefonoContacto: string;

  @OneToOne(() => RepresentanteLegal, {
    cascade: ['insert', 'update', 'remove'],
  })
  @JoinColumn({ name: 'representante_legal_id' })
  representanteLegal: RepresentanteLegal;

  @OneToOne(() => Usuario, {
    cascade: ['insert', 'update', 'remove'],
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  fromDTO(dto: RegistrarEmpresa) {
    this.nrodocumento = dto.nrodocumento;
    this.razonSocial = dto.razonSocial;
    this.actividadEconomica = dto.actividadEconomica;
    this.direccion = dto.direccion;
    this.provincia = dto.provincia;
    this.departamento = dto.provincia;
    this.distrito = dto.distrito;
    this.nombreContacto = dto.nombreContacto;
    this.apellidoContacto = dto.apellidoContacto;
    this.telefonoContacto = dto.telefonoContacto;

    const rl = new RepresentanteLegal();
    rl.nrodocumento = dto.representanteNrodocumento;
    rl.nombre = dto.representanteNombre;
    rl.apellido = dto.representanteApellido;
    rl.telefono = dto.representanteTelefono;
    rl.direccion = dto.representanteDireccion;
    rl.departamento = dto.representanteDepartamento;
    rl.provincia = dto.representanteProvincia;
    rl.distrito = dto.representanteDistrito;

    this.representanteLegal = rl;

    const u = new Usuario();
    u.correo = dto.correoUsuario;
    u.contrasenha = dto.contrasenhaUsuario;

    this.usuario = u;

    return this;
  }
}
