import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private token: string | null = null;
  private user: any = null;
  constructor() { }

  signOut(): void {
    this.token = null;
    this.user = null;
  }

  public saveToken(token: string): void {
    this.token = token;
  }
  
  public getToken(): string | null {
    return this.token;
  }
  
  public saveUser(user: any): void {
    this.user = user;
  }
  
  public getUser(): any {
    return this.user || {};
  }
}
