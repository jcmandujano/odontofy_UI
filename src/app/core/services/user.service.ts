import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiV1User } from '../models/api-v1.model';
import { toDate, toUiUser } from '../models/api-v1.mapper';
import { mapApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private api: ApiService) { }

    getApiOrigin(): string {
        return this.api.origin();
    }

    getMe() {
        return this.api.get<ApiV1User>('/me').pipe(
            map(response => mapApiResponse(response, toUiUser))
        );
    }

    updateMe(user: Partial<User>) {
        const payload = {
            ...(user.name !== undefined && { name: user.name }),
            ...(user.middle_name !== undefined && { middleName: user.middle_name }),
            ...(user.last_name !== undefined && { lastName: user.last_name }),
            ...(user.date_of_birth !== undefined && { dateOfBirth: toDate(user.date_of_birth) }),
            ...(user.phone !== undefined && { phone: user.phone }),
            ...(user.avatar !== undefined && { avatar: user.avatar }),
            ...(user.show_finance_stats !== undefined && { showFinanceStats: user.show_finance_stats })
        };
        return this.api.patch<ApiV1User>('/me', payload).pipe(
            map(response => mapApiResponse(response, toUiUser))
        );
    }

    updateUser(_id: number, user: Partial<User>) {
        return this.updateMe(user);
    }

    getGoogleAuthUrl() {
        return this.api.post<{ authorizationUrl: string }>('/calendar/connection/authorization', {}).pipe(
            map(response => mapApiResponse(response, value => ({ url: value.authorizationUrl })))
        );
    }
}
