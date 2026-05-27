import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { CoffeeBean } from "@/components/coffee-bean";

function pct(val: number, total: number) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

function getVerdict(sc: number) {
  if (sc >= 80) return { label: "EXPORTABLE", color: "#4ADE80", bg: "rgba(74,222,128,0.1)" };
  if (sc >= 50) return { label: "MEDIO", color: "#FACC15", bg: "rgba(250,204,21,0.1)" };
  return { label: "BAJO", color: "#F87171", bg: "rgba(248,113,113,0.1)" };
}

function getAnalysis(alta: number, media: number, baja: number, total: number) {
  const sc = pct(alta, total);
  const bajaPct = pct(baja, total);
  const mediaPct = pct(media, total);

  if (sc >= 80) {
    return `✅ Lote apto para exportación. El ${sc}% de los granos son de alta calidad. Cumple estándares internacionales. Se recomienda proceder con la venta a precio premium.`;
  }
  if (sc >= 60) {
    return `⚠️ Lote con calidad aceptable. El ${sc}% son granos de alta calidad. Con un ${bajaPct}% de defectos, separar manualmente los granos malos antes de la venta para mejorar el precio.`;
  }
  if (sc >= 40) {
    return `🔶 Lote con defectos moderados. Solo el ${sc}% son granos aptos. El ${bajaPct}% presenta defectos graves. Se recomienda revisar el proceso de secado o despulpado.`;
  }
  return `❌ Lote no apto para venta. El ${bajaPct}% de los granos presentan defectos graves. Sería rechazado o pagado al mínimo. Revisar el proceso de beneficio.`;
}

const CLASS_META: Record<string, { label: string; color: string }> = {
  alta: { label: "Alta calidad", color: "#4ADE80" },
  media: { label: "Media calidad", color: "#FACC15" },
  baja: { label: "Baja calidad", color: "#F87171" },
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://35.172.87.68:8001/predict";

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Permiso de cámara denegado");
      return;
    }
    const response = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!response.canceled) {
      const asset = response.assets[0];
      setImage(asset.uri);
      uploadImage(asset);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permiso de galería denegado");
      return;
    }
    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!response.canceled) {
      const asset = response.assets[0];
      setImage(asset.uri);
      uploadImage(asset);
    }
  };

  const uploadImage = async (asset: any) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    } as any);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
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

  const alta = result?.summary?.alta?.count ?? 0;
  const media = result?.summary?.media?.count ?? 0;
  const baja = result?.summary?.baja?.count ?? 0;
  const total = result?.total_detections ?? 0;
  const sc = pct(alta, total);
  const vrd = result ? getVerdict(sc) : null;
  const analysis = result ? getAnalysis(alta, media, baja, total) : "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ marginBottom: 12 }}>
          <CoffeeBean size={56} />
        </View>
        <Text style={styles.title}>CaféVision</Text>
        <Text style={styles.subtitle}>Clasificador de Café con IA</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={pickImage} activeOpacity={0.8}>
          <Text style={styles.btnIcon}>📸</Text>
          <Text style={styles.btnLabel}>Tomar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickFromGallery} activeOpacity={0.8}>
          <Text style={styles.btnIcon}>🖼️</Text>
          <Text style={styles.btnLabel}>Galería</Text>
        </TouchableOpacity>
      </View>

      {/* Original Image (before result) */}
      {image && !result && !loading && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#C8F04A" />
          <Text style={styles.loadingText}>Analizando imagen...</Text>
          <Text style={styles.loadingSub}>El modelo IA está procesando los granos de café</Text>
        </View>
      )}

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          {/* Score */}
          <View style={[styles.scoreBox, { backgroundColor: vrd!.bg }]}>
            <Text style={[styles.scoreValue, { color: vrd!.color }]}>{sc}%</Text>
            <Text style={[styles.scoreLabel, { color: vrd!.color }]}>{vrd!.label}</Text>
            <Text style={styles.scoreTotal}>{total} granos detectados</Text>
          </View>

          {/* Result Image */}
          {result.image_url && (
            <Image source={{ uri: result.image_url }} style={styles.imageResult} />
          )}

          {/* Distribution */}
          {result.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distribución de calidad</Text>
              {Object.entries(CLASS_META).map(([key, meta]) => {
                const item = result.summary[key];
                if (!item) return null;
                return (
                  <View key={key} style={styles.barRow}>
                    <View style={styles.barHeader}>
                      <Text style={styles.barLabel}>{meta.label}</Text>
                      <Text style={[styles.barCount, { color: meta.color }]}>
                        {item.count} <Text style={styles.barPct}>({Math.round(item.percentage)}%)</Text>
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${item.percentage}%`, backgroundColor: meta.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Analysis */}
          <View style={[styles.analysisBox, { borderLeftColor: vrd!.color }]}>
            <Text style={styles.analysisTitle}>Análisis del lote</Text>
            <Text style={styles.analysisText}>{analysis}</Text>
          </View>

          {/* Detections */}
          {result.detections && result.detections.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Detecciones {result.detections.length > 10 ? `(últimas 10 de ${result.detections.length})` : ""}
              </Text>
              {result.detections.slice(0, 10).map((item: any, index: number) => {
                const dotColor = CLASS_META[item.class_name]?.color || "#888";
                return (
                  <View key={index} style={styles.detRow}>
                    <View style={[styles.detDot, { backgroundColor: dotColor }]} />
                    <Text style={styles.detName}>{item.class_name}</Text>
                    <Text style={styles.detConf}>{Number(item.confidence).toFixed(3)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F0",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4A3728",
  },
  subtitle: {
    fontSize: 13,
    color: "#8B7D6B",
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    backgroundColor: "#4A3728",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  imagePreview: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: "#e8e4dc",
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A3728",
    fontWeight: "600",
  },
  loadingSub: {
    marginTop: 6,
    fontSize: 12,
    color: "#8B7D6B",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreBox: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 14,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1,
  },
  scoreTotal: {
    fontSize: 13,
    color: "#8B7D6B",
    marginTop: 8,
  },
  imageResult: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#000",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A3728",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  barRow: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 12,
    color: "#8B7D6B",
  },
  barCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  barPct: {
    fontWeight: "400",
    color: "#8B7D6B",
  },
  barTrack: {
    height: 8,
    backgroundColor: "#F0EDE6",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  analysisBox: {
    backgroundColor: "#FAF8F4",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A3728",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 13,
    color: "#4A3728",
    lineHeight: 20,
  },
  detRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE6",
  },
  detDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  detName: {
    flex: 1,
    fontSize: 13,
    color: "#4A3728",
    textTransform: "capitalize",
  },
  detConf: {
    fontSize: 12,
    color: "#8B7D6B",
  },
});
