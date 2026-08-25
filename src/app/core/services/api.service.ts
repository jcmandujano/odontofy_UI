import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

type ParamValue = string | number | boolean | readonly (string | number | boolean)[];

export interface ApiRequestOptions {
    body?: unknown;
    context?: HttpContext;
    headers?: HttpHeaders | Record<string, string | string[]>;
    params?: HttpParams | Record<string, ParamValue>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(private http: HttpClient) { }

    get<T>(path: string, options: ApiRequestOptions = {}): Observable<ApiResponse<T>> {
        return this.http.get<ApiResponse<T>>(this.url(path), this.options(options));
    }

    post<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<ApiResponse<T>> {
        return this.http.post<ApiResponse<T>>(this.url(path), body, this.options(options));
    }

    put<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<ApiResponse<T>> {
        return this.http.put<ApiResponse<T>>(this.url(path), body, this.options(options));
    }

    delete<T>(path: string, options: ApiRequestOptions = {}): Observable<ApiResponse<T>> {
        return this.http.delete<ApiResponse<T>>(this.url(path), this.options(options));
    }

    patch<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<ApiResponse<T>> {
        return this.http.patch<ApiResponse<T>>(this.url(path), body, this.options(options));
    }

    private options(options: ApiRequestOptions) {
        return { ...options, withCredentials: true };
    }

    private url(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${environment.API_URL}${normalizedPath}`;
    }
}
