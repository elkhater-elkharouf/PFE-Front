import { Mail } from "./mail";
import { User } from "./user";

export class Projet {
    idProjet: any;
    nameProjet: string;
    dateDeb: any;
    dateFin: any;
    status: number;
    users: User[];
    mail: Mail;
}