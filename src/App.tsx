import { useState, useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Hub } from './components/hub/Hub';
import { CropPrompt, MixPrompt, SplitPrompt, CompressPrompt } from './components/operations';
import { useFFmpeg } from './hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AnimatePresence } from 'framer-motion';
import type { VideoFile } from './types';

function App() {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [command, setCommand] = useState<string>('');

  // Multi-file state
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const { load, isLoaded, isLoading, message, writeFile, readFile, runCommand, deleteFile } = useFFmpeg();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Core Source Preference
  const [useLocalCore, setUseLocalCore] = useState<boolean>(() => {
    return localStorage.getItem('ffmpeg-source') === 'local';
  });

  useEffect(() => {
    load(useLocalCore);
  }, [load, useLocalCore]);

  const handleToggleSource = () => {
    const newValue = !useLocalCore;
    localStorage.setItem('ffmpeg-source', newValue ? 'local' : 'cdn');
    // Reload to ensure clean WASM init
    window.location.reload();
  };

  const handleOperationSelect = (op: string) => {
    setActiveOperation(prev => prev === op ? null : op);
  };

  const closePrompt = () => setActiveOperation(null);

  const handleFilesDrop = async (droppedFiles: File[]) => {
    const newFiles: VideoFile[] = droppedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'processing'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Auto-select the newly added file (last one in the batch)
    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[newFiles.length - 1].id);
    }

    if (isLoaded) {
      for (const video of newFiles) {
        try {
          const data = await fetchFile(video.file);
          // Use unique filename mapping
          const safeName = `input_${video.id}.mp4`;
          await writeFile(safeName, data);
          console.log(`File ${safeName} written. Generating proxy...`);

          // Generate low-res proxy (480p, ultrafast)
          // We name proxy as proxy_{id}.mp4
          await runCommand([
            '-i', safeName,
            '-vf', 'scale=480:-1',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '30',
            `proxy_${video.id}.mp4`
          ]);

          // Update status to ready
          setFiles(prev => prev.map(f => f.id === video.id ? { ...f, status: 'ready' } : f));
          console.log(`Proxy for ${safeName} complete.`);
        } catch (e) {
          console.error(`Error processing ${video.file.name}:`, e);
          setFiles(prev => prev.map(f => f.id === video.id ? { ...f, status: 'error' } : f));
        }
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
    }
    // Ideally cleanly remove from MEMFS too, but skipping for simplicity now
  };

  const handleSelectFile = (id: string) => {
    setSelectedFileId(id);
  };

  // Get currently selected file object
  const selectedFile = files.find(f => f.id === selectedFileId);

  // Reset preview URL when selected file changes
  useEffect(() => {
    setPreviewUrl(null);
  }, [selectedFileId]);

  const handlePreview = async () => {
    if (!isLoaded) return;

    let previewCommand = command;

    // For single-file operations, we need to point to the specific selected file
    if (activeOperation !== 'mix' && selectedFileId) {
      const inputName = `input_${selectedFileId}.mp4`;
      previewCommand = command
        .replace('input.mp4', inputName);
    }

    // Always output to preview.mp4
    previewCommand = previewCommand.replace('output.mp4', 'preview.mp4');

    console.log('Running preview command:', previewCommand);

    // Split command string into args array
    const args = previewCommand.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/^"|"$/g, '')) || [];
    // remove 'ffmpeg' if present
    if (args[0] === 'ffmpeg') args.shift();

    // FILTER: Remove '-c copy' or '-c:v copy' to ensure we re-encode for preview (avoids broken keyframes)
    // We filter out the flag and its value if they are separate args, or combined
    const safeArgs = args.filter((arg, i) => {
      const prev = args[i - 1];
      if (arg === 'copy' && (prev === '-c' || prev === '-c:v')) return false;
      if (arg === '-c' || arg === '-c:v') {
        const next = args[i + 1];
        if (next === 'copy') return false;
      }
      return true;
    });

    // OPTIMIZATION: Inject '-t 3' (3 seconds) and ensure 'ultrafast' for speed
    // We re-add encoding params to force re-encode
    const outputFile = safeArgs.pop();
    safeArgs.push('-t', '3', '-c:v', 'libx264', '-preset', 'ultrafast');
    if (outputFile) safeArgs.push(outputFile);

    try {
      await runCommand(safeArgs);
      const data = await readFile('preview.mp4');
      if (data) {
        const blob = new Blob([data as any], { type: 'video/mp4' }); // eslint-disable-line @typescript-eslint/no-explicit-any
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (e) {
      console.error('Preview failed:', e);
    }
  };

  const handleProcess = async () => {
    if (!isLoaded) return;
    if (!command.trim()) return;

    let processCommand = command;

    // For single-file operations, replace generic input.mp4 with specific file ID
    if (activeOperation !== 'mix' && selectedFileId) {
      const inputName = `input_${selectedFileId}.mp4`;
      processCommand = command.replace('input.mp4', inputName);
    }

    const uniqueOutputName = `output_${Date.now()}.mp4`;

    // Replace standard 'output.mp4' with unique name to prevent stale file reads
    // We use a global replace to be safe, though usually there's only one
    processCommand = processCommand.replace(/output\.mp4/g, uniqueOutputName);

    const targetFileName = (activeOperation !== 'mix' && selectedFile)
      ? selectedFile.file.name
      : "Multiple Files / Mix";

    console.log(`[FFMPEG] Processing target: ${targetFileName}`);
    console.log(`[FFMPEG] Command: ${processCommand}`);

    const args = processCommand.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/^"|"$/g, '')) || [];
    if (args[0] === 'ffmpeg') args.shift();

    try {
      await runCommand(args);

      // Read the output file
      const data = await readFile(uniqueOutputName);
      if (data) {
        const blob = new Blob([data as any], { type: 'video/mp4' }); // eslint-disable-line @typescript-eslint/no-explicit-any
        const url = URL.createObjectURL(blob);

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${new Date().getTime()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Download started');

        // Cleanup the unique file immediately
        await deleteFile(uniqueOutputName);
      } else {
        console.error('No output file generated. Command likely failed.');
        // If it failed, we don't download anything. Perfect.
      }
    } catch (e) {
      console.error('Processing failed:', e);
    }
  };

  return (
    <DashboardLayout
      command={command}
      activeOperation={activeOperation}
      onSelectOperation={handleOperationSelect}
      isConnected={isLoaded}
      isProcessing={isLoading}
      statusMessage={message}
      selectedFilename={selectedFile?.file.name}
      onCommandChange={setCommand}
      onRun={handleProcess}
      useLocalCore={useLocalCore}
      onToggleSource={handleToggleSource}
      onFilesDrop={handleFilesDrop}
    >
      <Hub
        files={files}
        onFilesDrop={handleFilesDrop}
        onRemoveFile={handleRemoveFile}
        selectedFileId={selectedFileId}
        onSelectFile={handleSelectFile}
      />

      {/* Operation Prompts */}
      <AnimatePresence>
        {activeOperation === 'crop' && (
          <CropPrompt
            isOpen={true}
            onClose={closePrompt}
            onUpdateCommand={setCommand}
            onPreview={handlePreview}
            previewUrl={previewUrl}
            onProcess={handleProcess}
          />
        )}
        {activeOperation === 'mix' && (
          <MixPrompt
            isOpen={true}
            onClose={closePrompt}
            onUpdateCommand={setCommand}
            files={files}
            onPreview={handlePreview}
            previewUrl={previewUrl}
            onProcess={handleProcess}
          />
        )}
        {activeOperation === 'split' && (
          <SplitPrompt
            isOpen={true}
            onClose={closePrompt}
            onUpdateCommand={setCommand}
            onPreview={handlePreview}
            previewUrl={previewUrl}
            onProcess={handleProcess}
          />
        )}
        {activeOperation === 'compress' && (
          <CompressPrompt
            isOpen={true}
            onClose={closePrompt}
            onUpdateCommand={setCommand}
            onPreview={handlePreview}
            previewUrl={previewUrl}
            onProcess={handleProcess}
          />
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}

export default App;
