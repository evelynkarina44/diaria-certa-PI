export function updateServiceDraft(current: string[], input: string, editing: string | null = null): { services: string[]; error?: never } | { error: string; services?: never } {
  const term = input.trim();
  if (!term) return { error: 'Digite o nome do serviço.' };
  if (/[,;\n]/.test(term)) return { error: 'Adicione um serviço por vez usando o botão Adicionar.' };
  if (term.length > 100) return { error: 'Use no máximo 100 caracteres por serviço.' };
  if (current.some(value => value !== editing && value.toLocaleLowerCase('pt-BR') === term.toLocaleLowerCase('pt-BR'))) {
    return { error: 'Esse serviço já foi adicionado.' };
  }
  const services = editing ? current.map(value => value === editing ? term : value) : [...current, term];
  if (services.length > 10 || services.join(', ').length > 1000) return { error: 'Adicione no máximo 10 serviços, com até 1000 caracteres no total.' };
  return { services };
}
