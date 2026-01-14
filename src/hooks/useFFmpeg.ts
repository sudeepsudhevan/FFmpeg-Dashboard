import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const ffmpegRef = useRef(new FFmpeg());

    const load = useCallback(async (useLocalCore: boolean = false) => {
        if (isLoaded) return;
        setIsLoading(true);

        // Choose base URL based on preference
        const baseURL = useLocalCore
            ? `${window.location.origin}/ffmpeg`
            : 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';

        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            setMessage(message);
            console.log('[FFmpeg] ' + message);
        });

        try {
            console.log(`Loading FFmpeg core from: ${useLocalCore ? 'LOCAL' : 'CDN'} (${baseURL})`);
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

    const deleteFile = useCallback(async (fileName: string) => {
        if (!ffmpegRef.current.loaded) return;
        try {
            await ffmpegRef.current.deleteFile(fileName);
        } catch (e) {
            // Ignore error if file doesn't exist
        }
    }, []);

    return { isLoaded, isLoading, message, load, runCommand, writeFile, readFile, deleteFile };
}
