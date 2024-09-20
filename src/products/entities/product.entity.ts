import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true
    })
    title: string;

    @Column('numeric', {
        default: 0
    })
    price: number;

    @Column('int',{
        default:0 
    })
    stock: number;

    @Column('text',{
        unique: true
    })
    slug: string;


    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user:User


    @BeforeInsert()
    checkSlugInster(){
        if(!this.slug){
        this.slug = this.title;
        }
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'_')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'_')
    }
}
