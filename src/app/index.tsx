import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/ui/button";
import AppText from "../components/ui/text";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <AppText variant="title" style={{ marginTop: 20 }}>
        Hello World
      </AppText>
      <AppText variant="defaultSemiBold" style={{ marginTop: 10 }}>
        Welcome to Expo Router with TypeScript and Tailwind CSS!
      </AppText>
      <AppButton variant="outline">ddd</AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
