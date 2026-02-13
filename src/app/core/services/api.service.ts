import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) { }

    get<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.get<ApiResponse<T>>(url).pipe(
            catchError((error) => {
                // Aquí podrías hacer algo con el error globalmente
                return throwError(() => error);
            })
        );
    }

    post<T>(url: string, body: any): Observable<ApiResponse<T>> {
        return this.http.post<ApiResponse<T>>(url, body).pipe(
            catchError((error) => throwError(() => error))
        );
    }

    put<T>(url: string, body: any): Observable<ApiResponse<T>> {
        return this.http.put<ApiResponse<T>>(url, body).pipe(
            catchError((error) => throwError(() => error))
        );
    }

    delete<T>(url: string): Observable<ApiResponse<T>> {
        return this.http.delete<ApiResponse<T>>(url).pipe(
            catchError((error) => throwError(() => error))
        );
    }

    patch<T>(url: string, body: any): Observable<ApiResponse<T>> {
        return this.http.patch<ApiResponse<T>>(url, body).pipe(
            catchError((error) => throwError(() => error))
        );
    }
}
