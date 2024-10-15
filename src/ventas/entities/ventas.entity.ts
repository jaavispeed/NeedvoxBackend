import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class Venta {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    cantidad: number;

    @Column('numeric', {
        default: 0,
    })
    ventaPrice: number;
  
    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @ManyToOne(() => Product, (product) => product.id)
    product: Product;
    
    @ManyToOne(() => User, (user) => user.id)
    user: User;
}
