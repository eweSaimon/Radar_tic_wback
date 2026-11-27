import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './error-http';

describe('mensajeDeError', () => {
  it('usa el mensaje JSON enviado por el servidor', () => {
    const err = new HttpErrorResponse({ status: 409, error: { error: 'La oportunidad ya no está disponible.' } });
    expect(mensajeDeError(err)).toBe('La oportunidad ya no está disponible.');
  });

  it('explica que no hay conexión cuando el estado es 0', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(mensajeDeError(err)).toContain('No se pudo conectar con el servidor');
  });

  it('devuelve un mensaje genérico con el código si el cuerpo no trae JSON', () => {
    const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    expect(mensajeDeError(err)).toBe('Error 500: Server Error');
  });

  it('maneja errores que no son HTTP', () => {
    expect(mensajeDeError(new Error('x'))).toBe('Ocurrió un error inesperado.');
  });
});
