import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}
