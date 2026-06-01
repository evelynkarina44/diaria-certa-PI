import { SafeAreaView, View, Text, Button } from "react-native";

export default function CadastroMobile({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Cadastro</Text>
        <Text style={{ fontSize: 16 }}>Tela de cadastro mobile.</Text>

        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}