type HistoryItem = {
  id: number; nome: string; status?: string; checkinExpirado?: boolean;
  dataISO?: string; horario?: string; servicos?: string;
};

export function filterHistory<T extends HistoryItem>(
  items: T[], search: string, status: string, date: string, order: 'recentes' | 'antigos',
): T[] {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const terms = normalize(search.trim()).split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const text = normalize([item.nome, item.servicos, item.id].join(' '));
    const dateParts = item.dataISO?.slice(0, 10).split('-');
    const displayDate = dateParts?.length === 3 ? dateParts.reverse().join('/') : '';
    const matchesStatus = status === 'Todos' || (status === 'Checkin_expirado'
      ? item.checkinExpirado === true
      : item.status === status && !(status === 'Expirado' && item.checkinExpirado));
    return matchesStatus && terms.every(term => text.includes(term)) && displayDate.startsWith(date);
  }).sort((a, b) => {
    const key = (item: T) => (item.dataISO?.slice(0, 10) ?? '') + (item.horario ?? '');
    const comparison = key(a).localeCompare(key(b)) || a.id - b.id;
    return order === 'recentes' ? -comparison : comparison;
  });
}


/** Paginação visual após aplicar os filtros; nunca altera a lista original. */
export function paginateHistory<T>(items: T[], requestedPage: number) {
  const pages = Math.ceil(items.length / 10);
  const page = Math.max(1, Math.min(Math.trunc(requestedPage) || 1, pages || 1));
  return { data: items.slice((page - 1) * 10, page * 10), page, pages };
}
