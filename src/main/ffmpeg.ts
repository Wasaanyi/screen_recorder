import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import type { RecordingSettings, TrimSettings } from '../shared/types';
import { VIDEO_QUALITY_PRESETS } from '../shared/constants';
import { existsSync, statSync, readSync, openSync, closeSync } from 'fs';

// Get binary path - handle both development and packaged app
function getBinaryPath(staticPath: string | null, binaryName: string): string | null {
  // In development, use static path directly
  if (staticPath && existsSync(staticPath)) {
    console.log(`Using ${binaryName} path:`, staticPath);
    return staticPath;
  }

  // In packaged app, path needs adjustment
  if (staticPath) {
    const unpackedPath = staticPath.replace('app.asar', 'app.asar.unpacked');
    if (existsSync(unpackedPath)) {
      console.log(`Using unpacked ${binaryName} path:`, unpackedPath);
      return unpackedPath;
    }
  }

  console.error(`${binaryName} not found at:`, staticPath);
  return null;
}

// Set FFmpeg path
const ffmpegPath = getBinaryPath(ffmpegStatic, 'ffmpeg');
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  console.log('FFmpeg path set successfully');
} else {
  console.error('Could not find FFmpeg binary');
}

// Set FFprobe path
const ffprobePath = getBinaryPath(ffprobeStatic.path, 'ffprobe');
if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
  console.log('FFprobe path set successfully');
} else {
  console.error('Could not find FFprobe binary');
}

/**
 * Validates that the input file is a valid WebM file
 */
function validateWebMFile(inputPath: string): void {
  // Check file exists
  if (!existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  // Check file size
  const stats = statSync(inputPath);
  console.log(`Input file size: ${stats.size} bytes`);

  if (stats.size === 0) {
    throw new Error('Input file is empty (0 bytes)');
  }

  if (stats.size < 1000) {
    throw new Error(`Input file too small (${stats.size} bytes), likely corrupted`);
  }

  // Check WebM header (EBML magic bytes: 0x1A45DFA3)
  try {
    const fd = openSync(inputPath, 'r');
    const header = Buffer.alloc(4);
    readSync(fd, header, 0, 4, 0);
    closeSync(fd);

    const hexHeader = header.toString('hex');
    console.log(`File header (hex): ${hexHeader}`);

    if (hexHeader !== '1a45dfa3') {
      console.warn(`Warning: File does not start with WebM/EBML header. Expected: 1a45dfa3, Got: ${hexHeader}`);
    }
  } catch (error) {
    console.error('Error reading file header:', error);
    throw new Error(`Cannot read file header: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Probes the file to validate it's a valid video file
 */
function probeInputFile(inputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        reject(new Error(`Invalid or corrupted input file: ${err.message}`));
        return;
      }

      // Log metadata for debugging
      console.log('Input file format:', metadata.format?.format_name);
      console.log('Input file duration:', metadata.format?.duration, 'seconds');
      console.log('Input file size:', metadata.format?.size, 'bytes');

      if (metadata.streams) {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        if (videoStream) {
          console.log('Video codec:', videoStream.codec_name);
          console.log('Video resolution:', `${videoStream.width}x${videoStream.height}`);
        } else {
          console.warn('Warning: No video stream found in input file');
        }

        if (audioStream) {
          console.log('Audio codec:', audioStream.codec_name);
        }
      }

      resolve();
    });
  });
}

export async function processVideoWithFFmpeg(
  inputPath: string,
  outputPath: string,
  settings: RecordingSettings
): Promise<void> {
  // Validate input file before processing
  console.log('Validating input file:', inputPath);
  validateWebMFile(inputPath);

  // Probe file to ensure it's valid
  console.log('Probing input file with FFprobe...');
  await probeInputFile(inputPath);

  console.log('Input file validation passed, starting conversion...');

  return new Promise((resolve, reject) => {
    const preset = VIDEO_QUALITY_PRESETS[settings.videoQuality];

    const command = ffmpeg(inputPath)
      .videoBitrate(preset.bitrate)
      .fps(settings.fps)
      .videoCodec('libx264')
      .outputOptions([
        '-preset fast',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-y'
      ]);

    // Add audio if enabled
    if (settings.includeSystemAudio || settings.includeMicrophone) {
      command.audioCodec('aac').audioBitrate('128k');
    } else {
      command.noAudio();
    }

    command
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        const percent = progress.percent?.toFixed(1) || '0';
        console.log(`Processing: ${percent}% done`);
      })
      .on('end', () => {
        console.log('Processing finished successfully');
        console.log('Output file:', outputPath);

        // Verify output file was created
        if (existsSync(outputPath)) {
          const outputStats = statSync(outputPath);
          console.log(`Output file size: ${outputStats.size} bytes`);
        }

        resolve();
      })
      .on('error', (err, _stdout, stderr) => {
        console.error('FFmpeg error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        reject(err);
      })
      .run();
  });
}

export function trimVideo(
  inputPath: string,
  outputPath: string,
  trimSettings: TrimSettings
): Promise<void> {
  return new Promise((resolve, reject) => {
    const duration = trimSettings.endTime - trimSettings.startTime;

    ffmpeg(inputPath)
      .setStartTime(trimSettings.startTime)
      .setDuration(duration)
      .output(outputPath)
      .videoCodec('copy')
      .audioCodec('copy')
      .on('start', (commandLine) => {
        console.log('FFmpeg trim command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Trimming: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Trimming finished successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error trimming video:', err);
        reject(err);
      })
      .run();
  });
}

export function getVideoMetadata(videoPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

export function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timeInSeconds: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: outputPath,
        size: '320x240'
      })
      .on('end', () => {
        console.log('Thumbnail generated successfully');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      });
  });
}
