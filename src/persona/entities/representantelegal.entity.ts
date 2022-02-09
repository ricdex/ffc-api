import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity({ name: 'representante_legales' })
export class RepresentanteLegal {
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

  @Column()
  correo: string;

  @Column({ name: 'fact_id' })
  factId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @VersionColumn()
  version: number;

}
