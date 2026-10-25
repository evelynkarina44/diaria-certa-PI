import test from 'node:test';
import assert from 'node:assert/strict';
import { splitMessagesAtProposal } from './conversationTimeline.ts';

const message = (id, papel, second) => ({ id_mensagem: id, papel, criado_em: `2026-10-20T12:00:${String(second).padStart(2, '0')}.000Z` });
const messages = [message('welcome', 'assistant', 0), message('request', 'user', 1), message('proposal-answer', 'assistant', 2), message('question', 'user', 3), message('answer', 'assistant', 4)];
const ids = (items) => items.map((item) => item.id_mensagem);

test('novas perguntas e respostas ficam abaixo do card, sem reordenar mensagens', () => {
  const result = splitMessagesAtProposal(messages, { criado_em: messages[2].criado_em });
  assert.deepEqual(ids(result.before), ['welcome', 'request', 'proposal-answer']);
  assert.deepEqual(ids(result.after), ['question', 'answer']);
  assert.deepEqual([...result.before, ...result.after], messages);
});

test('confirmar e reabrir a conversa não desloca a proposta para depois das mensagens novas', () => {
  const proposal = { criado_em: messages[2].criado_em, status: 'Confirmada' };
  const confirmed = [...messages, message('confirmation', 'assistant', 5), message('new-question', 'user', 6)];
  const result = splitMessagesAtProposal(JSON.parse(JSON.stringify(confirmed)), JSON.parse(JSON.stringify(proposal)));
  assert.deepEqual(ids(result.before), ['welcome', 'request', 'proposal-answer']);
  assert.deepEqual(ids(result.after), ['question', 'answer', 'confirmation', 'new-question']);
});

test('propostas antigas criadas antes da mensagem ficam depois da resposta que as apresentou', () => {
  const result = splitMessagesAtProposal(messages, { criado_em: '2026-10-20T12:00:00.999Z' });
  assert.deepEqual(ids(result.before), ['welcome', 'request', 'proposal-answer']);
  assert.deepEqual(ids(result.after), ['question', 'answer']);
});

test('uma nova proposta ocupa seu novo lugar e não reaproveita a posição da anterior', () => {
  const result = splitMessagesAtProposal(messages, { criado_em: messages[4].criado_em });
  assert.deepEqual(result.before, messages);
  assert.deepEqual(result.after, []);
});

test('proposta anterior à janela de histórico fica antes das mensagens recentes', () => {
  const recent = messages.slice(3);
  const result = splitMessagesAtProposal(recent, { criado_em: messages[2].criado_em });
  assert.deepEqual(result.before, []);
  assert.deepEqual(result.after, recent);
});

test('sem proposta, sem mensagens ou sem data válida mantém o conteúdo visível', () => {
  for (const proposal of [null, undefined, {}, { criado_em: 'inválido' }]) {
    assert.deepEqual(splitMessagesAtProposal(messages, proposal), { before: messages, after: [] });
  }
  assert.deepEqual(splitMessagesAtProposal([], { criado_em: messages[2].criado_em }), { before: [], after: [] });
  assert.deepEqual(splitMessagesAtProposal(messages, { criado_em: '2026-10-21T12:00:00Z' }), { before: messages, after: [] });
});
