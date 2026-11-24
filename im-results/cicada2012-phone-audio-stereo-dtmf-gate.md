# Cicada 2012 phone recording: stereo DTMF gate

## Result

The archived phone recording does **not** yield a credible hidden DTMF message. The initial mono detector returned the short candidate sequence `A5`, but channel-separated analysis shows that this is not a convincing keypad signal:

- The OGG is dual-mono: left/right normalized correlation is exactly 1.000000, with identical RMS and identical detected frames. There is no distinct second audio channel.
- The detector finds 45 DTMF-like frames across the 20.927-second recording, but only two 60 ms runs: `A` at 3.89–3.95 s and `5` at 4.89–4.95 s. They appear identically in left, right, and mono.
- The candidate peaks are broad rather than narrowband. Main-to-adjacent-50-Hz power ratios are only 3.72/1.50 for the two `A` tones and 7.76/1.33 for the two `5` tones. The low-tone inter-frame phase coherences are 0.899 and 0.891.
- With the same 40 ms Hamming-window detector, pure sinusoids at these frequencies give main-to-adjacent-50-Hz ratios above 540,000. The observed values are therefore consistent with speech formants triggering the DTMF classifier, not clean keypad tones.

Do not treat `A5` as a recovered code, key, or instruction. This rejects the simple hidden-DTMF interpretation; it does not prove that every conceivable audio-steganographic method is absent.

## Source identity and container integrity

The input is the community archive `neuroretransmit/cicada/2012/004-phone-number/0.ogg`, pinned to repository commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`. It is not a first-party Cicada artifact.

- Size: 760,215 bytes
- SHA-256: `cc75c9a7ca677a139481064beb492e5a4868ab98b2c21c2f03eadba3546caf43`
- Git blob SHA-1: `4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10` (matches the pinned mirror blob)
- Codec: Vorbis, 44.1 kHz, 2 channels, 20.927 seconds
- OGG framing: 165 pages, one logical stream, one EOS page, no sequence gaps, no malformed page, and zero trailing bytes
- Vorbis stream tags: none

## Reproduction

- Analyzer: `sims/cicada2012_phone_audio_gate.cjs`
- Manual workflow: `.github/workflows/cicada2012-phone-audio-gate.yml`
- Stereo-validation run: [45316074265](https://github.com/FlareZ123/liber-primus/actions/runs/45316074265)
- The analyzer decodes both channels and their average to 8 kHz PCM, then uses 40 ms windows and 10 ms hops with Goertzel measurements at the standard 4×4 DTMF frequencies. It also records spectral concentration and inter-frame phase stability for sustained candidates.

## Scope and next use

This result closes the cheap DTMF/stereo-channel hypothesis for the archived recording. It does not decode arbitrary FSK, phase modulation, or speech steganography. The known phone-number / LP2 ornament relationship remains a cross-round clue, but this audio file supplies no validated extra key material.
