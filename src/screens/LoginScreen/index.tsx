import React from "react";
import { View, Button, Alert } from "react-native";
import { request } from "../../services/api";

export default function HomeScreen() {
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
    <View>
      <Button title="Testar API" onPress={testarApi} />
    </View>
  );
}