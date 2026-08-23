import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';

import CadastroScreen from '../screens/CadastroScreen';
import CadastroClienteScreen from '../screens/CadastroClienteScreen';
import CadastroDiaristaScreen from '../screens/CadastroDiaristaScreen';

import EncontrarDiaristaScreen from '../screens/EncontrarDiaristaScreen';
import PerfilDiaristaScreen from '../screens/PerfilDiaristaScreen';
import AgendarDiariaScreen from '../screens/AgendarDiariaScreen';

import PagamentoScreen from '../screens/PagamentoScreen';
import AdicionarPagamentoScreen from '../screens/AdicionarPagamentoScreen';
import PagamentoPixScreen from '../screens/PagamentoPixScreen';
import PagamentoRealizadoScreen from '../screens/PagamentoRealizadoScreen';

import CheckInScreen from '../screens/CheckInScreen';
import AvaliacaoScreen from '../screens/AvaliacaoScreen';

import HomeDiaristaScreen from '../screens/HomeDiaristaScreen';
import PerfilDiaristaEdicaoScreen from '../screens/PerfilDiaristaEdicaoScreen';
import CheckInDiaristaScreen from '../screens/CheckInDiaristaScreen';

import SolicitacoesDiaristaScreen from '../screens/SolicitacoesDiaristaScreen';
import HistoricoDiaristaScreen from '../screens/HistoricoDiaristaScreen';

import PerfilClienteScreen from '../screens/PerfilClienteScreen';
import HistoricoClienteScreen from '../screens/HistoricoClienteScreen';
import SelecionarPerfilScreen from '../screens/SelecionarPerfilScreen';
import ServicosDiaristaScreen from '../screens/ServicosDiaristaScreen';
import CombosDiaristaScreen from '../screens/CombosDiaristaScreen';
import AgendaDiaristaScreen from '../screens/AgendaDiaristaScreen';

const Stack = createNativeStackNavigator();

export function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="SelecionarPerfil"
        component={SelecionarPerfilScreen}
      />

      <Stack.Screen
        name="Cadastro"
        component={CadastroScreen}
      />

      <Stack.Screen
        name="CadastroCliente"
        component={CadastroClienteScreen}
      />

      <Stack.Screen
        name="CadastroDiarista"
        component={CadastroDiaristaScreen}
      />

      <Stack.Screen
        name="EncontrarDiarista"
        component={EncontrarDiaristaScreen}
      />

      <Stack.Screen
        name="PerfilDiarista"
        component={PerfilDiaristaScreen}
      />

      <Stack.Screen
        name="AgendarDiaria"
        component={AgendarDiariaScreen}
      />

      <Stack.Screen
  name="Pagamento"
  component={PagamentoScreen}
/>

<Stack.Screen
  name="AdicionarPagamento"
  component={AdicionarPagamentoScreen}
/>

<Stack.Screen
  name="PagamentoPix"
  component={PagamentoPixScreen}
/>

<Stack.Screen
  name="PagamentoRealizado"
  component={PagamentoRealizadoScreen}
/>

<Stack.Screen
  name="CheckIn"
  component={CheckInScreen}
/>

<Stack.Screen
  name="Avaliacao"
  component={AvaliacaoScreen}
/>

<Stack.Screen
  name="HomeDiarista"
  component={HomeDiaristaScreen}
/>

<Stack.Screen
  name="PerfilDiaristaEdicao"
  component={PerfilDiaristaEdicaoScreen}
/>

<Stack.Screen
  name="ServicosDiarista"
  component={ServicosDiaristaScreen}
/>

<Stack.Screen
  name="CombosDiarista"
  component={CombosDiaristaScreen}
/>

<Stack.Screen
  name="AgendaDiarista"
  component={AgendaDiaristaScreen}
/>

<Stack.Screen
  name="CheckInDiarista"
  component={CheckInDiaristaScreen}
/>

<Stack.Screen
  name="SolicitacoesDiarista"
  component={SolicitacoesDiaristaScreen}
/>

<Stack.Screen
  name="HistoricoDiarista"
  component={HistoricoDiaristaScreen}
/>

<Stack.Screen
  name="PerfilCliente"
  component={PerfilClienteScreen}
/>

<Stack.Screen
  name="HistoricoCliente"
  component={HistoricoClienteScreen}
/>

    </Stack.Navigator>
  );
}
