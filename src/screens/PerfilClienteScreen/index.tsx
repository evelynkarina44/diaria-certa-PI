import React, { useEffect, useState } from 'react';

import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { enderecoService } from '../../services/enderecoService';
import type { Endereco } from '../../services/types';

export default function PerfilClienteScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [endereco, setEndereco] = useState<Endereco | null>(null);

  useEffect(() => {
    enderecoService
      .listar({ limit: 1 })
      .then((response) => setEndereco(response.data[0] ?? null))
      .catch(() => setEndereco(null));
  }, []);
  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Home',
                },
              ],
            });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={58}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {user?.nome ?? 'Cliente'}
              </Text>

              <Ionicons
                name="female"
                size={15}
                color="#18C7C8"
              />
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HistoricoCliente')
              }
              activeOpacity={0.7}
            >
              <View style={styles.historyRow}>
                <Text style={styles.historyText}>
                  Ver histórico
                </Text>

                <Ionicons
                  name="search-outline"
                  size={14}
                  color="#8F8F8F"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.certificateBox}>
          <Text style={styles.certificateText}>
            Essa pessoa possui o certificado de confiança como
            contratante!
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={24}
              color="#18C7C8"
            />

            <Text style={styles.locationTitle}>
              Localização
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="search-outline"
              size={22}
              color="#A0A0A0"
            />

            <Text style={styles.address}>
              {endereco
                ? `${endereco.logradouro} ${endereco.numero} - ${endereco.bairro}`
                : 'Endereço não informado'}
            </Text>
          </View>
        </View>

        <Text style={styles.imagesTitle}>
          Imagens da residência
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {[1, 2, 3].map((imagem) => (
            <View
              key={imagem}
              style={styles.houseImage}
            >
              <Ionicons
                name="image-outline"
                size={45}
                color="#AAAAAA"
              />

              <Text style={styles.imageText}>
                Imagem {imagem}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#FF3338"
          />

          <Text style={styles.logoutButtonText}>
            Sair da conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
