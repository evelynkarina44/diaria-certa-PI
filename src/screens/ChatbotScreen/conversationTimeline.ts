type TimelineMessage = { papel: 'user' | 'assistant'; criado_em: string };

// Mantém o card junto à resposta original, não no fim de cada atualização do chat.
export function splitMessagesAtProposal<T extends TimelineMessage>(messages: T[], proposal?: { criado_em?: string } | null): { before: T[]; after: T[] } {
  const createdAt = Date.parse(proposal?.criado_em || '');
  if (!Number.isFinite(createdAt) || !messages.length) return { before: messages, after: [] };
  // O backend retorna uma janela recente: o card pode ser anterior a todas as mensagens.
  if (createdAt < Date.parse(messages[0].criado_em)) return { before: [], after: messages };
  const anchor = messages.findIndex((message) => message.papel === 'assistant' && Date.parse(message.criado_em) >= createdAt);
  const index = anchor < 0 ? messages.length : anchor + 1;
  return { before: messages.slice(0, index), after: messages.slice(index) };
}
