import { HttpErrorResponse } from '@angular/common/http';

/** Convierte un error HTTP en un mensaje legible, priorizando el mensaje JSON enviado por el servidor. */
export function mensajeDeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el Back-End esté en ejecución (puerto 3000).';
    }
    const mensajeServidor = err.error?.error;
    if (typeof mensajeServidor === 'string') {
      return mensajeServidor;
    }
    return `Error ${err.status}: ${err.statusText}`;
  }
  return 'Ocurrió un error inesperado.';
}
