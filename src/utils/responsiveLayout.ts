export const DESKTOP_BREAKPOINT = 1024;
export const SIDEBAR_WIDTH = 264;
const publicRoutes = new Set(['Home', 'Login', 'Cadastro', 'CadastroCliente', 'CadastroDiarista', 'SelecionarPerfil']);
const focusedRoutes = new Set(['Pagamento', 'AdicionarPagamento', 'PagamentoPix', 'PagamentoRealizado', 'CheckIn', 'CheckInDiarista', 'Avaliacao', 'AgendarDiaria', 'Chatbot', 'DetalhesDiaria']);
export function responsiveLayout(platform: string, width: number, route: string, authenticated: boolean) {
  const desktop = platform === 'web' && width >= DESKTOP_BREAKPOINT;
  const constrained = platform === 'web' && width >= 768 && route !== 'Home';
  const sidebar = desktop && authenticated && !publicRoutes.has(route);
  const maxWidth = publicRoutes.has(route) ? (['Home', 'Login', 'Cadastro', 'SelecionarPerfil'].includes(route) ? 1280 : 760) : desktop && ['Pagamento', 'CheckInDiarista', 'Avaliacao'].includes(route) ? 1280 : focusedRoutes.has(route) ? 860 : 1280;
  const contentWidth = (desktop || constrained) ? Math.max(0, Math.min(maxWidth, width - (sidebar ? SIDEBAR_WIDTH : 0) - 48)) : width;
  return { desktop, constrained, sidebar, maxWidth, contentWidth, columns: desktop && contentWidth >= 800 ? 2 : 1 };
}
