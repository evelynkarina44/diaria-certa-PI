const clientItems = [
  { route: 'PerfilCliente', label: 'Meu perfil', icon: 'person-outline' as const },
  { route: 'EncontrarDiarista', label: 'Página inicial', icon: 'home-outline' as const },
  { route: 'MinhasDiariasCliente', label: 'Minhas diárias', icon: 'list-circle-outline' as const },
  { route: 'AvaliacoesRecebidas', label: 'Avaliações recebidas', icon: 'star-outline' as const },
  { route: 'FavoritosCliente', label: 'Favoritos', icon: 'heart-outline' as const },
];
const workerItems = [
  { route: 'PerfilDiaristaEdicao', label: 'Meu perfil', icon: 'person-outline' as const },
  { route: 'HomeDiarista', label: 'Página inicial', icon: 'home-outline' as const },
  { route: 'MinhasDiariasDiarista', label: 'Minhas diárias', icon: 'list-circle-outline' as const },
  { route: 'ServicosDiarista', label: 'Meus serviços', icon: 'sparkles-outline' as const },
  { route: 'CombosDiarista', label: 'Meus combos', icon: 'layers-outline' as const },
  { route: 'AgendaDiarista', label: 'Minha agenda', icon: 'calendar-outline' as const },
  { route: 'AvaliacoesRecebidas', label: 'Avaliações recebidas', icon: 'star-outline' as const },
];
export const profileMenu = (profile: 'cliente' | 'diarista') => profile === 'diarista' ? workerItems : clientItems;
export function profileAccess(hasCliente: boolean, hasDiarista: boolean) {
  return !hasCliente ? { route: 'CadastroCliente', label: 'Criar perfil de cliente', icon: 'person-add-outline' as const }
    : !hasDiarista ? { route: 'CadastroDiarista', label: 'Criar perfil de diarista', icon: 'person-add-outline' as const }
    : { route: 'SelecionarPerfil', label: 'Trocar perfil ativo', icon: 'swap-horizontal-outline' as const };
}
