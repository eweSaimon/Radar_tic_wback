import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Oportunidad } from '../models/oportunidad.model';
import { API_URL } from './api.config';
import { OportunidadesService } from './oportunidades.service';

const ejemplo: Oportunidad = {
  id: 3, titulo: 'Curso Full-Stack', categoria: 'Curso', entidad: 'SENA', descripcion: '…',
  modalidad: 'Virtual', fechaLimite: '2027-01-20', tecnologias: ['Angular'], disponible: true,
};

describe('OportunidadesService', () => {
  let service: OportunidadesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OportunidadesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getOportunidades hace GET /api/oportunidades', () => {
    let resultado: Oportunidad[] = [];
    service.getOportunidades().subscribe((r) => (resultado = r));

    const req = http.expectOne(`${API_URL}/oportunidades`);
    expect(req.request.method).toBe('GET');
    req.flush([ejemplo]);

    expect(resultado).toEqual([ejemplo]);
  });

  it('getOportunidad hace GET /api/oportunidades/:id', () => {
    let resultado: Oportunidad | undefined;
    service.getOportunidad(3).subscribe((r) => (resultado = r));

    const req = http.expectOne(`${API_URL}/oportunidades/3`);
    expect(req.request.method).toBe('GET');
    req.flush(ejemplo);

    expect(resultado?.id).toBe(3);
  });
});
