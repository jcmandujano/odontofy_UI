import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../../core/models/api-response.model';

const API_PATH = environment.API_URL;

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private api: ApiService) { }

    getMe() {
        return this.api.get<User>(`${API_PATH}/me`);
    }

    updateMe(user: Partial<User>) {
        return this.api.put<User>(`${API_PATH}/me`, user);
    }

    // Transitional alias for existing profile consumers; the server ignores the legacy id.
    updateUser(_id: number, user: Partial<User>) {
        return this.updateMe(user);
    }

    getGoogleAuthUrl() {
        return this.api.get<{ url: string }>(`${API_PATH}/google/init`);
    }
}
