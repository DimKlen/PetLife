import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen
        name="index"
        options={{ drawerLabel: "Mes Animaux" }}
      />
      <Drawer.Screen
        name="calendar"
        options={{ drawerLabel: "Calendrier" }}
      />
    </Drawer>
  );
}
