#!/usr/bin/env node
'use strict';

// Source-gated analysis of the archived 2012 Cicada phone-line recording.
// Requires ffmpeg/ffprobe. This version retains both stereo channels and
// tests DTMF frequency concentration and inter-frame phase stability.

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
    trailingByteCount: buf.length - offset
  };
}

const probe = run('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', input]);
const metadata = JSON.parse(probe.stdout);
const audioStreams = (metadata.streams || []).filter(s => s.codec_type === 'audio');
if (!audioStreams.length) throw new Error('No audio stream reported by ffprobe');
const originalChannels = Number(audioStreams[0].channels || 1);

const pcmPath = path.join(outDir, 'stereo-8k-s16le.pcm');
run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vn', '-ac', '2', '-ar', '8000', '-f', 's16le', pcmPath]);
const pcm = fs.readFileSync(pcmPath);
if (pcm.length % 4) throw new Error('Decoded stereo PCM has invalid byte length');
const sampleCount = pcm.length / 4;
const sampleRate = 8000;
const left = new Float64Array(sampleCount);
const right = new Float64Array(sampleCount);
const mono = new Float64Array(sampleCount);
let lEnergy = 0, rEnergy = 0, cross = 0;
for (let i = 0; i < sampleCount; i++) {
  const l = pcm.readInt16LE(i * 4);
  const r = pcm.readInt16LE(i * 4 + 2);
  left[i] = l;
  right[i] = r;
  mono[i] = (l + r) / 2;
  lEnergy += l * l;
  rEnergy += r * r;
  cross += l * r;
}
const crossChannelCorrelation = (lEnergy && rEnergy) ? cross / Math.sqrt(lEnergy * rEnergy) : null;

const low = [697, 770, 852, 941];
const high = [1209, 1336, 1477, 1633];
const keypad = [
  ['1', '2', '3', 'A'],
  ['4', '5', '6', 'B'],
  ['7', '8', '9', 'C'],
  ['*', '0', '#', 'D']
];
const frameSize = 320; // 40 ms
const hop = 80;         // 10 ms

function goertzel(samples, start, n, freq) {
  const omega = 2 * Math.PI * freq / sampleRate;
  const coeff = 2 * Math.cos(omega);
  let s1 = 0, s2 = 0, windowSum = 0, energy = 0;
  for (let i = 0; i < n; i++) {
    const w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (n - 1));
    const x = samples[start + i] * w;
    windowSum += w;
    energy += samples[start + i] * samples[start + i];
    const s0 = x + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = Math.max(0, s1 * s1 + s2 * s2 - coeff * s1 * s2);
  const amplitude = windowSum ? 2 * Math.sqrt(power) / windowSum : 0;
  return { power, amplitude, rms: Math.sqrt(energy / n) };
}

function complexAt(samples, start, n, freq) {
  let re = 0, im = 0, windowSum = 0;
  for (let i = 0; i < n; i++) {
    const w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (n - 1));
    const theta = 2 * Math.PI * freq * i / sampleRate;
    const x = samples[start + i] * w;
    re += x * Math.cos(theta);
    im -= x * Math.sin(theta);
    windowSum += w;
  }
  return { re, im, phase: Math.atan2(im, re), amplitude: 2 * Math.hypot(re, im) / windowSum };
}

function wrapPhase(x) {
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
}

