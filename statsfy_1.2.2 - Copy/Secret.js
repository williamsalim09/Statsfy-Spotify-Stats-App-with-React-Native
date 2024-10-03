import * as AuthSession from 'expo-auth-session';


export const spotifyCredentials = {
    clientId: 'd92a9581e96c46b28f331ad848eb6306',
    clientSecret: '6ec12e1ed0004aaab9924ce7ed4ece74',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }) //for local development
    // redirectUri: 'exp://192.168.86.95:8081'
    // redirectUri: 'exp://u.expo.dev/933fd9c0-1666-11e7-afca-d980795c5824?runtime-version=exposdk%3A51.0.0&channel-name=production&snack=%40pikapikaa%2Fspotify_1-2&snack-channel=yK0MSyLNf7' // snacks Uri

}