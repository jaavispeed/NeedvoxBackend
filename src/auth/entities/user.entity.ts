import { Lote } from "src/lotes/entities/lotes.entity";
import { Product } from "src/products/entities/product.entity";
import { Venta } from "src/ventas/entities/ventas.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    email: string;

    @Column('text')
    username: string;

    @Column('text', { select: false })
    password: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column('text', { array: true, default: ['user'] })
    roles: string[];

    @OneToMany(() => Product, (product) => product.user)
    products: Product[]; // Cambiar a plural para reflejar múltiples productos

    @OneToMany(() => Venta, (venta) => venta.user) // Aquí se agrega la relación con Venta
    ventas: Venta[]; // Cambiar a plural para reflejar múltiples ventas

    @OneToMany(() => Lote, (lote) => lote.user) // Relación con los lotes
    lotes: Lote[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}
