#!/usr/bin/env node
'use strict';

// Source-gated analysis of the archived 2012 Cicada phone-line recording.
// Requires ffmpeg/ffprobe. No cipher search or parameter fitting is performed.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const input = process.argv[2];
const outDir = process.argv[3] || path.join(process.cwd(), 'phone-audio-output');
if (!input) {
  console.error('Usage: node sims/cicada2012_phone_audio_gate.cjs <recording.ogg> [output-dir]');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

function run(command, args, allowFailure = false) {
  const r = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.error) {
    if (allowFailure) return { ok: false, error: String(r.error), stdout: r.stdout || '', stderr: r.stderr || '' };
    throw r.error;
  }
  if (r.status !== 0 && !allowFailure) {
    throw new Error(command + ' exited ' + r.status + ': ' + (r.stderr || '').slice(-2000));
  }
  return { ok: r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

const bytes = fs.readFileSync(input);
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
const gitBlobSha1 = crypto.createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes])).digest('hex');

function inspectOgg(buf) {
  let offset = 0;
  const pages = [];
  const streams = new Map();
  let malformedAt = null;
  while (offset < buf.length) {
    if (offset + 27 > buf.length || buf.toString('ascii', offset, offset + 4) !== 'OggS') {
      malformedAt = offset;
      break;
    }
    const segmentCount = buf[offset + 26];
    if (offset + 27 + segmentCount > buf.length) {
      malformedAt = offset;
      break;
    }
    let payloadLength = 0;
    for (let i = 0; i < segmentCount; i++) payloadLength += buf[offset + 27 + i];
    const pageLength = 27 + segmentCount + payloadLength;
    if (offset + pageLength > buf.length) {
      malformedAt = offset;
      break;
    }
    const flags = buf[offset + 5];
    const serial = buf.readUInt32LE(offset + 14);
    const sequence = buf.readUInt32LE(offset + 18);
    const stream = streams.get(serial) || { serial, pages: 0, eosPages: 0, sequenceGaps: [] };
    if (stream.pages && sequence !== stream.lastSequence + 1) {
      stream.sequenceGaps.push({ previous: stream.lastSequence, current: sequence });
    }
    stream.pages++;
    stream.lastSequence = sequence;
    if (flags & 0x04) stream.eosPages++;
    streams.set(serial, stream);
    pages.push({ offset, length: pageLength, serial, sequence, flags });
    offset += pageLength;
  }
  return {
    pageCount: pages.length,
    streamCount: streams.size,
    streams: [...streams.values()].map(({ lastSequence, ...s }) => s),
    eosPageCount: pages.filter(p => (p.flags & 0x04) !== 0).length,
    malformedAt,
    parsedEnd: offset,
    trailingByteCount: buf.length - offset,
    trailingHex: offset < buf.length ? buf.subarray(offset, Math.min(buf.length, offset + 128)).toString('hex') : '',
    trailingAscii: offset < buf.length ? buf.subarray(offset, Math.min(buf.length, offset + 128)).toString('latin1').replace(/[^\x20-\x7e]/g, '.') : ''
  };
}

const probe = run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input]);
const metadata = JSON.parse(probe.stdout);
const audioStreams = (metadata.streams || []).filter(s => s.codec_type === 'audio');
if (!audioStreams.length) throw new Error('No audio stream reported by ffprobe');

const pcmPath = path.join(outDir, 'mono-8k-s16le.pcm');
run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vn', '-ac', '1', '-ar', '8000', '-f', 's16le', pcmPath]);
const pcm = fs.readFileSync(pcmPath);
if (pcm.length % 2) throw new Error('Decoded PCM has odd byte length');
const sampleCount = pcm.length / 2;
const sampleRate = 8000;
const samples = new Float64Array(sampleCount);
for (let i = 0; i < sampleCount; i++) samples[i] = pcm.readInt16LE(i * 2);

