import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RecScreen from '../screens/RecScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, StyleSheet, StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();


const { width, height } = Dimensions.get('window');
const scaleFont = (size) => (width / 375) * size;

function BottomTabs(){

    const insets = useSafeAreaInsets();
    const tabBarHeight = scaleFont(50) + insets.bottom;

    return(
        
        // bottom tabs
        <Tab.Navigator screenOptions ={{
            tabBarStyle:{
                backgroundColor:"rgba(0,0,0,1)",
                position: "absolute",
                bottom:0,
                left:0,
                right:0,
                // height: scaleFont(50),
                height: tabBarHeight,

            }
        }}>
            {/* home screen */}
            <Tab.Screen
                name = 'Home'
                component = {HomeScreen}
                options = {{
                    tabBarLabel: 'Home',
                    headerShown: false,
                    tabBarLabelStyle: { color: 'white', fontSize:scaleFont(10) },
                    tabBarIcon:({focused}) =>
                    focused ? (
                        <Ionicons name="stats-chart" size={scaleFont(20)} color="white" />
                    ) : (
                        <Ionicons name="stats-chart-outline" size={scaleFont(20)} color="white" />
                    )
                }}
            />

            {/* RecScreen */}
            <Tab.Screen
                name = 'Rec'
                component = {RecScreen}
                options = {{
                    tabBarLabel: 'Discover',
                    headerShown: false,
                    tabBarLabelStyle: { color: 'white',  fontSize:scaleFont(10) },
                    tabBarIcon:({focused}) =>
                    focused ? (
                        <MaterialCommunityIcons name="cards" size={scaleFont(20)} color="white" />
                    ) : (
                        <MaterialCommunityIcons name="cards-outline" size={scaleFont(20)} color="white" />
                    )
                }}
            />
            {/* settings screen */}
            <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
            tabBarLabel: 'Account',
            headerShown: false,
            tabBarLabelStyle: { color: 'white', fontSize: scaleFont(10) },
            tabBarIcon: ({ focused }) =>
                focused ? (
                <FontAwesome5 name="user-alt" size={scaleFont(20)} color="white" />
                ) : (
                <FontAwesome5 name="user" size={scaleFont(20)} color="white" />
                ),
            }}
        />
        </Tab.Navigator>
    )
}

const Stack = createNativeStackNavigator();

function Navigation(){
    return (
        
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name = 'Login' component={LoginScreen} options={{headerShown:false}}/>
                <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation
