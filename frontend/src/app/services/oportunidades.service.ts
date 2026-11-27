import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Oportunidad } from '../models/oportunidad.model';
import { API_URL } from './api.config';

/**
 * ANTES: leía un JSON local (assets).
 * AHORA: consulta la API REST mediante HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class OportunidadesService {
  private readonly http = inject(HttpClient);

  /** GET /api/oportunidades */
  getOportunidades(): Observable<Oportunidad[]> {
    return this.http.get<Oportunidad[]>(`${API_URL}/oportunidades`);
  }

  /** GET /api/oportunidades/:id */
  getOportunidad(id: number | string): Observable<Oportunidad> {
    return this.http.get<Oportunidad>(`${API_URL}/oportunidades/${id}`);
  }
}
