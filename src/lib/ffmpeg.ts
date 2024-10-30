
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
const ffmpeg = new FFmpeg();

let ffmpegLogBuffer = '';

export const load = async (): Promise<boolean> => {
  const loaded = await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      'application/wasm',
    ),
  });
  ffmpeg.on('log', (log) => {
    ffmpegLogBuffer += '\n' + log.message;
    console.log(log)
  });

  return loaded;
}

export const convert = async (file: File, args: string): Promise<File> => {
  await ffmpeg.writeFile(
    file.name,
    new Uint8Array(await file.arrayBuffer()),
  );
  await ffmpeg.exec([
    '-i',
    file.name,
    ...args.split(' '),
    `convert.webp`,
  ]);
  const data = await ffmpeg.readFile('convert.webp');
  return new File(
    [(data as Uint8Array).buffer],
    `${file.name.split('.').slice(0, -1).join('.')}.webp`,
    { type: 'image/webp' },
  );
}