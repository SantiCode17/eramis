import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, ChatCircleDots, UserCircle } from 'phosphor-react-native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

// Pantallas de onboarding y autenticación
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { InterestSelectionScreen } from '../screens/onboarding/InterestSelectionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Pantallas principales
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { UserProfileDetailScreen } from '../screens/discover/UserProfileDetailScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Pestañas principales de la aplicación autenticada.
 * Descubrir, Chats y Perfil con estilo glassmorfismo en la barra inferior.
 */
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'rgba(0,13,61,0.95)',
        borderTopColor: 'rgba(255,255,255,0.1)',
      },
      tabBarActiveTintColor: Colors.starGold,
      tabBarInactiveTintColor: Colors.textMuted,
    }}
  >
    <Tab.Screen
      name="Discover"
      component={DiscoverScreen}
      options={{
        tabBarIcon: ({ color, size }) => <House size={size} color={color} weight="fill" />,
      }}
    />
    <Tab.Screen
      name="Chats"
      component={ChatListScreen}
      options={{
        tabBarIcon: ({ color, size }) => <ChatCircleDots size={size} color={color} weight="fill" />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={MyProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} weight="fill" />,
      }}
    />
  </Tab.Navigator>
);

/**
 * Navegador principal de la aplicación.
 * Muestra SplashScreen mientras carga, flujo de auth si no hay sesión,
 * o las pestañas principales si el usuario está autenticado.
 */
export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="InterestSelection" component={InterestSelectionScreen} />
            <Stack.Screen name="UserProfileDetail" component={UserProfileDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
