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
import { RegistrarInversionista } from './inversionista.dto';
import { Usuario } from './usuario.entity';

@Entity({ name: 'inversionistas' } )
export class Inversionista {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column()
  nrodocumento: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  direccion: string;

  @Column()
  telefono: string;

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

  @OneToOne(() => Usuario, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;


  fromDTO(dto: RegistrarInversionista) {
    this.nrodocumento = dto.nrodocumento;
    this.direccion = dto.direccion;
    this.provincia = dto.provincia;
    this.departamento = dto.provincia;
    this.distrito = dto.distrito;
    this.nombre = dto.nombre;
    this.apellido = dto.apellido;
    this.telefono = dto.telefono;

    const u = new Usuario();
    u.correo = dto.correoUsuario;
    u.contrasenha = dto.contrasenhaUsuario;

    this.usuario = u;

    return this;
  }
}
