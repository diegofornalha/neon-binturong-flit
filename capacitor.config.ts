import 'dotenv/config';
import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL || '';

const config: CapacitorConfig = {
  appId: 'com.carmensdr.dashboard',
  appName: 'Carmen SDR',
  webDir: '.next',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
        allowNavigation: [
          'localhost',
          '127.0.0.1',
          '10.0.2.2',
          '192.168.0.0/16',
          'app.carmensdr.com',
          '*.supabase.co',
          'graph.facebook.com',
          'maps.googleapis.com',
        ],
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b",
      showSpinner: false
    }
  }
};

export default config;