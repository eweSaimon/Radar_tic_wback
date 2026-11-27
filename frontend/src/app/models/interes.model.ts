/** Cuerpo que Angular envía en POST /api/intereses */
export interface InteresRequest {
  nombre: string;
  correo: string;
  oportunidadId: number;
}

/** Respuesta 201 del servidor */
export interface InteresResponse {
  mensaje: string;
  interes: InteresRequest & { id: number; fechaRegistro: string };
}
