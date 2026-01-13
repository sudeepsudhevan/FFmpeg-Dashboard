import { useState, useEffect } from 'react';
import { OperationPrompt } from './OperationPrompt';
import type { VideoFile } from '../../types';
import { cn } from '../../lib/utils';

interface MixPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateCommand: (cmd: string) => void;
    files: VideoFile[];
    onPreview: () => void;
    previewUrl: string | null;
    onProcess: () => void;
}

export function MixPrompt({ isOpen, onClose, onUpdateCommand, files, onPreview, previewUrl, onProcess }: MixPromptProps) {
    // Track selected file IDs in order
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleFile = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(fid => fid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    useEffect(() => {
        if (isOpen && selectedIds.length >= 2) {
            // Generate concat command
            // -i input1 -i input2 ... -filter_complex "[0:v][0:a][1:v][1:a]concat=n=N:v=1:a=1[v][a]" -map "[v]" -map "[a]" output.mp4

            const inputs = selectedIds.map(id => `-i input_${id}.mp4`).join(' ');

            let filter = "";
            for (let i = 0; i < selectedIds.length; i++) {
                filter += `[${i}:v][${i}:a]`;
            }
            filter += `concat=n=${selectedIds.length}:v=1:a=1[v][a]`;

            const cmd = `ffmpeg ${inputs} -filter_complex "${filter}" -map "[v]" -map "[a]" output.mp4`;
            onUpdateCommand(cmd);
        } else if (isOpen) {
            onUpdateCommand(""); // Clear if not enough files
        }
    }, [selectedIds, isOpen, onUpdateCommand]);

    return (
        <OperationPrompt title="Mix / Concat" isOpen={isOpen} onClose={onClose} onPreview={onPreview}>
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

                <div className="space-y-3">
                    <p className="text-sm text-neutral-400 font-medium">Select available clips to concat (in order):</p>
                    {files.length === 0 && (
                        <p className="text-xs text-red-400">No files available. Drop videos in the Hub first.</p>
                    )}
                    <div className="grid gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {files.filter(f => f.status === 'ready' || f.status === 'processing').map((file) => {
                            const isSelected = selectedIds.includes(file.id);
                            const orderIndex = selectedIds.indexOf(file.id);

                            return (
                                <button
                                    key={file.id}
                                    onClick={() => toggleFile(file.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                        isSelected
                                            ? "bg-green-500/10 border-green-500/30"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors",
                                        isSelected ? "bg-green-500 text-black" : "bg-white/10 text-neutral-500"
                                    )}>
                                        {isSelected ? orderIndex + 1 : ""}
                                    </div>
                                    <span className={cn("text-sm truncate flex-1", isSelected ? "text-white" : "text-neutral-400")}>
                                        {file.file.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Concat Status / Hint */}
                {selectedIds.length > 1 && (
                    <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 py-2 bg-white/5 rounded-lg border border-dashed border-white/10">
                        <span>{selectedIds.length} clips selected for concatenation</span>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onPreview}
                        disabled={selectedIds.length < 2}
                        className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-semibold rounded-xl shadow-lg shadow-green-900/20 transition-all"
                    >
                        Apply to Preview
                    </button>
                    <button onClick={onProcess} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors">
                        Combine Clips
                    </button>
                </div>
            </div>
        </OperationPrompt>
    );
}
