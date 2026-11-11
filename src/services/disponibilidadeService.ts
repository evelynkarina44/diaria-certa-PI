import { request } from './api';
import { createCrudService } from './crud';
import type {
  Disponibilidade,
  DisponibilidadeCreate,
} from './types';

const crud = createCrudService<
  Disponibilidade,
  DisponibilidadeCreate,
  Partial<Omit<DisponibilidadeCreate, 'id_diarista'>>
>('/api/disponibilidade');

export const disponibilidadeService = {
  ...crud,
  salvarMes(data: { mes: string; dias: string[]; horarios: string[] }) {
    return request<Disponibilidade[]>({ method: 'PUT', url: '/api/disponibilidade/mensal', data });
  },
};
