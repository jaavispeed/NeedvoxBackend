import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
    })
    title: string;

    @Column('numeric', {
        default: 0,
    })
    compraPrice: number;

    @Column('numeric', {
        default: 0,
    })
    ventaPrice: number;

    @Column('int', {
        default: 0,
    })
    stock: number;

    @Column('text', {
    })
    slug: string;

    @ManyToOne(() => User, (user) => user.product, { eager: true })
    user: User;

    @Column('date', { nullable: true })
    expiryDate?: string;

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
