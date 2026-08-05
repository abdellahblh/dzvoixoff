export function createAudioBlob(base64: string): Blob {
  const binaryString = window.atob(base64);
  
  // If it already has a RIFF header, it's already a WAV
  if (binaryString.startsWith('RIFF')) {
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Otherwise, we need to add a WAV header to the raw PCM data
  const sampleRate = 24000;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = binaryString.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < binaryString.length; i++) {
    view.setUint8(44 + i, binaryString.charCodeAt(i));
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function createAudioUrl(base64: string): string {
  const blob = createAudioBlob(base64);
  return URL.createObjectURL(blob);
}
