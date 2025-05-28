declare module 'next-pwa' {
    import { NextConfig } from 'next';

    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: Array<{
            urlPattern: RegExp | string;
            handler: string;
            method?: string;
            options?: {
                cacheName?: string;
                expiration?: {
                    maxEntries?: number;
                    maxAgeSeconds?: number;
                };
                networkTimeoutSeconds?: number;
                cachableResponse?: {
                    statuses?: number[];
                    headers?: {
                        [key: string]: string;
                    };
                };
            };
        }>;
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
    }

    function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
    export default withPWA;
} 