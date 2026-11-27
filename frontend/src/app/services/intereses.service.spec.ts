import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from './api.config';
import { InteresesService } from './intereses.service';

describe('InteresesService', () => {
  let service: InteresesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(InteresesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registrarInteres hace POST /api/intereses con nombre, correo y oportunidadId', () => {
    const datos = { nombre: 'Laura Gómez', correo: 'laura@email.com', oportunidadId: 3 };
    service.registrarInteres(datos).subscribe();

    const req = http.expectOne(`${API_URL}/intereses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ mensaje: 'ok', interes: { ...datos, id: 1, fechaRegistro: '' } }, { status: 201, statusText: 'Created' });
  });
});