function eventQuality(samples, event, frames) {
  const chosen = frames.slice(event.firstFrame, event.lastFrame + 1);
  const details = {};
  for (const [label, freq] of [['low', event.lowHz], ['high', event.highHz]]) {
    const phases = chosen.map(f => complexAt(samples, f.startSample, frameSize, freq));
    const residuals = [];
    for (let i = 1; i < phases.length; i++) {
      const expected = 2 * Math.PI * freq * hop / sampleRate;
      residuals.push(wrapPhase(phases[i].phase - phases[i - 1].phase - expected));
    }
    const coherence = residuals.length
      ? Math.hypot(residuals.reduce((s, x) => s + Math.cos(x), 0), residuals.reduce((s, x) => s + Math.sin(x), 0)) / residuals.length
      : null;
    const sidePowers = [];
    for (const f of [freq - 50, freq + 50]) {
      sidePowers.push(goertzel(samples, chosen[0].startSample, frameSize, f).power);
    }
    const mainPower = goertzel(samples, chosen[0].startSample, frameSize, freq).power;
    details[label] = {
      frequencyHz: freq,
      phaseResidualsRad: residuals.map(x => Number(x.toFixed(3))),
      phaseCoherence: coherence === null ? null : Number(coherence.toFixed(3)),
      firstFramePeakToAdjacent50HzPower: Number((mainPower / Math.max(1e-12, ...sidePowers)).toFixed(2)),
      meanAmplitude: Number((phases.reduce((s, x) => s + x.amplitude, 0) / phases.length).toFixed(2))
    };
  }
  return details;
}

function analyzeChannel(samples, channelName) {
  const frames = [];
  for (let start = 0; start + frameSize <= sampleCount; start += hop) {
    let energy = 0;
    for (let j = 0; j < frameSize; j++) energy += samples[start + j] * samples[start + j];
    const rms = Math.sqrt(energy / frameSize);
    const lows = low.map(f => ({ f, ...goertzel(samples, start, frameSize, f) })).sort((a, b) => b.power - a.power);
    const highs = high.map(f => ({ f, ...goertzel(samples, start, frameSize, f) })).sort((a, b) => b.power - a.power);
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
      startSample: start, t: start / sampleRate, digit, valid,
      rms: Number(rms.toFixed(2)), lowHz: l.f, highHz: h.f,
      lowAmpOverRms: Number((l.amplitude / Math.max(1, rms)).toFixed(3)),
      highAmpOverRms: Number((h.amplitude / Math.max(1, rms)).toFixed(3)),
      lowDominance: Number(lowDom.toFixed(2)), highDominance: Number(highDom.toFixed(2)),
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
        channel: channelName, digit: f.digit, lowHz: f.lowHz, highHz: f.highHz,
        start: f.t, end: f.t + frameSize / sampleRate, frames: 1,
        firstFrame: i, lastFrame: i
      } : null;
    }
  }
  if (current) events.push(current);
  const accepted = events.filter(e => e.frames >= 3 && (e.end - e.start) >= 0.06)
    .map(e => ({
      ...e,
      duration: Number((e.end - e.start).toFixed(3)),
      quality: eventQuality(samples, e, frames)
    }));
  const validFrames = frames.filter(f => f.valid).map(f => ({
    t: Number(f.t.toFixed(3)), digit: f.digit, lowHz: f.lowHz, highHz: f.highHz,
    rms: f.rms, lowAmpOverRms: f.lowAmpOverRms, highAmpOverRms: f.highAmpOverRms,
    lowDominance: f.lowDominance, highDominance: f.highDominance, twist: f.twist
  }));
  return {
    channel: channelName,
    rms: Number(Math.sqrt(samples.reduce((s, x) => s + x * x, 0) / samples.length).toFixed(2)),
    validFrameCount: validFrames.length,
    validFrames,
    acceptedEvents: accepted,
    decodedSequence: accepted.map(e => e.digit).join(''),
    topCandidates: [...frames].sort((a, b) => b.confidence - a.confidence).slice(0, 15)
  };
}

const analyses = {
  left: analyzeChannel(left, 'left'),
  right: analyzeChannel(right, 'right'),
  mono: analyzeChannel(mono, 'mono')
};

