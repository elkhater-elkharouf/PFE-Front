import { User } from "./user";

export class Image {
    id!: number;
    name!: string;
    imagenUrl?: string;
    type!: string;
    imageData!: any;
    user!: User;

    constructor(name:string,imagenUrl:string,imagenId : string,type:string,imageData:any ,user :User ) {
            this.name=name;
            this.imagenUrl=imagenUrl;
            this.type=type;
            this.imageData=imageData ; 
            this.user=user;
    };
}