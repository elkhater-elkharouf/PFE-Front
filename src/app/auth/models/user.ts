import { Image } from './image';
import { Role } from './role';

export class User {
  idUser: any;
  email: any;
  password: any;
  phoneNumber: any;
  lname: any;
  fname: any;
  role: any;
  image!:Image ;
  enabled : any;
  idrole:any;
  createdAt:any;
  accessToken: any;
  department: any ; 
  selected: boolean;
  constructor(idUser:number,email:string, password:string, lname:string,phoneNumber:string,
       idrole : number,fname:string ,role : Role, enabled: boolean , createdAt:Date, department:string)  {
      this.idUser = idUser;
      this.email = email;
      this.password = password;
      this.lname = lname;
      this.fname = fname;
      this.role = role;
      this.enabled = enabled;
      this.idrole = idrole;
      this.createdAt = createdAt;
      this.phoneNumber = phoneNumber;
      this.department=department; 

  };

  
}
export interface PartialUser {
  idUser?: number;
  email?: string;
  fname?: string;
  lname?: string;
  department?: string;
  roles?: Role[];
}