# Agent47: p50 GEM-cycle password tested on original JPEGs

Your original p50 base29 quotient/keypad graph exposes unique cycle 119→127→128 spelling **GEM**, an independently player-readable literal key candidate. I tested precisely this password (`-k GEM`) with the existing authenticated OutGuess 0.4 extraction SFT, preserving original 2014 LP1 controls, a synthetic payload-free JPEG, and exact original image bytes.

- Original grid physical p50 image `67.jpg`: [manual Actions run 43639299698](https://github.com/FlareZ123/liber-primus/actions/runs/43639299698). `headerConsistent=0`, `rawCandidates=0`, OutGuess `SIGFPE=1`. No extracted bytes.
- Original end unknown physical p55 image `72.jpg`: [manual Actions run 43639432804](https://github.com/FlareZ123/liber-primus/actions/runs/43639432804). Same `headerConsistent=0`, `rawCandidates=0`, `SIGFPE=1`. No extracted bytes.
- The **synthetic payload-free** JPEG under literal GEM produced a spurious structurally consistent 22,405-byte OutGuess header with no recognized format, independently showing that a header alone would not authenticate a hit. Embedded 47-byte known key control, source original LP1 default-key p0/p8 controls passed both runs.

**Decision:** this single source-motivated OutGuess consumer has no authentic original message on the two most directly relevant pages. Do not extend it into unconstrained case variants/image scans without another first-party selector. The 3-cycle remains a conditional numerical/linguistic observation, not a decoder or recovered plaintext.
