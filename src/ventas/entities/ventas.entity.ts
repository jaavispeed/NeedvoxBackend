import { User } from 'src/auth/entities/user.entity';
import { Lote } from 'src/lotes/entities/lotes.entity';
import { Product } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinTable } from 'typeorm';

@Entity()
export class Venta {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    cantidadTotal: number; 

    @Column('numeric', { 
        default: 0 
    })
    total: number; // Total de la venta (suma de todos los productos)

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @OneToMany(() => ProductVenta, (productVenta) => productVenta.venta)
    productos: ProductVenta[]; // Relación con productos en la venta

    @Column('enum', { enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'], default: 'OTRO' })
    metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO'; 
}

// Entidad intermedia para la relación de muchos a muchos
@Entity()
export class ProductVenta {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('int')
    cantidad: number; // Cantidad específica del producto
    
    @Column('numeric')
    ventaPrice: number; // Precio unitario en el contexto de la venta

    @ManyToOne(() => Product, (product) => product.id)
    product: Product;
    
    @ManyToOne(() => Venta, (venta) => venta.productos, { nullable: false, onDelete: 'CASCADE' }) // Nullable false para forzar el valor
    venta: Venta;

    @ManyToOne(() => Lote, (lote) => lote.id) // Relación con el Lote
    lote: Lote; // Nueva propiedad para la relación con el Lote
}
