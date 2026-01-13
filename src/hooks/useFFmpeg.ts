import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const ffmpegRef = useRef(new FFmpeg());

    const load = useCallback(async () => {
        if (isLoaded) return;
        setIsLoading(true);

        // Fallback to Single-Threaded 0.12.6 via jsDelivr (Often faster/more reliable than unpkg)
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            setMessage(message);
            console.log('[FFmpeg] ' + message);
        });

        try {
            console.log('Loading FFmpeg core from:', baseURL);
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setIsLoaded(true);
            console.log('FFmpeg loaded');
        } catch (error) {
            console.error('Failed to load FFmpeg', error);
            setMessage('Failed to load FFmpeg engine');
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded]);

    const runCommand = useCallback(async (args: string[]) => {
        if (!ffmpegRef.current.loaded) return;
        await ffmpegRef.current.exec(args);
    }, []);

    const writeFile = useCallback(async (fileName: string, fileData: Uint8Array) => {
        if (!ffmpegRef.current.loaded) return;
        await ffmpegRef.current.writeFile(fileName, fileData);
    }, []);

    const readFile = useCallback(async (fileName: string) => {
        if (!ffmpegRef.current.loaded) return null;
        return await ffmpegRef.current.readFile(fileName);
    }, []);

    return { isLoaded, isLoading, message, load, runCommand, writeFile, readFile };
}
