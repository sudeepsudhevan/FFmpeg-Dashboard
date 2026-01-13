import { useState, useEffect } from 'react';
import { OperationPrompt } from './OperationPrompt';

interface CompressPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateCommand: (cmd: string) => void;
    onPreview: () => void;
    previewUrl: string | null;
    onProcess: () => void;
}

export function CompressPrompt({ isOpen, onClose, onUpdateCommand, onPreview, previewUrl, onProcess }: CompressPromptProps) {
    const [crf, setCrf] = useState(23);
    const [preset, setPreset] = useState('medium');

    useEffect(() => {
        if (isOpen) {
            const cmd = `ffmpeg -i input.mp4 -c:v libx264 -crf ${crf} -preset ${preset} output.mp4`;
            onUpdateCommand(cmd);
        }
    }, [crf, preset, isOpen, onUpdateCommand]);

    return (
        <OperationPrompt title="Compression Settings" isOpen={isOpen} onClose={onClose} onPreview={onPreview}>
            <div className="space-y-8">
                {/* Visual Preview Area */}
                <div className="w-full aspect-video bg-neutral-800 rounded-lg relative overflow-hidden border border-white/10 group">
                    {previewUrl ? (
                        <video
                            src={previewUrl}
                            autoPlay
                            loop
                            controls={false}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
                            [ Preview will appear here ]
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Quality (CRF)</span>
                        <span className="text-white font-mono">{crf}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="51"
                        value={crf}
                        onChange={(e) => setCrf(Number(e.target.value))}
                        className="w-full accent-green-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-600 px-1">
                        <span>Lossless (0)</span>
                        <span>Standard (23)</span>
                        <span>Low Quality (51)</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Preset (Speed vs Compression)</label>
                    <select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50"
                    >
                        {['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'].map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 flex gap-3">
                    <button onClick={onPreview} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all">
                        Apply to Preview
                    </button>
                    <button onClick={onProcess} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors">
                        Process Video
                    </button>
                </div>
            </div>
        </OperationPrompt>
    );
}
