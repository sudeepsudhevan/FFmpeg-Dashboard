import { Scissors, Layers, Crop, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    onSelectOperation: (op: string) => void;
    activeOperation: string | null;
}

const operations = [
    { id: 'mix', label: 'Mix', icon: Layers, color: 'text-blue-400' },
    { id: 'split', label: 'Split', icon: Scissors, color: 'text-red-400' },
    { id: 'crop', label: 'Crop', icon: Crop, color: 'text-green-400' },
    { id: 'compress', label: 'Compress', icon: Minimize2, color: 'text-yellow-400' },
];

export function Sidebar({ onSelectOperation, activeOperation }: SidebarProps) {
    return (
        <div className="w-20 h-full border-r border-white/5 bg-black/40 backdrop-blur-md flex flex-col items-center py-8 gap-6 z-20 shrink-0">
            <div className="mb-4">
                {/* Logo or Brand */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg flex items-center justify-center font-bold text-white cursor-default select-none">
                    AG
                </div>
            </div>

            {operations.map((op) => (
                <button
                    key={op.id}
                    onClick={() => onSelectOperation(op.id)}
                    className={cn(
                        "group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                        activeOperation === op.id
                            ? "bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105"
                            : "hover:bg-white/5 hover:scale-110"
                    )}
                >
                    <op.icon
                        className={cn(
                            "w-6 h-6 transition-colors duration-300",
                            activeOperation === op.id ? "text-white" : "text-neutral-400 group-hover:text-white"
                        )}
                    />

                    {/* Tooltip */}
                    <div className="absolute left-14 px-3 py-1 bg-neutral-900 border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-xl z-50 shadow-xl translate-x-2 group-hover:translate-x-0 duration-200">
                        {op.label}
                    </div>
                </button>
            ))}
        </div>
    );
}
