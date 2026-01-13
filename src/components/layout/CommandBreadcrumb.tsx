import { Terminal, Play } from 'lucide-react';

interface CommandBreadcrumbProps {
    command: string;
    onCommandChange?: (cmd: string) => void;
    onRun?: () => void;
}

export function CommandBreadcrumb({ command, onCommandChange, onRun }: CommandBreadcrumbProps) {
    return (
        <div className="h-14 border-t border-white/10 bg-neutral-950 flex items-center px-6 gap-4 z-20 shrink-0 shadow-[0_-1px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 text-neutral-400 select-none">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-mono font-medium tracking-wider uppercase">Command</span>
            </div>

            <div className="flex-1 relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-green-500/50 select-none pointer-events-none">$</span>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => onCommandChange?.(e.target.value)}
                    placeholder="ffmpeg -i input.mp4 output.mp4"
                    className="w-full bg-black/30 rounded-lg pl-8 pr-12 py-1.5 font-mono text-xs sm:text-sm text-green-400 border border-white/5 focus:border-green-500/50 focus:bg-black/50 focus:outline-none transition-all shadow-inner placeholder:text-white/10"
                    spellCheck={false}
                />
                <button
                    onClick={onRun}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-green-500 text-neutral-500 hover:text-black transition-colors"
                    title="Run Command"
                >
                    <Play className="w-3 h-3 fill-current" />
                </button>
            </div>
        </div>
    );
}
