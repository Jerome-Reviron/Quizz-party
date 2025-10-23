// FIX: Removed reference to "vite/client" as it could not be found.
// The necessary types for import.meta.env are defined below.

interface ImportMetaEnv {
    readonly VITE_JSONBIN_API_KEY: string;
    readonly VITE_JSONBIN_BIN_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
