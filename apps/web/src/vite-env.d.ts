/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_ADSENSE_CLIENT?: string;
    readonly VITE_ADSENSE_SLOT_SIDEBAR?: string;
    readonly VITE_ADSENSE_SLOT_LIBRARY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
