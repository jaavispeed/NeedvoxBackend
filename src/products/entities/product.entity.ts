import { User } from "src/auth/entities/user.entity";
import { Lote } from "src/lotes/entities/lotes.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
    })
    title: string;

    @Column('int', { default: 0 })
    stockTotal: number; // Total de stock sumado de todos los lotes

    @Column('text', {
    })
    slug: string;

    @ManyToOne(() => User, (user) => user.products, { eager: true })
    user: User;

    @Column('text', { nullable: true })
    barcode?: string; // Esto es opcional

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Fecha de creación
    fechaCreacion: Date;

    @OneToMany(() => Lote, (lote) => lote.producto)
    lotes: Lote[];

    @Column({ type: 'int' })
    precioVenta: number;  // Aquí definimos el precioVenta en Producto

    @BeforeInsert()
    checkSlugInsert() {
        this.generateSlug();  // Llama a la función para generar el slug
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.generateSlug();  // Llama a la función para generar el slug al actualizar
    }

    private generateSlug() {
        this.slug = this.title
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '_');
    }
}
