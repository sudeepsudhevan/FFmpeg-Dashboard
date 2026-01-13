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

  const { load, isLoaded, isLoading, message, writeFile, readFile, runCommand } = useFFmpeg();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

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

    // Auto-select first file if none selected
    if (!selectedFileId && newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
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

    // OPTIMIZATION: Inject '-t 3' (3 seconds) and ensure 'ultrafast' for speed
    const outputFile = args.pop();
    args.push('-t', '3', '-preset', 'ultrafast');
    if (outputFile) args.push(outputFile);

    try {
      await runCommand(args);
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

    console.log('Running process command:', processCommand);

    const args = processCommand.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/^"|"$/g, '')) || [];
    if (args[0] === 'ffmpeg') args.shift();

    try {
      await runCommand(args);

      // Read the output file (assumed to be output.mp4 based on prompts)
      const data = await readFile('output.mp4');
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
