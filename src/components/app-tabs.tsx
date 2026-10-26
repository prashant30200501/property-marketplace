import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

const GREEN = "#173F35";
const MUTED = "#89928B";
const BORDER = "#E8ECE7";
const BACKGROUND = "#FFFFFF";

function TabIcon({
  emoji,
  focused,
}: {
  emoji: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.activeIcon]}>
      <Text style={[styles.icon, focused && styles.activeIconText]}>
        {emoji}
      </Text>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GREEN,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⌂" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⌕" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="♡" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-enquiries"
        options={{
          title: "Enquiries",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="▤" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="♙" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BACKGROUND,
    borderTopColor: BORDER,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 86 : 66,
    paddingTop: 7,
    paddingBottom: Platform.OS === "ios" ? 23 : 7,
    elevation: 8,
  },

  tabItem: {
    paddingVertical: 2,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
  },

  iconContainer: {
    width: 38,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  activeIcon: {
    backgroundColor: "#E5EDE7",
  },

  icon: {
    fontSize: 23,
    color: MUTED,
  },

  activeIconText: {
    color: GREEN,
  },
});