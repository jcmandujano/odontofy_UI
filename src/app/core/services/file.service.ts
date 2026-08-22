import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export type FilePurpose = 'CONSENT_TEMPLATE' | 'SIGNED_CONSENT';

export interface StoredFile {
  id: string;
  purpose: FilePurpose;
  originalName: string;
  mediaType: string;
  sizeBytes: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private api: ApiService) { }

  upload(file: File, purpose: FilePurpose) {
    const body = new FormData();
    body.append('purpose', purpose);
    body.append('file', file, file.name);
    return this.api.post<StoredFile>('/files', body);
  }

  access(fileId: string) {
    return this.api.get<{ url: string; expiresAt: string }>(`/files/${fileId}/access`);
  }

  delete(fileId: string) {
    return this.api.delete<null>(`/files/${fileId}`);
  }
}