function goertzel(frameStart, n, freq) {
  const omega = 2 * Math.PI * freq / sampleRate;
  const coeff = 2 * Math.cos(omega);
  let s1 = 0, s2 = 0, windowSum = 0, energy = 0;
  for (let i = 0; i < n; i++) {
    const w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (n - 1));
    const x = samples[frameStart + i] * w;
    windowSum += w;
    energy += samples[frameStart + i] * samples[frameStart + i];
    const s0 = x + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = Math.max(0, s1 * s1 + s2 * s2 - coeff * s1 * s2);
  const amplitude = windowSum ? 2 * Math.sqrt(power) / windowSum : 0;
  return { power, amplitude, rms: Math.sqrt(energy / n) };
}

const low = [697, 770, 852, 941];
const high = [1209, 1336, 1477, 1633];
const keypad = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];
const frameSize = 320; // 40 ms at 8 kHz
const hop = 80;         // 10 ms
const frames = [];
for (let start = 0; start + frameSize <= sampleCount; start += hop) {
  let energy = 0;
  for (let j = 0; j < frameSize; j++) energy += samples[start + j] * samples[start + j];
  const rms = Math.sqrt(energy / frameSize);
  const lows = low.map(f => ({ f, ...goertzel(start, frameSize, f) })).sort((a, b) => b.power - a.power);
  const highs = high.map(f => ({ f, ...goertzel(start, frameSize, f) })).sort((a, b) => b.power - a.power);
  const l = lows[0], h = highs[0];
  const lowDom = l.power / Math.max(1e-12, lows[1].power);
  const highDom = h.power / Math.max(1e-12, highs[1].power);
  const twist = l.amplitude / Math.max(1e-12, h.amplitude);
  const digit = keypad[low.indexOf(l.f)][high.indexOf(h.f)];
  const valid = rms >= 100 &&
    l.amplitude >= 0.08 * rms && h.amplitude >= 0.08 * rms &&
    lowDom >= 3.0 && highDom >= 3.0 &&
    twist >= 0.25 && twist <= 4.0;
  frames.push({
    t: start / sampleRate, digit, valid, rms: Number(rms.toFixed(2)),
    lowHz: l.f, highHz: h.f,
    lowAmpOverRms: Number((l.amplitude / Math.max(1, rms)).toFixed(3)),
    highAmpOverRms: Number((h.amplitude / Math.max(1, rms)).toFixed(3)),
    lowDominance: Number(lowDom.toFixed(2)),
    highDominance: Number(highDom.toFixed(2)),
    twist: Number(twist.toFixed(3)),
    confidence: Number((Math.min(lowDom, highDom) * Math.min(l.amplitude, h.amplitude) / Math.max(1, rms)).toFixed(3))
  });
}

const events = [];
let current = null;
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  if (f.valid && current && current.digit === f.digit && i - current.lastFrame <= 2) {
    current.lastFrame = i;
    current.frames++;
    current.end = f.t + frameSize / sampleRate;
  } else {
    if (current) events.push(current);
    current = f.valid ? {
      digit: f.digit, start: f.t, end: f.t + frameSize / sampleRate,
      frames: 1, firstFrame: i, lastFrame: i
    } : null;
  }
}
if (current) events.push(current);
const acceptedEvents = events.filter(e => e.frames >= 3 && (e.end - e.start) >= 0.06);

const tonePairs = [
  ['dial-tone', 350, 440],
  ['ringback-tone', 440, 480],
  ['busy-tone', 480, 620],
  ['Bell-202-mark-space', 1200, 2200]
];
const genericToneFrames = [];
for (let start = 0; start + frameSize <= sampleCount; start += hop) {
  let energy = 0;
  for (let j = 0; j < frameSize; j++) energy += samples[start + j] * samples[start + j];
  const rms = Math.sqrt(energy / frameSize);
  for (const [name, f1, f2] of tonePairs) {
    const a = goertzel(start, frameSize, f1), b = goertzel(start, frameSize, f2);
    const ar = a.amplitude / Math.max(1, rms), br = b.amplitude / Math.max(1, rms);
    if (rms >= 100 && ar >= 0.10 && br >= 0.10) {
      genericToneFrames.push({
        t: Number((start / sampleRate).toFixed(3)), name, f1, f2,
        aOverRms: Number(ar.toFixed(3)), bOverRms: Number(br.toFixed(3))
      });
    }
  }
}

