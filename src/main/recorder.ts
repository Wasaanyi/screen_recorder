import { getControlWindow } from './windows';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { RecordingSettings, RecordingState } from '../shared/types';
import { processVideoWithFFmpeg } from './ffmpeg';
import { join } from 'path';
import { existsSync, mkdirSync, createWriteStream, WriteStream } from 'fs';

let recordingState: RecordingState = {
  isRecording: false,
  isPaused: false,
  duration: 0,
  outputFile: null
};

let recordingInterval: NodeJS.Timeout | null = null;
let currentSourceId: string | null = null;
let currentSettings: RecordingSettings | null = null;
let fileStream: WriteStream | null = null;
let recordedChunks: Buffer[] = [];

function notifyStateChanged() {
  const controlWindow = getControlWindow();
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(IPC_CHANNELS.RECORDING_STATE_CHANGED, recordingState);
  }
}

function notifyError(error: string) {
  const controlWindow = getControlWindow();
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(IPC_CHANNELS.RECORDING_ERROR, error);
  }
}

export async function startRecording(sourceId: string, settings: RecordingSettings): Promise<void> {
  if (recordingState.isRecording) {
    throw new Error('Recording already in progress');
  }

  try {
    // Ensure output directory exists
    if (!existsSync(settings.outputPath)) {
      mkdirSync(settings.outputPath, { recursive: true });
    }

    // Generate output filename (use webm for MediaRecorder, will convert to mp4 later if needed)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempOutputFile = join(settings.outputPath, `recording-${timestamp}.webm`);
    const finalOutputFile = join(settings.outputPath, `recording-${timestamp}.mp4`);

    currentSourceId = sourceId;
    currentSettings = settings;
    recordedChunks = []; // Reset chunks array

    // Create write stream for the video file
    fileStream = createWriteStream(tempOutputFile);

    recordingState = {
      isRecording: true,
      isPaused: false,
      duration: 0,
      outputFile: finalOutputFile
    };

    // Start duration counter
    recordingInterval = setInterval(() => {
      if (!recordingState.isPaused) {
        recordingState.duration++;
        notifyStateChanged();
      }
    }, 1000);

    // Tell the control window to start MediaRecorder with the source
    const controlWindow = getControlWindow();
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.webContents.send(IPC_CHANNELS.START_MEDIA_RECORDER, {
        sourceId,
        settings
      });
    }

    notifyStateChanged();

    console.log('Recording started:', { sourceId, tempOutputFile, finalOutputFile });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    notifyError(errorMessage);
    throw error;
  }
}

export async function stopRecording(): Promise<string> {
  if (!recordingState.isRecording) {
    throw new Error('No recording in progress');
  }

  try {
    // Tell the renderer to stop MediaRecorder
    const controlWindow = getControlWindow();
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.webContents.send(IPC_CHANNELS.STOP_MEDIA_RECORDER);
    }

    // Stop duration counter
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }

    // Wait a bit for final chunks to arrive from renderer
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close the file stream and ensure all data is flushed
    if (fileStream) {
      await new Promise<void>((resolve, reject) => {
        fileStream!.end(() => {
          console.log('File stream closed successfully');
          resolve();
        });
        fileStream!.on('error', (err) => {
          console.error('Error closing file stream:', err);
          reject(err);
        });
      });
      fileStream = null;
    }

    const finalOutputFile = recordingState.outputFile!;
    const tempOutputFile = finalOutputFile.replace('.mp4', '.webm');

    // Wait additional time to ensure file system has flushed all data
    console.log('Waiting for file system to flush data...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the WebM file exists and has content
    if (!existsSync(tempOutputFile)) {
      throw new Error(`Recording file was not created: ${tempOutputFile}`);
    }

    const stats = await import('fs').then(fs => fs.promises.stat(tempOutputFile));
    console.log(`WebM file written: ${tempOutputFile}`);
    console.log(`File size: ${stats.size} bytes`);

    if (stats.size === 0) {
      throw new Error('Recording file is empty (0 bytes)');
    }

    if (stats.size < 1000) {
      throw new Error(`Recording file too small (${stats.size} bytes), likely corrupted`);
    }

    // Optional: Convert webm to mp4 using FFmpeg for better compatibility
    if (currentSettings) {
      try {
        console.log('Converting video from webm to mp4...');
        await processVideoWithFFmpeg(tempOutputFile, finalOutputFile, currentSettings);
        console.log('Video conversion complete');

        // Optionally delete the WebM file after successful conversion
        // Uncomment the following lines if you want to remove the temporary WebM file:
        // const fs = await import('fs');
        // await fs.promises.unlink(tempOutputFile);
        // console.log('Temporary WebM file deleted');
      } catch (ffmpegError) {
        console.warn('FFmpeg conversion failed, using webm file:', ffmpegError);
        // If conversion fails, use the webm file directly
        const webmOutput = finalOutputFile.replace('.mp4', '.webm');
        recordingState.outputFile = webmOutput;
      }
    }

    const outputFile = recordingState.outputFile!;

    recordingState = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      outputFile: null
    };

    notifyStateChanged();

    currentSourceId = null;
    currentSettings = null;
    recordedChunks = [];

    return outputFile;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    notifyError(errorMessage);
    throw error;
  }
}

export async function pauseRecording(): Promise<void> {
  if (!recordingState.isRecording) {
    throw new Error('No recording in progress');
  }

  // Tell the renderer to pause MediaRecorder
  const controlWindow = getControlWindow();
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(IPC_CHANNELS.PAUSE_MEDIA_RECORDER);
  }

  recordingState.isPaused = true;
  notifyStateChanged();
}

export async function resumeRecording(): Promise<void> {
  if (!recordingState.isRecording) {
    throw new Error('No recording in progress');
  }

  // Tell the renderer to resume MediaRecorder
  const controlWindow = getControlWindow();
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(IPC_CHANNELS.RESUME_MEDIA_RECORDER);
  }

  recordingState.isPaused = false;
  notifyStateChanged();
}

/**
 * Handle video chunks received from the renderer process
 * Chunks are sent from MediaRecorder in the renderer as Uint8Array
 * (Uint8Array is used instead of ArrayBuffer for proper IPC serialization)
 */
export function handleRecordingChunk(chunk: Uint8Array | ArrayBuffer): void {
  if (!recordingState.isRecording || !fileStream) {
    console.warn('Received chunk but not recording or no file stream');
    return;
  }

  try {
    // Convert Uint8Array or ArrayBuffer to Buffer
    const buffer = Buffer.from(chunk);

    console.log(`Writing chunk: ${buffer.byteLength} bytes`);

    // Write chunk to file stream
    fileStream.write(buffer, (error) => {
      if (error) {
        console.error('Error writing chunk to file:', error);
        notifyError(`Error writing video chunk: ${error.message}`);
      }
    });

    // Also store in memory for potential later use
    recordedChunks.push(buffer);
  } catch (error) {
    console.error('Error handling recording chunk:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    notifyError(`Error handling video chunk: ${errorMessage}`);
  }
}

export function getRecordingState(): RecordingState {
  return { ...recordingState };
}
