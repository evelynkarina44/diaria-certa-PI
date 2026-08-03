import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';

import CadastroScreen from '../screens/CadastroScreen';
import CadastroClienteScreen from '../screens/CadastroClienteScreen';
import CadastroDiaristaScreen from '../screens/CadastroDiaristaScreen';

import EncontrarDiaristaScreen from '../screens/EncontrarDiaristaScreen';
import PerfilDiaristaScreen from '../screens/PerfilDiaristaScreen';
import AgendarDiariaScreen from '../screens/AgendarDiariaScreen';

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
    </Stack.Navigator>
  );
}