import { ScrollView, Text, View, StyleSheet } from "react-native";

import { CoffeeBean } from "@/components/coffee-bean";

const TEAM = [
  { name: "Keiner Mateo Sandoval Barreto", role: "Desarrollador" },
  { name: "Wilson Andrés Suárez Mantilla", role: "Desarrollador" },
  { name: "Juan David Contreras Bernal", role: "Desarrollador" },
];

const STEPS = [
  {
    icon: "📸",
    title: "Capturar imagen",
    desc: "Toma una foto de los granos de café con la cámara o selecciona una desde la galería.",
  },
  {
    icon: "☁️",
    title: "Análisis con IA",
    desc: "La imagen se envía a un modelo YOLOv8 entrenado para detectar y clasificar cada grano individualmente.",
  },
  {
    icon: "📊",
    title: "Resultados",
    desc: "El sistema muestra cuántos granos son de alta, media y baja calidad, junto con un análisis de viabilidad del lote.",
  },
];

export default function Explore() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ marginBottom: 12 }}>
          <CoffeeBean size={56} />
        </View>
        <Text style={styles.title}>CaféVision</Text>
        <Text style={styles.sub}>Clasificador de Café con IA</Text>
      </View>

      {/* Project Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre el proyecto</Text>
        <Text style={styles.cardText}>
          Este proyecto fue desarrollado como proyecto de clase en inteligencia artificial
          para la{" "}
          <Text style={styles.bold}>Universidad Autónoma de Bucaramanga (UNAB)</Text>.
        </Text>
        <Text style={styles.cardText}>
          Utiliza un modelo de visión por computadora basado en{" "}
          <Text style={styles.bold}>YOLOv8</Text> para analizar imágenes de granos de café y
          clasificarlos automáticamente según su calidad.
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>

        {STEPS.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                <Text style={styles.stepNum}>{i + 1}.</Text> {step.title}
              </Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Model explanation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clasificación de calidad</Text>
        <Text style={styles.cardText}>
          El modelo analiza cada grano de café en la imagen y lo clasifica en tres categorías:
        </Text>

        <View style={styles.classRow}>
          <View style={[styles.classDot, { backgroundColor: "#4ADE80" }]} />
          <Text style={styles.classLabel}>Alta calidad</Text>
          <Text style={styles.classDesc}>Granos aptos para exportación, libres de defectos</Text>
        </View>
        <View style={styles.classRow}>
          <View style={[styles.classDot, { backgroundColor: "#FACC15" }]} />
          <Text style={styles.classLabel}>Media calidad</Text>
          <Text style={styles.classDesc}>Granos con defectos menores, calidad aceptable</Text>
        </View>
        <View style={styles.classRow}>
          <View style={[styles.classDot, { backgroundColor: "#F87171" }]} />
          <Text style={styles.classLabel}>Baja calidad</Text>
          <Text style={styles.classDesc}>Granos con defectos graves, no aptos para venta</Text>
        </View>

        <Text style={[styles.cardText, { marginTop: 12 }]}>
          Con base en esta clasificación, el sistema genera un{" "}
          <Text style={styles.bold}>análisis de viabilidad</Text> que indica si el lote es
          exportable, aceptable, o si requiere revisión del proceso de beneficio.
        </Text>
      </View>

      {/* Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipo de desarrollo</Text>

        {TEAM.map((member, i) => (
          <View key={i} style={styles.memberCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Universidad Autónoma de Bucaramanga — UNAB</Text>
        <Text style={styles.footerText}>Proyecto de Inteligencia Artificial</Text>
        <Text style={styles.footerYear}>2026</Text>
      </View>
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
  sub: {
    fontSize: 13,
    color: "#8B7D6B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A3728",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 13,
    color: "#5A4A3A",
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
    color: "#4A3728",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A3728",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 14,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A3728",
    marginBottom: 3,
  },
  stepNum: {
    color: "#C8F04A",
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 12,
    color: "#8B7D6B",
    lineHeight: 18,
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE6",
  },
  classDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  classLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A3728",
    width: 100,
  },
  classDesc: {
    fontSize: 12,
    color: "#8B7D6B",
    flex: 1,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A3728",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#C8F04A",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A3728",
  },
  memberRole: {
    fontSize: 12,
    color: "#8B7D6B",
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DC",
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#8B7D6B",
    marginBottom: 2,
  },
  footerYear: {
    fontSize: 11,
    color: "#B8AFA0",
    marginTop: 4,
  },
});
