import { useState } from 'react';

import HomePage from './src/pages/home';
import LoginPage from './src/pages/login';
import CadastroPage from './src/pages/cadastro';

export default function App() {
  const [route, setRoute] = useState<'home' | 'login' | 'cadastro'>('home');

  if (route === 'login') {
    return <LoginPage onBack={() => setRoute('home')} />;
  }

  if (route === 'cadastro') {
    return <CadastroPage onBack={() => setRoute('home')} />;
  }

  return <HomePage onLogin={() => setRoute('login')} onCadastro={() => setRoute('cadastro')} />;
}
