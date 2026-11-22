# 2014 onion 256-byte objects as per-page GP29 pads — negative gate

**Date:** 2026-11-12  
**Status:** bounded original-input screen; no plaintext recovered.

## Question and source selector

The independent Round44 campaign proposed testing the three 256-byte 2014 hidden-service objects as page-local mod-29 pads, using the F3/J6 source join and the R28-L2 key-sweep harness. This is a materially different use from the already-tested global repeating-key, AES/ChaCha, XOR-grid, and p53-red-span interpretations.

Inputs are the three `sourceServices` entries in `resources/cicada-hiddenservice-256-candidates.json` (`onion2`, `onion3`, `onion4`). The `onion2` capture is explicitly mutable/nonterminal; none of the three is independently authenticated as an LP2 key.

## Exact original-ciphertext test

Target: all 55 rune-bearing unsolved pages with page number below 56. Page 50 is a numeric-grid-only page and has no rune sequence, so it is not counted as a text target.

For each blob, six deterministic GP29 streams were tested: raw bytes mod 29; reversed raw bytes mod 29; interleaved high/low nibbles mod 29; reversed nibble stream; big-endian byte pairs mod 29; little-endian byte pairs mod 29. For every page and stream, offsets 0–20 and both additive signs were tested. Key streams cycle modulo their own lengths (256, 512, or 128). Total: 55 × 3 × 6 × 21 × 2 = **41,580 configurations**.

Scores use the KJV-weighted English quadgram table and GP transliteration used by the R28-L2 harness: mean log10 quadgram probability with a 0.01 unseen-gram floor. The scoring input is `Dukotah/cicada3301/liber-primus/data/english_quadgrams.txt`; the reproducer accepts this file as its first argument rather than vendoring it.

## Positive control

A synthetic p57 ciphertext was made from known p57 plaintext using `onion3`, raw bytes mod 29, offset 7, and encryption sign +1. The sweep recovered the exact inverse configuration (decrypt sign −1) and **95/95 runes**; normalized quadgram score **−4.420633**. The control validates transliteration, scoring, offsets, signs and sweep plumbing.

## Original-input result

No candidate passes. The best real candidate is p55, `onion2`, big-endian byte-pairs mod 29, offset 15, sign +1, score **−6.396836**. The next candidates are p55/onion2/pair-BE/off9 (−6.419914), p49/onion4/reversed-bytes/off4 (−6.459028), p51/onion2/pair-LE/off18 (−6.495109), and p51/onion2/bytes/off20 (−6.591928).

Best score by blob:

| Blob | Best page/stream | Score | Family-wise 1% bar |
|---|---|---:|---:|
| onion2 | p55, byte-pairs BE, offset 15, +1 | −6.396836 | −6.003102 |
| onion3 | p49, byte-pairs LE, offset 16, +1 | −6.613520 | −6.126423 |
| onion4 | p49, reversed bytes, offset 4, +1 | −6.459028 | −5.743520 |

The conservative overall family-wise bar is the maximum of the three Bonferroni-adjusted per-blob bars: **−5.743520**. Higher scores are better. The best real candidate is 0.653 below the bar; no page yields coherent plaintext. The repeated p27/p54 visual anchor is not positive under this family.

Null calibration used 12 deterministic byte shuffles per blob (36 total), seed `0x441200 + 100·blobIndex + run`. Each null run repeated the full per-page/transform/offset/sign sweep for that blob. Per-blob Gumbel thresholds use `alpha=0.01/3`; full maxima and fitted parameters are emitted by the reproducer.

## Interpretation and limits

This rejects the tested **direct page-local additive GP29 pad** interpretations of these three blobs, including the stated byte/nibble/pair encodings and offset range. It does not reject the blobs as encrypted payloads, non-additive KDF inputs, or inputs to a different independently selected operation. Do not expand offsets, encodings or skip parameters without a new source selector.

## Reproduction

```sh
node sims/lp2_onion_256_per_page_mod29_pad_gate.cjs /path/to/english_quadgrams.txt
```

The script reads the candidate JSON and LP2 corpus from `resources/`, reproduces the p57 plant control, 41,580-case original sweep and 36 shuffled null runs.

## Sources

- Local candidates: `resources/cicada-hiddenservice-256-candidates.json`.
- Local rune corpus: `resources/liber-primus/lp2-corpus.json`.
- [Round44 campaign plan](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/CAMPAIGN-PLAN.md).
- [Round43 F3 key-localization](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F3-hand-feasibility/KEY-LOCALIZATION.md).
- [Round28 L2 keysweep](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round28/L2/keysweep.py) and [English quadgrams](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/data/english_quadgrams.txt).