const topCandidates = [...frames].sort((a, b) => b.confidence - a.confidence).slice(0, 25);
const ogg = inspectOgg(bytes);
const report = {
  source: {
    filename: path.basename(input), byteLength: bytes.length, sha256, gitBlobSha1,
    expectedGitBlobSha1: '4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10'
  },
  ogg,
  metadata,
  decoded: {
    sampleRate, channels: 1, sampleCount,
    durationSeconds: Number((sampleCount / sampleRate).toFixed(3)),
    frameSizeMs: 40, hopMs: 10
  },
  dtmf: {
    testedFrequenciesHz: { low, high },
    thresholds: {
      lowDominance: 3, highDominance: 3, minToneAmplitudeOverFrameRms: 0.08,
      maxTwistRatio: 4, minTwistRatio: 0.25, minEventFrames: 3
    },
    acceptedEvents, decodedSequence: acceptedEvents.map(e => e.digit).join(''),
    validFrameCount: frames.filter(f => f.valid).length, topCandidates
  },
  otherTonePairs: {
    tested: tonePairs, candidateFrameCount: genericToneFrames.length,
    candidateFrames: genericToneFrames.slice(0, 100)
  }
};

fs.writeFileSync(path.join(outDir, 'analysis.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'dtmf-frames.csv'),
  ['time,digit,valid,rms,low_hz,high_hz,low_amp_rms,high_amp_rms,low_dom,high_dom,twist,confidence',
   ...frames.map(f => [f.t,f.digit,f.valid,f.rms,f.lowHz,f.highHz,f.lowAmpOverRms,f.highAmpOverRms,f.lowDominance,f.highDominance,f.twist,f.confidence].join(','))].join('\n') + '\n');

const md = [
  '# Cicada 2012 phone recording: source and acoustic-channel gate',
  '',
  '- File: ' + path.basename(input) + ' (' + bytes.length + ' bytes)',
  '- SHA-256: ' + sha256,
  '- Git blob SHA-1: ' + gitBlobSha1 + ' (expected pinned mirror blob: 4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10)',
  '- OGG pages: ' + ogg.pageCount + '; logical streams: ' + ogg.streamCount + '; trailing bytes after parsed pages: ' + ogg.trailingByteCount,
  '- Audio streams: ' + audioStreams.length + '; decoded duration: ' + report.decoded.durationSeconds + 's at 8 kHz mono',
  '- DTMF: ' + (acceptedEvents.length ? acceptedEvents.map(e => e.digit + '@' + e.start.toFixed(2) + '–' + e.end.toFixed(2) + 's').join(', ') : 'no sustained standard DTMF events under the frozen detector'),
  '- Other tested dual-tone candidates: ' + genericToneFrames.length + ' frames',
  '',
  '## Scope',
  '',
  'This is a finite source inspection, not a proof that the recording contains no hidden information. It checks OGG framing/trailing data, ffprobe stream and comment metadata, standard DTMF pairs, and a small set of common telephone/FSK tone pairs. It does not decode arbitrary FSK, phase modulation, speech steganography, or every possible acoustic encoding.',
  '',
  '## Reproduction',
  '',
  'The companion manual workflow pins the community mirror commit and verifies its Git blob SHA before running this script. analysis.json contains the full detector thresholds, frame candidates, stream metadata, and exact source hashes.'
].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'report.md'), md);

const spectrogram = run('ffmpeg', [
  '-v', 'error', '-y', '-i', input,
  '-lavfi', 'showspectrumpic=s=1600x900:legend=1',
  '-frames:v', '1', path.join(outDir, 'spectrogram.png')
], true);

console.log(JSON.stringify({
  source: report.source, ogg: report.ogg, audio: report.decoded,
  streams: audioStreams.map(s => ({
    codec_name: s.codec_name, sample_rate: s.sample_rate, channels: s.channels, tags: s.tags || {}
  })),
  dtmf: {
    acceptedEvents, decodedSequence: report.dtmf.decodedSequence,
    validFrameCount: report.dtmf.validFrameCount, topCandidates
  },
  otherTonePairCandidateFrameCount: genericToneFrames.length,
  spectrogramCreated: spectrogram.ok
}, null, 2));
