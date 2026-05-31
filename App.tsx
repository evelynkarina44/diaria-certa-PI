import { NavigationContainer } from "@react-navigation/native";
import { GlobalProvider } from "./src/contexts/GlobalContext";
import { Routes } from "./src/routes/routes";

export default function App() {
  return (
    <GlobalProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </GlobalProvider>
  );
}