import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film } from 'lucide-react';
import { cn } from '../../lib/utils';
import { VideoNode } from './VideoNode';
import type { VideoFile } from '../../types';

interface HubProps {
    files: VideoFile[];
    onFilesDrop: (files: File[]) => void;
    onRemoveFile: (id: string) => void;
    selectedFileId: string | null;
    onSelectFile: (id: string) => void;
}

export function Hub({ files, onFilesDrop, onRemoveFile, selectedFileId, onSelectFile }: HubProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
            if (droppedFiles.length > 0) {
                onFilesDrop(droppedFiles);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('video/'));
            if (selectedFiles.length > 0) {
                onFilesDrop(selectedFiles);
            }
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col min-h-0 bg-neutral-950/50">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Project Hub</h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        {files.length > 0 ? `${files.length} active files` : 'Drop videos here to begin'}
                    </p>
                </div>
            </div>

            <div
                className={cn(
                    "flex-1 relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-y-auto custom-scrollbar p-6",
                    isDragging ? "border-green-500/50 bg-green-500/5" : "border-white/5 bg-neutral-900/20 hover:border-white/10"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                    // Clicking background deselects? Maybe not for now to avoid accidental deselection
                    if (e.target === e.currentTarget) {
                        // onSelectFile(null); // Optional: deselect on background click
                    }
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    multiple // Enable multiple files
                    onChange={handleFileInput}
                />

                <AnimatePresence mode="popLayout">
                    {files.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                            layout
                        >
                            {files.map((video) => (
                                <VideoNode
                                    key={video.id}
                                    video={video}
                                    onRemove={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(video.id);
                                    }}
                                    isSelected={selectedFileId === video.id}
                                    onSelect={() => onSelectFile(video.id)}
                                />
                            ))}

                            {/* Add More Button */}
                            <motion.button
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-xl border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-white transition-all group"
                            >
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider">Add Video</span>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform duration-500",
                                isDragging ? "scale-110 bg-green-500/20 text-green-400" : "bg-white/5 text-neutral-600"
                            )}>
                                {isDragging ? (
                                    <Upload className="w-10 h-10 animate-bounce" />
                                ) : (
                                    <Film className="w-10 h-10" />
                                )}
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                {isDragging ? 'Drop to Upload' : 'Drag video files here'}
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-xs text-center leading-relaxed">
                                Support for MP4, MOV, MKV. <br />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-green-500 hover:text-green-400 font-medium hover:underline pointer-events-auto mt-2"
                                >
                                    Click to browse
                                </button>
                            </p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Grid Pattern Overlay (Decorative) */}
                {!files.length && (
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                )}
            </div>
        </div>
    );
}
