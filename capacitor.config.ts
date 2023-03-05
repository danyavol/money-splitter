import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'danyavol.moneysplitter',
    appName: 'Money Splitter',
    webDir: 'www',
    bundledWebRuntime: false
,
    android: {
       buildOptions: {
          keystorePath: '/Users/daniil/keystores/money-splitter-keystore.jks',
          keystoreAlias: 'money-splitter',
       }
    }
  };

export default config;
