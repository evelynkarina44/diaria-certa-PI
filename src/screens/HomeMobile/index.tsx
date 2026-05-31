import { SafeAreaView, View, Text, Button } from "react-native";

export default function HomeMobile({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Diária Certa</Text>
        <Text style={{ fontSize: 16 }}>Tela inicial mobile.</Text>

        <Button title="Entrar" onPress={() => navigation.navigate("Login")} />
        <Button
          title="Criar conta"
          onPress={() => navigation.navigate("Cadastro")}
        />
      </View>
    </SafeAreaView>
  );
}