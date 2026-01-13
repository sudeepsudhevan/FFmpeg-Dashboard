import { useState, useEffect } from 'react';
import { OperationPrompt } from './OperationPrompt';

interface SplitPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateCommand: (cmd: string) => void;
    onPreview: () => void;
    previewUrl: string | null;
    onProcess: () => void;
}

export function SplitPrompt({ isOpen, onClose, onUpdateCommand, onPreview, previewUrl, onProcess }: SplitPromptProps) {
    const [start, setStart] = useState("00:00:00");
    const [end, setEnd] = useState("00:00:10");

    useEffect(() => {
        if (isOpen) {
            const cmd = `ffmpeg -i input.mp4 -ss ${start} -to ${end} -c copy output.mp4`;
            onUpdateCommand(cmd);
        }
    }, [start, end, isOpen, onUpdateCommand]);

    return (
        <OperationPrompt title="Trim / Split" isOpen={isOpen} onClose={onClose} onPreview={onPreview}>
            <div className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Start Time</label>
                        <input
                            type="text"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-green-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">End Time</label>
                        <input
                            type="text"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-green-500/50"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onPreview} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all">
                        Apply to Preview
                    </button>
                    <button onClick={onProcess} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors">
                        Trim Video
                    </button>
                </div>
            </div>
        </OperationPrompt>
    );
}
