import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('numeric', {
        default: 0,
    })
    compraPrice: number; // Cambiado a compraPrice para alinearlo con la interfaz

    @Column('numeric', {
        default: 0,
    })
    ventaPrice: number; // Añadido para manejar el precio de venta

    @Column('int', {
        default: 0,
    })
    stock: number;

    @Column('text', {
        unique: true,
    })
    slug: string;

    @ManyToOne(() => User, (user) => user.product, { eager: true })
    user: User;

    @Column('date', { nullable: true }) // Añadido para manejar la fecha de vencimiento
    expiryDate?: string;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title; // Usa el título para generar el slug por defecto
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '_');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '_');
    }
}
