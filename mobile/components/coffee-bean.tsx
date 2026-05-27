import { View, StyleSheet } from 'react-native';

export function CoffeeBean({ size = 56 }: { size?: number }) {
  const beanWidth = size * 0.62;
  const beanHeight = size * 0.82;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.bean, { width: beanWidth, height: beanHeight, borderRadius: beanHeight / 2 }]}>
        <View style={[styles.line, { height: beanHeight * 0.55 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bean: {
    backgroundColor: '#5B8C2A',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-20deg' }],
  },
  line: {
    width: 2.5,
    backgroundColor: '#3D6B1E',
    borderRadius: 1.5,
  },
});
