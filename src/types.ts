export interface VideoFile {
    id: string;
    file: File;
    preview?: string; // URL for thumbnail or proxy
    status: 'idle' | 'processing' | 'ready' | 'error';
    proxyUrl?: string; // Path to generated proxy
}
