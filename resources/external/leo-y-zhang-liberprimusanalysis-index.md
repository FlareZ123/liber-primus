# Independent Liber Primus research index: Leo-Y-Zhang/LiberPrimusAnalysis

**Snapshot inspected:** 2026-11-15T00:48:01.253Z. Latest repository commit: `0b907164e95e3a44ee74c1d28efbf4688b770865` (2026-10-29T12:03:52Z).  
**Source:** https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis  
**License:** Proprietary source-available; read/run/check permitted by its notice, but no code or documentation reuse rights are granted. This index paraphrases findings and links only.

## Main report

The 6–7 September 2026 report reproduces nine known solved-page cases from two public transcriptions and reports no new plaintext. It characterizes the 12,956 unknown runes as consistent with a chain cipher whose step is a flat, aperiodic 28-symbol stream, and concludes that public key sources do not satisfy its fingerprint. This is a model interpretation, not a recovered cipher or proof that the remaining pages are information-theoretically unrecoverable.

**Important comparison caveat:** its report counts 2,921 words, while this repository's canonical unknown-page corpus has 2,896. A direct parse of its nine `relikd/LiberPrayground` LP2 section files reproduces the entire 12,956-rune stream exactly and yields 2,900 word segments; the four additional boundaries are apostrophes at absolute rune offsets 1110, 5138, 8515 and 10089. The observed lag-five statistic is unchanged under both segmentations (104/2,105 hits; nine contiguous pair events), and the same 2,000/5,000 per-word multiset/length/adjacent-repeat conditional null remains significant under the alternate segmentation (single-family p=0.01180; pair-family p=0.00060). The published 2,921 aggregate is not reproduced by this direct parse and its exact accounting remains unclear. Its unconditioned lag tests therefore do not refute this repository's word-conditioned lag5 result; see [the independent segmentation check](../../im-results/lag5-contiguous-echo-second-order.md).
## OutGuess result relevant to current Issue #958

The report dated 7 September says it ran Debian `outguess 0.2` over all 75 page images with no key and 96 candidate keys, yielding 4,521 non-empty payloads (115 MB). It reports that:
- no-key extraction reproduced the documented 2014 payloads on pages 00–03, 08, and 10–13 byte-for-byte;
- the no-key payloads from unsolved pages were uniform-looking 58,152-byte noise;
- keyed extractions were repetitive artifacts from similar white-page DCT coefficients, with no PGP marker, onion address, URL, or useful low-entropy payload;
- a SHA-512 hash hunt over 692,438 archive candidates plus all 4,521 payloads found no page-56 hash match;
- archive files, page JPEG bytes, and selected OutGuess payloads were also screened as running keys, with no positive result.

This is a useful prior for the current Issue #958, but it is bounded to the reported OutGuess version, 96 keys, archive snapshot, and candidate-generation procedure. If Issue #958 seeks exact documented outputs, compare byte-for-byte against these known payloads rather than repeating the broad scan. Do not interpret the result as excluding every conceivable OutGuess key or tool version.

## Primary external references

- Repository: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis
- Statistical report: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md
- OutGuess results: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/outguess/RESULTS.md
- Dataset construction: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/build_dataset.py
- Word/rune parsing: https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/lp.py

No third-party code was copied into this repository.
