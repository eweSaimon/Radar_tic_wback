import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Oportunidad } from '../../models/oportunidad.model';
import { API_URL } from '../../services/api.config';
import { OportunidadesList } from './oportunidades-list';

const datos: Oportunidad[] = [
  { id: 1, titulo: 'Beca IA', categoria: 'Beca', entidad: 'MinTIC', descripcion: 'd', modalidad: 'Virtual', fechaLimite: '2026-12-15', tecnologias: ['Python'], disponible: true },
  { id: 4, titulo: 'Reto Ciberseguridad', categoria: 'Reto', entidad: 'CD', descripcion: 'd', modalidad: 'Virtual', fechaLimite: '2026-11-05', tecnologias: ['Cloud'], disponible: false },
];

describe('OportunidadesList', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OportunidadesList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('pide la colección a la API (GET) y la muestra', async () => {
    const fixture = TestBed.createComponent(OportunidadesList);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/oportunidades`).flush(datos);
    await fixture.whenStable();
    fixture.detectChanges();

    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelectorAll('article.card').length).toBe(2);
    expect(html.textContent).toContain('Beca IA');
    expect(html.textContent).toContain('No disponible');
  });

  it('muestra el error cuando el servidor no responde', async () => {
    const fixture = TestBed.createComponent(OportunidadesList);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/oportunidades`).error(new ProgressEvent('error'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.alerta-error')?.textContent)
      .toContain('No se pudo conectar con el servidor');
  });

  it('filtra por categoría', async () => {
    const fixture = TestBed.createComponent(OportunidadesList);
    fixture.detectChanges();
    http.expectOne(`${API_URL}/oportunidades`).flush(datos);
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.chip'));
    chips.find((c) => c.textContent?.trim() === 'Reto')!.click();
    fixture.detectChanges();

    const tarjetas = (fixture.nativeElement as HTMLElement).querySelectorAll('article.card');
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].textContent).toContain('Reto Ciberseguridad');
  });
});
