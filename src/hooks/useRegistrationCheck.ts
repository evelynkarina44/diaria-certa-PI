import { useEffect, useRef, useState } from 'react';
import { cadastroService } from '../services/cadastroService';

// Não avança com uma resposta de campos antigos, após voltar ou sair da tela.
export function useRegistrationCheck(scope: string, onError: (error: unknown) => void) {
  const [checking, setChecking] = useState(false);
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const mounted = useRef(true);
  const locked = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current++; };
  }, []);

  function cancelCheck() {
    generation.current++;
    locked.current = false;
    if (mounted.current) setChecking(false);
  }

  async function checkRegistration(fields: { cpf?: string; email?: string }, onSuccess: () => void) {
    if (locked.current || !mounted.current) return;
    locked.current = true;
    const id = ++generation.current;
    const startedScope = currentScope.current;
    const valid = () => mounted.current && generation.current === id && currentScope.current === startedScope;
    setChecking(true);
    try {
      const result = await cadastroService.verificarCadastro(fields);
      if (!result.disponivel) throw new Error('Os dados informados não estão disponíveis para cadastro.');
      if (valid()) onSuccess();
    } catch (error) {
      if (valid()) onError(error);
    } finally {
      if (generation.current === id) {
        locked.current = false;
        if (mounted.current) setChecking(false);
      }
    }
  }

  return { checking, checkRegistration, cancelCheck };
}
