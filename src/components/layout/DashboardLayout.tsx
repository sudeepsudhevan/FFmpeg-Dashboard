import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { CommandBreadcrumb } from './CommandBreadcrumb';

interface DashboardLayoutProps {
    children: ReactNode;
    command: string;
    activeOperation: string | null;
    onSelectOperation: (op: string) => void;
    isConnected: boolean;
    isProcessing: boolean;
    statusMessage: string;
    selectedFilename?: string;
    onCommandChange?: (cmd: string) => void;
    onRun?: () => void;
    useLocalCore?: boolean;
    onToggleSource?: () => void;
    onFilesDrop?: (files: File[]) => void;
}

export function DashboardLayout({
    children,
    command,
    activeOperation,
    onSelectOperation,
    isConnected,
    isProcessing,
    statusMessage,
    selectedFilename,
    onCommandChange,
    onRun,
    useLocalCore,
    onToggleSource,
    onFilesDrop
}: DashboardLayoutProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onFilesDrop && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
            if (droppedFiles.length > 0) {
                onFilesDrop(droppedFiles);
            }
        }
    };

    return (
        <div
            className="flex flex-col h-screen w-full bg-neutral-950 text-white overflow-hidden font-sans selection:bg-purple-500/30"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute inset-0 bg-transparent opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none">
                    {/* Noise texture can be added via CSS or image later if needed, kept simple for now */}
                </div>
            </div>

            {/* Header Bar */}
            <div className="relative z-20 flex items-center justify-between w-full px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
                {/* Left Status Indicator */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-xs font-medium tracking-wider text-green-400">FFMPEG CORE ONLINE</span>
                    </div>

                    {/* Source Toggle */}
                    <button
                        onClick={onToggleSource}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/20 hover:bg-white/10 transition-colors cursor-pointer group"
                        title="Click to switch FFmpeg Source (Reloads page)"
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${useLocalCore ? 'bg-blue-400' : 'bg-purple-400'}`} />
                        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 group-hover:text-white">
                            SRC: {useLocalCore ? 'LOCAL' : 'CDN'}
                        </span>
                    </button>
                </div>

                {/* Center Title / Status */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="flex flex-col items-center">
                        <h1 className="text-sm font-bold tracking-[0.2em] text-white/90">FFMPEG DASHBOARD</h1>
                        {selectedFilename && (
                            <span className="text-[10px] text-green-500 font-mono mt-0.5 max-w-[200px] truncate">
                                {selectedFilename}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Status Indicator */}
                {(!isConnected || isProcessing) && (
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur text-xs text-neutral-400 px-4 py-2 rounded-full border border-white/10 pointer-events-none shadow-xl">
                        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                        <span>{isProcessing ? 'Processing... ' + statusMessage : statusMessage || 'FFmpeg Offline'}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 z-10 overflow-hidden relative">
                <Sidebar
                    activeOperation={activeOperation}
                    onSelectOperation={onSelectOperation}
                />

                <main className="flex-1 relative overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>

            <CommandBreadcrumb
                command={command}
                onCommandChange={onCommandChange}
                onRun={onRun}
            />
        </div>
    );
}