const ogg = inspectOgg(bytes);
const report = {
  source: {
    filename: path.basename(input), byteLength: bytes.length, sha256, gitBlobSha1,
    expectedGitBlobSha1: '4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10'
  },
  ogg,
  metadata,
  decoded: {
    sampleRate, originalChannels, analyzedChannels: ['left', 'right', 'mono'],
    sampleCountPerChannel: sampleCount,
    durationSeconds: Number((sampleCount / sampleRate).toFixed(3)),
    frameSizeMs: 40, hopMs: 10,
    leftRms: analyses.left.rms, rightRms: analyses.right.rms,
    crossChannelCorrelation: Number(crossChannelCorrelation.toFixed(6))
  },
  dtmf: {
    testedFrequenciesHz: { low, high },
    thresholds: {
      lowDominance: 3, highDominance: 3, minToneAmplitudeOverFrameRms: 0.08,
      maxTwistRatio: 4, minTwistRatio: 0.25, minEventFrames: 3
    },
    analyses
  }
};

fs.writeFileSync(path.join(outDir, 'analysis.json'), JSON.stringify(report, null, 2) + '\n');
const csv = ['channel,time,digit,low_hz,high_hz,rms,low_amp_rms,high_amp_rms,low_dom,high_dom,twist'];
for (const a of Object.values(analyses)) {
  for (const f of a.validFrames) csv.push([
    a.channel, f.t, f.digit, f.lowHz, f.highHz, f.rms,
    f.lowAmpOverRms, f.highAmpOverRms, f.lowDominance, f.highDominance, f.twist
  ].join(','));
}
fs.writeFileSync(path.join(outDir, 'dtmf-valid-frames.csv'), csv.join('\n') + '\n');

const md = [
  '# Cicada 2012 phone recording: stereo DTMF validation',
  '',
  '- File: ' + path.basename(input) + ' (' + bytes.length + ' bytes)',
  '- SHA-256: ' + sha256,
  '- Git blob SHA-1: ' + gitBlobSha1 + ' (expected pinned mirror blob: 4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10)',
  '- OGG pages: ' + ogg.pageCount + '; logical streams: ' + ogg.streamCount + '; trailing bytes: ' + ogg.trailingByteCount,
  '- Duration: ' + report.decoded.durationSeconds + 's; original channels: ' + originalChannels,
  '- Left/right normalized correlation: ' + report.decoded.crossChannelCorrelation,
  '',
  ...Object.values(analyses).flatMap(a => [
    '## ' + a.channel,
    '',
    '- DTMF valid frames: ' + a.validFrameCount,
    '- Sustained events: ' + (a.acceptedEvents.length ? a.acceptedEvents.map(e => e.digit + '@' + e.start.toFixed(2) + '–' + e.end.toFixed(2) + 's').join(', ') : 'none'),
    '- Sequence under frozen detector: ' + (a.decodedSequence || '(empty)'),
    ...a.acceptedEvents.map(e => '- ' + e.digit + ' quality: ' + JSON.stringify(e.quality)),
    ''
  ]),
  '## Scope',
  '',
  'The DTMF detector is a candidate detector, not proof of deliberate signaling. Speech formants can trigger DTMF-like frequency pairs. This version checks left, right and downmixed audio separately, then evaluates narrowband concentration and inter-frame phase stability for each sustained candidate. It does not decode arbitrary FSK, phase modulation, or speech steganography.'
].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'report.md'), md);

const spectrogram = run('ffmpeg', [
  '-v', 'error', '-y', '-i', input,
  '-lavfi', 'showspectrumpic=s=1600x900:legend=1',
  '-frames:v', '1', path.join(outDir, 'spectrogram.png')
], true);

console.log(JSON.stringify({
  source: report.source,
  ogg: report.ogg,
  decoded: report.decoded,
  streams: audioStreams.map(s => ({
    codec_name: s.codec_name, sample_rate: s.sample_rate, channels: s.channels, tags: s.tags || {}
  })),
  dtmf: Object.fromEntries(Object.entries(analyses).map(([k, a]) => [k, {
    validFrameCount: a.validFrameCount,
    validFrames: a.validFrames,
    acceptedEvents: a.acceptedEvents,
    decodedSequence: a.decodedSequence
  }])),
  spectrogramCreated: spectrogram.ok
}, null, 2));
