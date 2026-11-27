import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Oportunidad } from '../../models/oportunidad.model';
import { OportunidadesService } from '../../services/oportunidades.service';
import { mensajeDeError } from '../../services/error-http';

@Component({
  selector: 'app-oportunidades-list',
  imports: [RouterLink],
  templateUrl: './oportunidades-list.html',
  styleUrl: './oportunidades-list.css',
})
export class OportunidadesList implements OnInit {
  private readonly service = inject(OportunidadesService);

  protected readonly oportunidades = signal<Oportunidad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly categoria = signal('Todas');

  protected readonly categorias = computed(() => [
    'Todas',
    ...new Set(this.oportunidades().map((o) => o.categoria)),
  ]);

  protected readonly filtradas = computed(() =>
    this.categoria() === 'Todas'
      ? this.oportunidades()
      : this.oportunidades().filter((o) => o.categoria === this.categoria()),
  );

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    // Angular -> GET -> Express
    this.service.getOportunidades().subscribe({
      next: (datos) => {
        this.oportunidades.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeDeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected seleccionarCategoria(valor: string): void {
    this.categoria.set(valor);
  }
}
