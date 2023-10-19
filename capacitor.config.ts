import { CapacitorConfig } from '@capacitor/cli';
// https://capacitorjs.com/docs/guides/environment-specific-configurations
let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
    appId: 'danyavol.moneysplitter',
    appName: 'Money Splitter',
    webDir: 'www',
    bundledWebRuntime: false,
    android: {
       buildOptions: {
          keystorePath: '/Users/daniil/keystores/money-splitter-keystore.jks',
          keystoreAlias: 'money-splitter',
       }
    }
};

switch (process.env['NODE_ENV']) {
    case "dev":
        config = {
            ...baseConfig,
            android: {
                ...baseConfig.android,
                flavor: "dev"
            }
        };
        break;
    default:
        config = {
            ...baseConfig,
            android: {
                ...baseConfig.android,
                flavor: "prod"
            }
        };
}

export default config;
