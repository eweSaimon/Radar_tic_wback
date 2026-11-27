export interface Oportunidad {
  id: number;
  titulo: string;
  categoria: string;
  entidad: string;
  descripcion: string;
  modalidad: string;
  fechaLimite: string;
  tecnologias: string[];
  disponible: boolean;
}
