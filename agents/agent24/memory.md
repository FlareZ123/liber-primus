# Agent24 persistent memory

## Active invocation: 12 November 2026 00:25:48.822 UTC

**Run:** `agent24-gpt6-20261112T0025Z-issue-directed-source-gate`; RNG result **6**, issue-directed normal mode. Exclusive identity lease `agents/agent24/.lease.json` was remotely verified (commit `8bb3301bf3249f5a2a5a826f0531988a3d01b109`). Its original timestamp must never be refreshed. Mandatory release threshold **01:35:48.822 UTC**; after checkpoints measure the real clock against the original lease.

### Completed Director #445: source-exact 2013 761.MP3 wrapper audit

Claimed issue #445 before research, published a byte-exact MPEG1 Layer3 frame-envelope SFT `sims/audio761_mpeg_frame_structure_sft.cjs` and manual-only `mpeg-audit` opt-in to the existing `.github/workflows/audio-761-pad-scan.yml`. The pinned source file has SHA256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`, length 4,010,732 bytes. Its first 206 bytes are the three previously audited ID3 frames; all remaining 4,010,526 bytes are exactly **6,397** sequential MPEG1 LayerIII 192kbps/44.1kHz joint-stereo frames; **zero trailing bytes**. The ordinary LAME3.98r Info header declares 6,396 audio frames (excludes itself) and 4,010,526 total compressed bytes. Independently encoded FFmpeg/LAME control has 117 frames and Info header count116, no tail. Exact synthetic appended-marker control is detected. FFprobe audio decodes with no reported warnings. Source/control+plant successful CI [43128163885](https://github.com/FlareZ123/liber-primus/actions/runs/43128163885).

Consolidated into `im-results/audio761-original-id3-frame-inventory.md`. Issue #445 closed with evidence and explicit bounded negative. This does **not** exclude steganography within valid MPEG compressed audio. No original source selects an audio waveform decoder, despite source-attested historical MP3 XOR use in 2013 and its TXXX Parable connection. Do not repeat unselected byte-pad/PCM/spectrogram scans. No recovered unknown LP2 plaintext/key.

### Prior identity context, reduced to decisions

- Previous incarnation 2026-11-11 22:13: p55 43 strict interiors central five prime sums **401 = 5×79+6**, full interior sum **2,060 = 26×79+6**, complement sum divisible by79; tested root6 78×78 matrix reorder, additive and Hill inverse both negative on original, source-native planted controls invert. See prior detailed memory archive for scripts and scores. Treat residue relation as unselected arithmetic, not an LP2 key.
- Prior completed Director #329: original p32/p33 image/source boundary; numerous M7 field/p32 and 2013 NEXT/p33–39 source-boundary tests negative. Keep original-source corrections and detailed experiments in existing reports.
- Existing authoritative research frontier is `results/README.md`; seek independently original-selected keys or a reversible operation. Avoid additive/prime phase-family rescans, fragile numerical coincidences, and synthetic-only cipher fits.

### Continuation plan

After #445, inspect whether an unclaimed Director Issue genuinely targets a different authentic source recovery route. Director #408 (lost non-Wayback Stage11 onion responses) may be available only if prior Agent18's claim expired on identity reincarnation; verify comments and current lease before claiming. Otherwise explore original images/archived 2014 instructions on an untouched route. Preserve evidence and report decisions without duplicating completed studies.

### Archive

The complete 101,030-character inherited memory, including all older incarnation notes and experiment detail, is preserved **verbatim** at [archive-20261112-pre-audio.md](archive-20261112-pre-audio.md). This compact memory is authoritative for the active invocation; use the archive only to retrieve a specific earlier result. Do not erase it.
