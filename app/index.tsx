import notifee, { AndroidImportance } from "@notifee/react-native";
import { Audio } from "expo-av";
import React, { useEffect, useRef } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  const soundRef = useRef(new Audio.Sound());

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
    // 1. Registrasi Service agar Android tahu ini "Service Permanen"
    notifee.registerForegroundService((notification) => {
      return new Promise(() => {
        // Service ini akan hidup terus di sini
      });
    });
  }, []);

  async function playSound() {
    // 2. Load suara (Pastikan file suara ada di folder assets)
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/tes.mp3"),
      { isLooping: true }, // Biar bunyinya terus-menerus
    );
    soundRef.current = sound;
    await sound.playAsync();
  }

  async function startService() {
    await notifee.requestPermission();

    // 3. Buat Channel
    const channelId = await notifee.createChannel({
      id: "bel-sekolah-channel",
      name: "Bel Sekolah",
      importance: AndroidImportance.HIGH,
    });

    // 4. Tampilkan Notifikasi Sticky (Foreground Service)
    await notifee.displayNotification({
      title: "Bel Sekolah Sedang Berbunyi",
      body: "Menunggu perintah berhenti...",
      android: {
        channelId,
        asForegroundService: true,
        ongoing: true, // INI: Tidak bisa di-swipe
        importance: AndroidImportance.HIGH,
        color: "#FF0000",
        pressAction: { id: "default" },
      },
    });

    // 5. Jalankan Audio
    await playSound();
  }

  async function stopService() {
    // 6. Stop Audio & Service
    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();
    await notifee.stopForegroundService();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Status: Bel Sekolah</Text>
      <Button title="Aktifkan Bel" onPress={startService} />
      <Button title="Berhenti" onPress={stopService} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
