import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiBaseUrl() {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;

  if (configuredUrl && !/localhost|127\.0\.0\.1/.test(configuredUrl)) {
    return configuredUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.replace(/^.*?:\/\//, "").split(":")[0];
    return `http://${host}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export async function request({
  method = "GET",
  url,
  data = null,
  headers = {},
  params = {},
}) {
  try {
    const response = await api({
      method,
      url,
      data,
      params,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro na request:", error);

    throw (
      error.response?.data || {
        message: "Erro interno na requisição",
      }
    );
  }
}