# Dot-stream / p50 32-row packet and eight-section key gate

**Result: negative under the fixed mappings tested. No plaintext or key recovery.**

## Hypothesis

The original p50 table is a 32×8 array (256 bytes). A separate source census reports a 30-symbol 13-dot/10-dot stream, with 13-dot mapped to 1 and 10-dot to 0:

`111111111111111111111001110111`

It has three zero positions (1-based 22, 23, 27) and 27 ones. The local 31-marker segmentation produces 32 table-aligned intervals, with empty intervals 8 and 11. If the 30-symbol stream maps in order to the 30 nonempty intervals, then:

- empty interval rows 8 and 11 supply 16 bytes;
- the three zero positions map, after skipping those empty rows, to rows 24, 25 and 29, supplying 24 bytes;
- the 27 one positions select the remaining 27 rows, supplying 216 bytes.

This partitions all 256 table bytes into a 24-byte AES-192 key, a 16-byte IV and a 216-byte payload. The exact length fit is interesting, but **the alignment of the 30-symbol stream to the 30 nonempty intervals is a hypothesis**, not an established instruction.

## Source inputs and mapping

- `resources/liber-primus/lp2-grid-256.json`: 256 decoded table bytes, 32 rows × 8 columns.
- `resources/liber-primus/lp2-corpus.json`: original 12,956-rune LP2 ciphertext (pages 0–55).
- `resources/lp2-transcription.txt`: splitting on `$` gives eight unknown-text sections of lengths **729, 1145, 1738, 1894, 1021, 1433, 1680, 3316**, followed by the two known solved pages (85 and 95 runes). The eight unknown sections sum to 12,956.
- `im-results/lp2-13dot-32row-grid-original-cipher-gate.md`: 31 markers produce 32 intervals; intervals 8 and 11 are empty.
- External comparison: [Dukotah R44 P1 red-ink/dot census](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/RESULTS.md) reports the 30-symbol stream and its three zero positions. [Dukotah B3 semantic/ornament census](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round10b/B3-semantic-keys/RESULTS.md) documents the `&`/`$` structural marks.

Mapping the 30 bits to the 30 nonempty intervals in order gives key rows **24, 25, 29**, IV rows **8, 11**, and 27 payload rows. In printed row-major order:

- AES-192 key: `809c135126c0aa21009b9f59b073692f443449f9900075af`
- IV from empty rows: `fe7692456ac47c338e3ac9c1ad1c6f41`
- payload length: 216 bytes

## Tests

A reproducible Node 22 script, `sims/lp2_dotstream_p50_32row_aes192_packet_gate.cjs`, performs the tests and asserts the source counts and mappings. It also validates the host AES-192 implementation against the FIPS-197 AES-192 ECB test vector.

### AES packet

The 216-byte payload was decrypted with AES-192-CTR, AES-192-OFB and AES-192-CFB using three fixed IV choices: the two empty table rows, the 30-bit dot-stream integer `0x3ffffe77` encoded big-endian in the low 32 bits, and an all-zero IV.

No output had a recognized file signature or meaningful plaintext. Across the nine mode/IV combinations, printable ASCII ranged from 65/216 (30.1%) to 89/216 (41.2%); byte entropy ranged from 7.002 to 7.143 bits/byte. The primary empty-row-IV AES-192-CTR output begins `8bd03cf198ff41f5b2a59c2b109179c2...` and has 7.032 bits/byte entropy. These are random-like outputs, not evidence of a recovered payload.

### Eight-section direct-key alternative

Because the eight unknown `$`-delimited sections match the p50 table's eight columns, each vertical 32-byte column was also tested as a repeating 32-symbol GP29 additive key for its corresponding section, with a reset at each `$` boundary. The bounded variants covered vertical columns and consecutive row-major 32-byte blocks, forward/reversed row order, and both additive signs; bytes were reduced mod 29.

The raw ciphertext IoC is approximately **0.03448**; the best tested direct section-key IoC is approximately **0.03451**. There is no meaningful lift toward the native English control range. No readable plaintext emerged.

## Conclusion and scope

The eight-section/eight-column match and the 24+16+216 packet partition are source-shaped hypotheses, but their simplest direct decoders fail. Do not extend this into arbitrary row permutations, key derivations, IV searches, or cipher-mode searches without an independent clue selecting them. This result does not exclude other uses of the dot stream, p50 table, or ornament boundaries; it rejects only the fixed mappings and operations documented here.

This is an intermediate negative result, not an established discovery. `results/README.md` remains unchanged; all 56 unknown LP2 pages remain unsolved.

## Reproduction

Run from repository root:

```powershell
node sims/lp2_dotstream_p50_32row_aes192_packet_gate.cjs
```

Manual read-only Node 22 CI: [run 45295317181](https://github.com/FlareZ123/liber-primus/actions/runs/45295317181) — success.
