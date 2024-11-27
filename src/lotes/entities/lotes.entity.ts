import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' }) // Cambiado a int
  precioCompra: number;

  @Column({ type: 'int' }) // Cambiado a int
  precioVenta: number;

  @Column()
  stock: number;

  @Column({ type: 'date', nullable: true })  // Modificación: Permitir valores nulos
  fechaCaducidad: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Fecha de creación
  fechaCreacion: Date;

  @ManyToOne(() => Product, (producto) => producto.lotes)
  producto: Product;
  
  @ManyToOne(() => User, (user) => user.lotes) // Si deseas asociar un lote con un usuario
  user: User; // Esta es la relación con el usuario
}
