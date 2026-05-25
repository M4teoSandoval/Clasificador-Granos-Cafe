import { useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  Text,
  View,
  StyleSheet
} from "react-native";

import * as ImagePicker from "expo-image-picker";

export default function Home() {

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://35.172.87.68:8001/predict";

  // =========================
  // 📸 TOMAR FOTO
  // =========================
  const pickImage = async () => {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Permiso de cámara denegado");
      return;
    }

    const response =
      await ImagePicker.launchCameraAsync({
        quality: 1
      });

    if (!response.canceled) {

      const asset = response.assets[0];

      setImage(asset.uri);

      uploadImage(asset);
    }
  };

  // =========================
  // 🖼️ GALERÍA
  // =========================
  const pickFromGallery = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permiso de galería denegado");
      return;
    }

    const response =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1
      });

    if (!response.canceled) {

      const asset = response.assets[0];

      setImage(asset.uri);

      uploadImage(asset);
    }
  };

  // =========================
  // ☁️ SUBIR A BACKEND
  // =========================
  const uploadImage = async (asset: any) => {

    setLoading(true);
    setResult(null);

    const formData = new FormData();

    formData.append("file", {
      uri: asset.uri,
      name: "photo.jpg",
      type: "image/jpeg"
    } as any);

    try {

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      console.log("RESPUESTA BACKEND:", data);

      setResult(data);

    } catch (error) {

      console.log(error);
      alert("Error enviando imagen");

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Clasificador de Café con IA
      </Text>

      <Text style={styles.subtitle}>
        YOLOv8 + FastAPI + AWS + Expo Go
      </Text>

      <Button title="Tomar Foto" onPress={pickImage} />

      <View style={{ height: 10 }} />

      <Button title="Subir desde Galería" onPress={pickFromGallery} />

      {/* Imagen original */}
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      {/* Loading */}
      {loading && (
        <Text style={styles.loading}>
          Analizando imagen...
        </Text>
      )}

      {/* RESULTADO */}
      {result && (
        <View style={styles.resultBox}>

          <Text style={styles.resultTitle}>
            Resultado
          </Text>

          {/* TOTAL */}
          {result.total_detections !== undefined && (
            <Text>
              Total detecciones: {result.total_detections}
            </Text>
          )}

          {/* RESUMEN POR CLASE */}
          {result.summary && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold" }}>
                Resumen:
              </Text>

              {Object.entries(result.summary).map(([key, value]: any) => (
                <Text key={key}>
                  {key}: {value.count} ({value.percentage}%)
                </Text>
              ))}
            </View>
          )}

          {/* DETECCIONES */}
          {result.detections?.map((item: any, index: number) => (
            <Text key={index}>
              {item.class_name} - {Number(item.confidence).toFixed(2)}
            </Text>
          ))}

          {/* IMAGEN CON BOUNDING BOXES */}
          {result.image_url && (
            <Image
              source={{ uri: result.image_url }}
              style={styles.image}
            />
          )}

        </View>
      )}

      {/* FOOTER / INTEGRANTES */}
      <View style={styles.footer}>

        <Text style={styles.footerTitle}>
          Proyecto desarrollado por:
        </Text>

        <Text>• Mateo Sandoval</Text>
        <Text>• Juan David Contreras</Text>
        <Text>• Wilson Suarez</Text>

      </View>

    </ScrollView>
  );
}

// =========================
// ESTILOS
// =========================
const styles = StyleSheet.create({

  container: {
    padding: 20,
    marginTop: 40
  },

  title: {
    fontSize: 22,
    fontWeight: "bold"
  },

  subtitle: {
    color: "gray",
    marginBottom: 20
  },

  image: {
    width: "100%",
    height: 300,
    marginTop: 20,
    borderRadius: 10
  },

  loading: {
    marginTop: 10,
    color: "blue"
  },

  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10
  },

  resultTitle: {
    fontWeight: "bold",
    marginBottom: 10
  },

  footer: {
    marginTop: 30,
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },

  footerTitle: {
    fontWeight: "bold"
  }
});