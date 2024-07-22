import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Mail } from "models/mail";
import { Projet } from "models/projet";
import { User } from "models/user";

import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  urluser = "/USER-SERVICE/";
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("accessToken"),
    }),
  };
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  exportFileFromExcelWithData(
    formData: FormData,
    fileType: string,
    excelData: any[]
  ): Observable<any> {
    // Ajouter les données Excel mises à jour dans le formulaire
    formData.append("updatedExcelData", JSON.stringify(excelData));
    return this.http.post(`/USER-SERVICE/export/${fileType}`, formData);
  }
  getUsersByStatus(enabled: boolean): Observable<User[]> {
    return this.http.get<User[]>(`/USER-SERVICE/getUserByStatus/${enabled}`);
  }
  getUsersByDepartment(department: string): Observable<any[]> {
    return this.http.get<any[]>(`/USER-SERVICE/getuserbyDep/${department}`);
  }
  getUsersByRole(roleName: string): Observable<User[]> {
    const url = `/USER-SERVICE/getUserByRole?roleName=${roleName}`;
    return this.http.get<User[]>(url);
  }
  getUsers(): Observable<User[]> {
    //return this.list
    console.log(this.httpOptions)
    return this.http.get<User[]>(this.urluser + "AllUsers", this.httpOptions);
   
  }
  getAllMail(): Observable<Mail[]> {
    //return this.list
    return this.http.get<Mail[]>(this.urluser);
  }
  getAllProjet():Observable<Projet[]>{
    return this.http.get<Projet[]>("/USER-SERVICE/AllProjet");
  }
  urlhello = "http://localhost:9999/USER-SERVICE/helloUser";
  getHello(): Observable<string> {
    return this.http.get<string>(this.urlhello);
  }

  getProductById() {
    //return this.list
    return this.http.get<String>(this.urlhello);
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  getPrivileges() {
    return this.http.get("/USER-SERVICE/AllPrivileges");
  }
  addTemplate(template: any): Observable<any> {
    return this.http.post("/USER-SERVICE/addTemplate", template);}

  getUserFromToken(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get("/USER-SERVICE/currentUser", { headers });
  }

  exportFileFromExcel(formData: FormData, fileType: string,templateLabel?: string) {
    console.log(fileType);
    let endpoint = "";
    if (fileType === "word") {
      endpoint = "/USER-SERVICE/export/wordGeneric/from/excel";
    } else if (fileType === "ppt") {
      endpoint = "/USER-SERVICE/export/pptGeneric/from/excel";
    }

    return this.http.post(endpoint, formData);
  }

  getProjectsByUser(idUser: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`/USER-SERVICE/getProjectByUser/${idUser}`);
  }
  sendHtmlTemplate(formData: FormData, templateLabel: string): Observable<any> {
    const params = new HttpParams().set('templateLabel', templateLabel);
    return this.http.post('/USER-SERVICE/export/email/from/excel', formData, { params });
}
sendSms(formData: FormData): Observable<any> {
  return this.http.post(`/USER-SERVICE/send`, formData);
}
  getByName() {
    return this.http.get("/USER-SERVICE/username");
  }

  addUser(user: any) {
    return this.http.post<any>("/USER-SERVICE/addUser", user);
  }

  addMail(mail: any) {
    return this.http.post<any>("/USER-SERVICE/addEmail", mail);
  }
  addProjetWithMailAndUsers(projet: any, userIds: number[]): Observable<Projet> {
    const url = '/USER-SERVICE/addProjetByStep';
    // Construction des query params à partir des userIds
    const queryParams = userIds.map(id => `userIds=${id}`).join('&');
    const fullUrl = `${url}?${queryParams}`;

    // Envoi de la requête avec les paramètres de requête
    return this.http.post<Projet>(fullUrl, projet);
  }
  forgetPassword(email: string) {
    return this.http.get<String>("/USER-SERVICE/requestPasswordReset/" + email);
  }

  resetPassword(data: any, token: string) {
    return this.http.post<any>(
      "/USER-SERVICE/password-reset?token=" + token,
      data
    );
  }
  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>("/USER-SERVICE/AllDepartment");
  }

  getStutus(): Observable<string[]> {
    return this.http.get<string[]>("/USER-SERVICE/enabled");
  }
  deleteUser(id: number) {
    return this.http.delete<any>("/USER-SERVICE/deleteUser/" + id);
  }

  desActiverUser(id: number) {
    return this.http.put<any>("/USER-SERVICE/desActiverUser/" + id, null);
  }

  getUser(id: any) {
    return this.http.get<any>("/USER-SERVICE/getUserById/" + id);
  }
  apiUrl: string = "/USER-SERVICE";
  updateUser(formData: FormData, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateUser/${userId}`, formData);
  }

  uploadImage(file: File, userId: string): Observable<any> {
    const url = `/USER-SERVICE/uploadImage?idUser=${userId}`;
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(url, formData);
  }
  TelechargerImage(file: File): Observable<any> {
    const url = `/USER-SERVICE/TelechargerImage`;
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(url, formData);
  }
  changePassword(userId: number, oldPassword: string, newPassword: string, retypeNewPassword: string): Observable<any> {
    const url = `/USER-SERVICE/changePassword/${userId}`;
    const params = { oldPassword, newPassword, retypeNewPassword };
    return this.http.post(url, null, { params });
  }
}
