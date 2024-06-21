import { Role } from "./role";

export class User {
    idUser: any;
    email: any;
    password: any;
    numTel: any;
    lname: any;
    fname: any;
    role: any;
    enabled : boolean;
    idrole:any;
    createdAt:any;
    token: any;

    selected: boolean;
    constructor(idUser:number,email:string, password:string, lname:string,numTel:string,
         idrole : number,fname:string ,role : Role, enabled: boolean , createdAt:Date) {
        this.idUser = idUser;
        this.email = email;
        this.password = password;
        this.lname = lname;
        this.fname = fname;
        this.role = role;
        this.enabled = enabled;
        this.idrole = idrole;
        this.createdAt = createdAt;
        this.numTel = numTel

    };
    }