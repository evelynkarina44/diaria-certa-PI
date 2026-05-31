import { SafeAreaView, View, Text, Button, Alert } from "react-native";

import { request } from "../../services/api";

export default function LoginMobile({ navigation }: any) {
  async function testarApi() {
    try {
      const response = await request({
        method: "GET",
        url: "/api/usuario",
      });

      console.log("Resposta:", response);
      Alert.alert("Sucesso", JSON.stringify(response));
    } catch (error) {
      console.log("Erro:", error);
      Alert.alert("Erro", "Falha ao conectar");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Login</Text>

        <Button title="Testar API" onPress={testarApi} />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}