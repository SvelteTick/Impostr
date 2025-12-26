import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { isTokenValid } from "@/services/auth";
import { Text } from "react-native-paper";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const valid = await isTokenValid();
      if (valid) {
        // Token is valid, go to home
        router.replace("/home");
      } else {
        // Token invalid or missing, go to login
        router.replace("/login");
      }
    } catch (e) {
      console.error("Auth check failed", e);
      router.replace("/login");
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Initializing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // Adapting to dark theme just in case
    backgroundColor: "#121212",
  },
  text: {
    marginTop: 20,
    opacity: 0.7,
  },
});
