import { X, FileVideo } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VideoFile } from '../../types';
import { cn } from '../../lib/utils';

interface VideoNodeProps {
    video: VideoFile;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: (e: React.MouseEvent) => void;
}

export function VideoNode({ video, isSelected, onSelect, onRemove }: VideoNodeProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onSelect}
            className={cn(
                "relative group cursor-pointer rounded-xl overflow-hidden border transition-all duration-200",
                "bg-neutral-900/50 backdrop-blur-sm",
                isSelected
                    ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] ring-1 ring-green-500/30"
                    : "border-white/10 hover:border-white/20 hover:bg-neutral-800/50"
            )}
        >
            <div className="p-4 flex flex-col items-center gap-3 text-center">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-green-500/20 text-green-400" : "bg-white/5 text-neutral-400 group-hover:text-white"
                )}>
                    <FileVideo className="w-6 h-6" />
                </div>

                <div className="space-y-1 w-full overflow-hidden">
                    <p className={cn("text-sm font-medium truncate w-full", isSelected ? "text-green-100" : "text-neutral-200")}>
                        {video.file.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                        {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                        video.status === 'processing' ? "bg-yellow-500 animate-pulse" :
                            video.status === 'ready' ? "bg-green-500" :
                                video.status === 'error' ? "bg-red-500" : "bg-neutral-600"
                    )} />
                    <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                        {video.status}
                    </span>
                </div>
            </div>

            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}
