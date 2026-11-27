import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Oportunidad } from '../../models/oportunidad.model';
import { API_URL } from '../../services/api.config';
import { OportunidadDetalle } from './oportunidad-detalle';

const oportunidad: Oportunidad = {
  id: 4, titulo: 'Reto Ciberseguridad', categoria: 'Reto', entidad: 'CD', descripcion: 'd',
  modalidad: 'Virtual', fechaLimite: '2026-11-05', tecnologias: ['Cloud'], disponible: false,
};

async function crear(id: string) {
  TestBed.configureTestingModule({
    imports: [OportunidadDetalle],
    providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
    ],
  });
  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(OportunidadDetalle);
  fixture.detectChanges();
  return { http, fixture, html: fixture.nativeElement as HTMLElement };
}

function llenar(html: HTMLElement, nombre: string, correo: string) {
  const set = (selector: string, valor: string) => {
    const input = html.querySelector<HTMLInputElement>(selector)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };
  set('input[formControlName="nombre"]', nombre);
  set('input[formControlName="correo"]', correo);
}

describe('OportunidadDetalle', () => {
  it('consulta GET /api/oportunidades/:id y muestra la oportunidad', async () => {
    const { http, fixture, html } = await crear('4');
    http.expectOne(`${API_URL}/oportunidades/4`).flush(oportunidad);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html.querySelector('h1')?.textContent).toContain('Reto Ciberseguridad');
  });

  it('muestra el 404 del servidor cuando la oportunidad no existe', async () => {
    const { http, fixture, html } = await crear('999');
    http.expectOne(`${API_URL}/oportunidades/999`)
      .flush({ error: 'No existe una oportunidad con el identificador "999".' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html.querySelector('.alerta-error')?.textContent).toContain('No existe una oportunidad');
  });

  it('envía el POST con los datos del formulario y muestra el éxito', async () => {
    const { http, fixture, html } = await crear('4');
    http.expectOne(`${API_URL}/oportunidades/4`).flush({ ...oportunidad, disponible: true });
    await fixture.whenStable();
    fixture.detectChanges();

    llenar(html, 'Laura Gómez', 'laura@email.com');
    html.querySelector('form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(`${API_URL}/intereses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Laura Gómez', correo: 'laura@email.com', oportunidadId: 4 });
    req.flush({ mensaje: '¡Listo, Laura Gómez!', interes: {} }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html.querySelector('.alerta-ok')?.textContent).toContain('¡Listo, Laura Gómez!');
  });

  it('muestra el error 409 que devuelve el servidor al registrar', async () => {
    const { http, fixture, html } = await crear('4');
    http.expectOne(`${API_URL}/oportunidades/4`).flush(oportunidad);
    await fixture.whenStable();
    fixture.detectChanges();

    llenar(html, 'Laura', 'laura@email.com');
    html.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne(`${API_URL}/intereses`)
      .flush({ error: 'La oportunidad "Reto Ciberseguridad" ya no se encuentra disponible.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html.querySelector('.alerta-error')?.textContent).toContain('ya no se encuentra disponible');
    expect(html.querySelector('.alerta-ok')).toBeNull();
  });

  it('no envía el POST si el formulario es inválido', async () => {
    const { http, fixture, html } = await crear('4');
    http.expectOne(`${API_URL}/oportunidades/4`).flush(oportunidad);
    await fixture.whenStable();
    fixture.detectChanges();

    llenar(html, '', 'correo-malo');
    html.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectNone(`${API_URL}/intereses`);
    expect(html.textContent).toContain('El nombre es obligatorio.');
  });
});
