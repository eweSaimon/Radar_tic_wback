import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Oportunidad } from '../../models/oportunidad.model';
import { InteresesService } from '../../services/intereses.service';
import { OportunidadesService } from '../../services/oportunidades.service';
import { mensajeDeError } from '../../services/error-http';

@Component({
  selector: 'app-oportunidad-detalle',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './oportunidad-detalle.html',
  styleUrl: './oportunidad-detalle.css',
})
export class OportunidadDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly oportunidadesService = inject(OportunidadesService);
  private readonly interesesService = inject(InteresesService);
  private readonly fb = inject(FormBuilder);

  protected readonly oportunidad = signal<Oportunidad | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);

  protected readonly enviando = signal(false);
  protected readonly resultadoOk = signal<string | null>(null);
  protected readonly resultadoError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    // Angular -> GET /api/oportunidades/:id -> Express
    this.oportunidadesService.getOportunidad(id).subscribe({
      next: (o) => {
        this.oportunidad.set(o);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorCarga.set(mensajeDeError(err)); // p. ej. 404 del servidor
        this.cargando.set(false);
      },
    });
  }

  protected enviar(): void {
    const o = this.oportunidad();
    if (!o) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.resultadoOk.set(null);
    this.resultadoError.set(null);
    this.enviando.set(true);

    // Angular -> POST /api/intereses -> Express
    // Nota: el formulario no se bloquea para oportunidades "no disponibles" a propósito,
    // así el usuario ve el rechazo (409) que devuelve la validación del servidor.
    this.interesesService
      .registrarInteres({ ...this.form.getRawValue(), oportunidadId: o.id })
      .subscribe({
        next: (resp) => {
          this.resultadoOk.set(resp.mensaje);
          this.form.reset();
          this.enviando.set(false);
        },
        error: (err) => {
          this.resultadoError.set(mensajeDeError(err));
          this.enviando.set(false);
        },
      });
  }
}
