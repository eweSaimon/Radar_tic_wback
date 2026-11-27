import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InteresRequest, InteresResponse } from '../models/interes.model';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class InteresesService {
  private readonly http = inject(HttpClient);

  /** POST /api/intereses */
  registrarInteres(datos: InteresRequest): Observable<InteresResponse> {
    return this.http.post<InteresResponse>(`${API_URL}/intereses`, datos);
  }
}
