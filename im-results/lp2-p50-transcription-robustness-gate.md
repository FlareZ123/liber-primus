# P50 low60 association: original-image transcription robustness gate

**Director task:** #1544  
**Date:** 18 November 2026  
**Classification:** source-integrity result. No new cipher operation or plaintext is recovered.

## Decision

The p50 low60 / leading-zero adjacent-repeat association is **transcription-robust under the repository's current original-image ambiguity record**. The formal source-admissible family contains exactly **one p0-p55 rune stream**: the canonical image-adjudicated corpus. The complete original-image audits leave no unresolved alternate rune identity among the 12,956 unknown-page rune positions.

Under that sole admissible stream, the frozen phase-zero test reproduces the established result exactly:

- selected low60 opportunities: **3,025**
- selected adjacent-equal events: **33**
- outside opportunities: **9,876**
- outside adjacent-equal events: **53**
- total events: **86**
- nine-chapter leave-one-out predictive gain: **+4.5848931753 nats**
- positive held-out enrichment direction: **9/9 chapters**

The signal therefore does not depend on choosing among unresolved original-image rune readings.

## Why the admissible family is singleton

The candidate set was restricted before the statistical rerun to source readings that remain genuinely unresolved in original pixels.

The repository's full original-JPEG assignment audit registers all **12,956/12,956** p0-p55 rune positions. It reports no ordinary black-text correction. Its former line-registration ambiguities are resolved as unique image-to-transcript mappings. The separate red-rune audit accounts for all **79/79** earlier machine disagreement flags through registration drift, joined components, punctuation fragments or ornate initials, and it finds no source-supported rune change. The p53 51-rune red passage retains all canonical labels.

Historical transcriptions do contain alternate labels, but the original scans have already rejected the relevant p0-p55 alternatives:

| Position | Historical alternate | Canonical source reading | Original-image decision |
| --- | --- | --- | --- |
| p24 rune172 | A | AE | original 41.jpg supports AE |
| p27 rune93 | B | U | original 44.jpg supports U |
| p57 rune80 | E | Y | original 74.jpg supports Y; p57 is outside the p0-p55 test |

The p0 red-heading dispute changed an earlier interpretation of a marker boundary rather than a rune identity; the original image preserves the canonical 13 red runes. The p15 and p53 arrow claims were also resolved as enlarged canonical GP runes rather than extra directional glyphs. These source-settled cases are not admissible branches for the formal #1544 test.

## Source-rejected historical sensitivity controls

For extra sensitivity only, the reproducer applies the two old p0-p55 historical label errors even though original pixels reject them. It tests p24:172 AE→A, p27:93 U→B, and both substitutions together.

All three controls produce **exactly the same 86 adjacent-equal event locations and the same frozen p50 statistics** as the canonical source:

- **33/3,025** selected events;
- **53/9,876** outside events;
- **+4.5848931753 nats** summed nine-chapter held-out gain;
- **9/9** positive held-out directions;
- the complete nine fold gains are byte-for-byte numerically identical to the canonical calculation.

Those two historical errors do not touch an adjacent-equal pair, so even admitting them contrary to the source images would leave the p50 effect unchanged.

## Reproduction

- SFT: `sims/lp2_p50_transcription_robustness_sft.cjs`
- Windows Node22 source run: https://github.com/FlareZ123/liber-primus/actions/runs/44393464474
- canonical source audits:
  - `im-results/lp2-full-source-rune-assignment-audit.md`
  - `im-results/lp2-red-rune-image-adjudication.md`
  - `im-results/idkfa-2016-transcription-crosscheck.md`
  - `im-results/p27-rune93-source-adjudication.md`

The SFT reads the canonical corpus and p50 table directly, reproduces the frozen #1508 opportunity/event inventory and nine-chapter likelihood, then runs the two source-rejected historical controls separately.

## Consequence

No blind visual adjudication prerequisite remains for this p50 association under the current source record. Future work may treat the 33/86 phase-zero low60 enrichment as stable with respect to known transcription history. A newly discovered original-image ambiguity would reopen this gate only if it changes a same-page adjacent-equality relation at a position relevant to the frozen clock.

This result strengthens input integrity only. It supplies no opcode, key, reset instruction or unknown plaintext.
