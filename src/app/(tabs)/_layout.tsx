import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";

import { showHaptics } from "@mobile/lib/haptics";
import { useTheme } from "@mobile/lib/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconsName;
  iconOutline: IoniconsName;
};

const TAB_CONFIG: TabConfig[] = [
  { name: "index", title: "Home", icon: "home", iconOutline: "home-outline" },
  {
    name: "list",
    title: "List",
    icon: "receipt",
    iconOutline: "receipt-outline",
  },
  {
    name: "accounts",
    title: "Accounts",
    icon: "card",
    iconOutline: "card-outline",
  },
  // v2: merchants tab disabled
  // { name: "merchants", title: "Merchants", icon: "storefront", iconOutline: "storefront-outline" },
  {
    name: "calendar",
    title: "Calendar",
    icon: "calendar",
    iconOutline: "calendar-outline",
  },
  {
    name: "insights",
    title: "Insights",
    icon: "analytics",
    iconOutline: "analytics-outline",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings",
    iconOutline: "settings-outline",
  },
];

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingBottom: 16,
          paddingTop: 0,
          gap: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props as any} activeOpacity={0.7} />
        ),
      }}
    >
      {TAB_CONFIG.map(({ name, title, icon, iconOutline }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? icon : iconOutline}
                size={20}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: () => showHaptics("impactAsync"),
          }}
        />
      ))}
      {/* v2: hide merchants route from tab bar */}
      <Tabs.Screen name="merchants" options={{ href: null }} />
    </Tabs>
  );
}
