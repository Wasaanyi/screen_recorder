import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * electron-builder afterPack hook.
 * Ensures FFmpeg/FFprobe binaries have execute permissions on macOS and Linux.
 * On Windows, this is a no-op.
 */
export default async function afterPack(context) {
  if (process.platform === 'win32') {
    return;
  }

  const appOutDir = context.appOutDir;
  const platform = context.electronPlatformName;

  if (platform === 'darwin' || platform === 'linux') {
    console.log('Setting execute permissions on FFmpeg binaries...');

    const resourcesDir = platform === 'darwin'
      ? join(appOutDir, `${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
      : join(appOutDir, 'resources');

    const unpackedDir = join(resourcesDir, 'app.asar.unpacked', 'node_modules');

    try {
      await execAsync(`chmod +x "${join(unpackedDir, 'ffmpeg-static', 'ffmpeg')}" 2>/dev/null || true`);
      await execAsync(`chmod +x "${join(unpackedDir, 'ffprobe-static', 'bin', '*')}" 2>/dev/null || true`);
      console.log('FFmpeg binary permissions set successfully');
    } catch (err) {
      console.warn('Warning: Could not set FFmpeg permissions:', err.message);
    }
  }
}
