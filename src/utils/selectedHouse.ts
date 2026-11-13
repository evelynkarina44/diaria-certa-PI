import type { Endereco } from '../services/types';

// Com várias casas, nenhuma é selecionada implicitamente.
export function selectedHouse(addresses: Endereco[] = [], selectedId: number | null): Endereco | null {
  if (selectedId !== null) return addresses.find(address => address.id_endereco === selectedId) ?? null;
  return addresses.length === 1 ? addresses[0] : null;
}

