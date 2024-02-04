import { CapacitorConfig } from '@capacitor/cli';
// https://capacitorjs.com/docs/guides/environment-specific-configurations
let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
    appId: 'danyavol.moneysplitter',
    appName: 'Money Splitter',
    webDir: 'www',
    android: {
       buildOptions: {
          keystorePath: 'C:\\Users\\Daniil\\keystores\\upload-keystore.jks',
          keystoreAlias: 'money-splitter',
       }
    },
    plugins: {
        // Refer to this video to add auth for IOS https://www.youtube.com/watch?v=GwtpoWZ_78E
        GoogleAuth: {
            scopes: ["profile", "email"],
            serverClientId: "993917050771-j3l0bldigd5b0coug08q1jhlsegaitc2.apps.googleusercontent.com",
            forceCodeForRefreshToken: true
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
