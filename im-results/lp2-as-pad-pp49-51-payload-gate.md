# LP2-as-pad inversion against the pp49–51 canonical payload (F-01 T5)

## Decision

**Negative for the specified construction.** The image-adjudicated 256-byte pp49–51 payload does not decode as English when treated as ciphertext under the complete LP2 rune stream using the preregistered skip-aware additive GP29 model at offset zero. The positive control passed, but every real configuration fell well below the preregistered score threshold. No plaintext or key recovery resulted.

This completes the previously skipped T5 target in the independent F-01 test. It does not exclude other uses of LP2 as key material, other offsets, or unrelated cipher families.

## Source and exact inputs

- Target: `Dukotah/cicada3301/liber-primus/analysis/pp49_51/canon_256.bin`, exactly 256 bytes.
- Target SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- The canonical byte stream is the image-adjudicated version. The archived A04 adjudication identifies `canon_256.bin` as the image-derived stream and supersedes the decimal-preferred fork.
- Target conversion: each byte reduced modulo 29, matching the F-01 payload loader.
- Key: all 12,956 LP2 rune indices, in original corpus order.
- LP2 stream SHA-256 (comma-separated numeric indices): `023312066df471005264b9cbe7997cb77d2a9a6a2dc9b3316d22674023af1585`.

The external implementation and payload were pinned to Dukotah commit `9087dc36b5aa64c1786428e32180261ab9420c29`.

## Method

Used the independent F-01 `skipdecode.beam_decode` implementation with:

- beam width 400;
- maximum skip depth 3;
- key offset 0;
- key variants: forward, reverse, Atbash, and modular negation;
- arithmetic signs −1 and +1;
- preregistered acceptance score ≥ −5.5.

The positive control passed, recovering its planted 95-character English plaintext with 100% character recovery. The real-target null stage was conditionally triggered only for a best real score of at least −6.0; the observed best score was below that gate, so no null computation was warranted.

## Results

| Key variant | Sign | Score |
|---|---:|---:|
| LP2 forward | −1 | −7.1148 |
| LP2 forward | +1 | −7.4498 |
| LP2 reverse | −1 | −7.3337 |
| LP2 reverse | +1 | −7.4173 |
| LP2 Atbash | −1 | **−7.0933** |
| LP2 Atbash | +1 | −7.4843 |
| LP2 modular negation | −1 | −7.4498 |
| LP2 modular negation | +1 | −7.1148 |

The best candidate is Atbash with negative arithmetic, score −7.0933. Its output is not intelligible plaintext. All eight scores are below both the −5.5 acceptance bar and the −6.0 null-trigger gate.

## Interpretation and limits

The test rejects this exact direction and model: `canon_256.bin mod 29` as ciphertext, the complete LP2 stream as running key, the eight preregistered key/sign configurations, and offset zero. It does **not** establish that LP2 cannot serve as a key under another conversion, alignment, or cipher family. The byte-to-GP29 reduction is lossy, and this test does not search arbitrary offsets.

## Reproduction

- Runner: [`sims/lp2_as_pad_pp4951_t5.py`](../sims/lp2_as_pad_pp4951_t5.py)
- Workflow: [`lp2-as-pad-pp4951-t5.yml`](../.github/workflows/lp2-as-pad-pp4951-t5.yml)
- CI run: [43717616506](https://github.com/FlareZ123/liber-primus/actions/runs/43717616506)
- F-01 preregistration: [Dukotah commit-pinned PREREG.md](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round16/F-01/PREREG.md)
- Decoder: [Dukotah commit-pinned sweep.py](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round16/F-01/sweep.py)
- Canonical payload: [canon_256.bin](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/pp49_51/canon_256.bin)
- Image adjudication: [A04 FINDINGS.md](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/archive/branches-2026/claude_cicada3301-repo-review-wg0i9w/liber-primus/analysis/pp49_51/A04_glyph_adjudication/FINDINGS.md)
