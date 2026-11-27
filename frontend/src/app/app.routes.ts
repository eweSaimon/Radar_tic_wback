import { Routes } from '@angular/router';
import { OportunidadDetalle } from './pages/oportunidad-detalle/oportunidad-detalle';
import { OportunidadesList } from './pages/oportunidades-list/oportunidades-list';

export const routes: Routes = [
  { path: '', component: OportunidadesList },
  { path: 'oportunidad/:id', component: OportunidadDetalle },
  { path: '**', redirectTo: '' },
];
