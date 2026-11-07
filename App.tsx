import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { GlobalProvider } from "./src/contexts/GlobalContext";
import { Routes } from "./src/routes/routes";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GlobalProvider>
        <NotificationProvider>
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
        </NotificationProvider>
      </GlobalProvider>
    </SafeAreaProvider>
  );
}
