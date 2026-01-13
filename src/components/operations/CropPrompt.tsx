import { useState, useEffect } from 'react';
import { OperationPrompt } from './OperationPrompt';

interface CropPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateCommand: (cmd: string) => void;
    onPreview: () => void;
    previewUrl: string | null;
    onProcess: () => void;
}

export function CropPrompt({ isOpen, onClose, onUpdateCommand, onPreview, previewUrl, onProcess }: CropPromptProps) {
    const [width, setWidth] = useState(1280);
    const [height, setHeight] = useState(720);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const cmd = `ffmpeg -i input.mp4 -vf "crop=${width}:${height}:${x}:${y}" output.mp4`;
            onUpdateCommand(cmd);
        }
    }, [width, height, x, y, isOpen, onUpdateCommand]);

    return (
        <OperationPrompt title="Spatial Crop" isOpen={isOpen} onClose={onClose} onPreview={onPreview}>
            <div className="space-y-6">
                {/* Visual Selector / Preview Area */}
                <div className="w-full aspect-video bg-neutral-800 rounded-lg relative overflow-hidden border border-white/10 group">
                    {previewUrl ? (
                        <video
                            src={previewUrl}
                            autoPlay
                            loop
                            controls={false} // clean look
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
                            [ Interactive Canvas Overlay ]
                        </div>
                    )}

                    {/* Mock Crop Box - Only show if no preview? Or overlay on top? */}
                    {/* Providing overlay on top for context even during preview might be nice, or hiding it. Let's keep it for now. */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)] pointer-events-none">
                        <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 w-2 h-2 bg-green-400 rounded-full" />
                        <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-2 h-2 bg-green-400 rounded-full" />
                        <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 w-2 h-2 bg-green-400 rounded-full" />
                        <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Width (px)</label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Height (px)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">X Offset</label>
                        <input
                            type="number"
                            value={x}
                            onChange={(e) => setX(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Y Offset</label>
                        <input
                            type="number"
                            value={y}
                            onChange={(e) => setY(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Presets */}
                <div className="flex gap-2 pt-2">
                    {['16:9', '9:16', '1:1', '4:3'].map(ratio => (
                        <button key={ratio} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium text-neutral-300 border border-white/5 transition-colors">
                            {ratio}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                        onClick={onPreview}
                        className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all"
                    >
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
