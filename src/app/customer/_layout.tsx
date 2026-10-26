import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

const GREEN = "#173F35";
const MUTED = "#89928B";

function TabIcon({
  symbol,
  focused,
}: {
  symbol: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconBox, focused && styles.activeIconBox]}>
      <Text style={[styles.icon, focused && styles.activeIcon]}>
        {symbol}
      </Text>
    </View>
  );
}

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="⌂" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="⌕" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="♡" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="enquiries"
        options={{
          title: "Enquiries",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="▤" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="♙" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E8ECE7",
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 86 : 66,
    paddingTop: 7,
    paddingBottom: Platform.OS === "ios" ? 23 : 7,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
  iconBox: {
    width: 38,
    height: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconBox: {
    backgroundColor: "#E5EDE7",
  },
  icon: {
    fontSize: 23,
    color: MUTED,
  },
  activeIcon: {
    color: GREEN,
  },
});