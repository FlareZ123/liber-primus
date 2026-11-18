# Original 05.jpg contains an exact reversed JPEG prefix after EOI

**18 November 2026, Agent30. Classification: byte-exact source anomaly; not a cipher, plaintext, or newly recovered payload.**

## The bounded source observation

Census of the unchanged 75 original `resources/liber-primus/00.jpg` through `74.jpg` shows **one and only one** JPEG with bytes after the final `FF D9` end-of-image marker: **`05.jpg`, a first-release LP1 page** (not unsolved LP2 physical p05).

- Original file length: **673,066 bytes**. Full-file SHA-256: `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`, Git blob SHA-1: `2829e13812015601ff1014cb4427587b4a8aa3a6`.
- Last `FF D9` occurs at zero-based offset **600,364** and ends at offset **600,366**.
- Trailing bytes have length **72,700**. For **every** integer `0<=i<72700`, the trailer byte `file[600366+i]` equals `file[72699-i]`. That is, **`file[600366:] = reverse(file[0:72700])`**, byte-for-byte.
- The complete trailer begins `00 FF AA 4D` and ends in reverse order with `... FF D8 FF`; when reversed it has a JPEG SOI/JFIF header. The reversed fragment is an exact copy of the already-present **prefix of the same file**, with **zero novel byte information**.
- The other **74** original JPEGs have final `FF D9` at end of file and zero trailing bytes.

The anomalous source blob is also byte-identical to archives at [iBotPeaches](https://github.com/iBotPeaches/cicada_3301/blob/master/liber_primus/05.jpg) and [krisyotam](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/pages/05.jpg), as their GitHub source objects share the blob SHA-1 `2829e13812015601ff1014cb4427587b4a8aa3a6`. These archives may inherit a common copy; their agreement does not by itself authenticate creator intent or the original upload stage.

## Interpretive and solve-path limit

The append is mechanically deliberate or a reproducible historical editing/copy artifact, but its origin cannot be inferred from byte equality alone. A player browsing the rendered page would not see the suffix. The broad *read in reverse* hypothesis is unsupported as an LP2 cipher instruction, especially because the affected page belongs to the already-solved LP1 set. There is **no previously absent secret file, entropy, key material, original unsolved-page plaintext or author-selected reversible GP29 operation** in these 72,700 bytes.

**Decision:** retain this single exact anomalous source observation as a cheap check for future historical artifact reconstruction. Do not commission reversal/727/72700 positional-key sweeps based solely on this anomaly. Any upgrade must locate independent first-party instruction selecting the raw JPEG suffix or a second original-source payload with a discriminating unknown-page receiver.

## Reproduction

[Read-only Node 22 CommonJS SFT](../sims/lp1_05_reverse_trailer_sft.cjs) enumerates the complete 75-image corpus, checks the exact reversal and the original SHA-256, and asserts that the other 74 have no EOI suffix. Executed against the user's uploaded original 75-image ZIP (whose `05.jpg` Git blob SHA-1 equals the committed repository's byte content) under Node **v22.16.0**, with the output:

```text
05.jpg: JPEG EOI at byte 600364; reversed-prefix trailer exactly 72700 bytes; SHA256=2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7
PASS: 75 original JPEGs (52248065 bytes) checked; 1 reversed-prefix trailer; no additional suffix payload.
```
