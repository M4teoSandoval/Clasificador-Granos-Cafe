import { ScrollView, Text, View } from "react-native";

export default function Explore() {

  return (
    <ScrollView style={{ padding: 20, marginTop: 40 }}>

      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Clasificador de Café con IA
      </Text>

      <Text style={{ marginTop: 10, color: "gray" }}>
        Proyecto basado en visión por computadora usando YOLOv8 para clasificar la calidad del café.
      </Text>

      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
        Objetivo
      </Text>

      <Text>
        Automatizar la clasificación de granos de café en baja, media y alta calidad utilizando inteligencia artificial.
      </Text>

      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
        Arquitectura
      </Text>

      <Text>
        Expo App → FastAPI (AWS EC2) → YOLOv8 → Respuesta JSON
      </Text>

      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
        Integrantes
      </Text>

      <Text>• Mateo Sandoval</Text>
      <Text>• Juan David Contreras</Text>
      <Text>• Wilson Suarez</Text>

    </ScrollView>
  );
}