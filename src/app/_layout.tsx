import { Stack } from "expo-router";
import GlobalProviders from "../store/context/providers";

export default function RootLayout() {
  return (
    <GlobalProviders>
      <Stack />
    </GlobalProviders>
  );
}
