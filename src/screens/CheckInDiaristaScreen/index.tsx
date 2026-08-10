import React from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

export default function CheckInDiaristaScreen({
  navigation,
}: any) {
  function solicitarCheckIn() {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.orangeHeader} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Solicitar Check In
        </Text>

        <View style={styles.divider} />

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={43}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                Pollyanna Ferreira
              </Text>

              <Ionicons
                name="female"
                size={14}
                color="#18C7C8"
              />
            </View>

            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                4.9
              </Text>

              {[1, 2, 3, 4].map((estrela) => (
                <Ionicons
                  key={estrela}
                  name="star"
                  size={13}
                  color="#FFB800"
                />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Serviços solicitados
        </Text>

        <View style={styles.serviceBadge}>
          <Text style={styles.serviceText}>
            Limpeza Geral
          </Text>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={23}
              color="#18C7C8"
            />

            <Text style={styles.locationTitle}>
              Localização
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="search"
              size={21}
              color="#A0A0A0"
            />

            <Text style={styles.address}>
              Rua Pradopolys 483 - Ariston
            </Text>
          </View>
        </View>

        <Text style={styles.imagesTitle}>
          Imagens da residência
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesRow}
        >
          {[1, 2, 3].map((imagem) => (
            <View
              key={imagem}
              style={styles.houseImage}
            >
              <Ionicons
                name="image-outline"
                size={38}
                color="#AAAAAA"
              />

              <Text style={styles.imagePlaceholder}>
                Imagem {imagem}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.checkInButton}
          onPress={solicitarCheckIn}
          activeOpacity={0.85}
        >
          <Text style={styles.checkInButtonText}>
            Solicitar Check In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}