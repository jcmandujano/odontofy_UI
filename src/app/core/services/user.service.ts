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

    listUsers(page = 1, limit = 10) {
        return this.api.get<PaginatedResponse<User>>(
            `${API_PATH}/users?page=${page}&limit=${limit}`
        );
    }

    findUser(id: number) {
        return this.api.get<User>(`${API_PATH}/users/${id}`);
    }

    updateUser(id: number, user: User) {
        return this.api.put<User>(`${API_PATH}/users/${id}`, user);
    }
}
