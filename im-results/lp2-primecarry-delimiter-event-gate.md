# #3242 — Prime-carry delimiter event framing

**Agent16 · 27 November 2026. Classification: exact bounded negative for one source-selected framing construction. No unknown LP2 plaintext or key recovered.**

## Construction

This test uses an already authenticated Cicada operation rather than a free delimiter classifier.

The solved p56 cipher is reproduced exactly as:

- GP29 indices 0..28;
- plaintext **F = 0** is transmitted literally and consumes no prime;
- every other rune consumes successive primes beginning at 2;
- shift (K_j=(p_j-1)mod 29);
- (C=(P+K_j)mod 29).

The proposed event channel is the ordinary arithmetic carry bit. After a shifted rune, print a word-divider event iff the unreduced sum crosses 29:

[
E=1 iff P+K_jge 29 iff C<K_j.
]

A literal F emits (C=0,E=0) and holds the prime clock. Therefore (C,E) plus the shared prime clock form a deterministic inverse. In particular, (C=0,E=1) identifies a shifted non-F rather than literal F. The delimiter is **not** assumed to be a plaintext space.

The clock resets to prime 2 at book start and at the source-visible `$` chapter boundaries. This transfers the only authenticated p56 start condition; no phase sweep is permitted.

This is a period-available manual operation: modular addition, carry/borrow, and a shared prime list. It is distinct from the rejected local cut lookup (#2716), word-length exception code (#1456), arbitrary boundary-rank, mod30 differential, Feistel, and 14-column/φ framing branches.

## Positive controls

The cipher core reproduces the authentic solved p56 ciphertext **85/85 runes exactly** from the pinned source-native plaintext. It consumes 84 primes (one literal-F hold). Adding the hypothetical carry side channel produces 38 event bits, and the same decoder recovers all 85 plaintext runes exactly.

For a held native-language plant, the 95-rune solved p57 parable is treated as a source of native GP words, its true word separators are removed, and its word sequence is repeated eight times:

- 760 plaintext runes, 160 hidden true word ends;
- carry-framing encoder emits 304 delimiters;
- exact inverse recovers **760/760** plaintext runes;
- only 87/160 true word ends coincide with carry events (carry-vs-space F1 0.375).

Reversing the p57 word order before encryption is an equal-inventory shuffled-word control:

- 760 plaintext runes, 160 hidden true word ends;
- 296 carry events;
- exact inverse again recovers **760/760** runes;
- carry-vs-space F1 0.3816.

Thus the transducer succeeds when present and does not depend on preserving plaintext word boundaries or word order. Reconstructed rune plaintext would still require an independent language segmentation step; the event bits themselves deliberately do not encode ordinary spaces.

## Original-input exact support test

The canonical p0–55 transcription has 2,727 hyphen characters but **2,726 binary hyphen-bearing rune gaps**; one gap at rune offset 2565 is `-7-`, containing two hyphens around the literal digit 7.

Treat each hyphen-bearing gap as (E=1), all other rune gaps as (E=0), and apply the authenticated p56 clock from prime 2 at each `$` chapter start.

Every unknown chapter becomes impossible essentially immediately:

| chapter rune range | length | first impossible local offset |
|---|---:|---:|
| 0–728 | 729 | 3 |
| 729–1873 | 1,145 | 1 |
| 1874–3611 | 1,738 | 3 |
| 3612–5505 | 1,894 | 1 |
| 5506–6526 | 1,021 | **0** |
| 6527–7959 | 1,433 | 2 |
| 7960–9639 | 1,680 | 1 |
| 9640–12955 | 3,316 | 2 |

Examples of exact contradictions include a predicted carry where the source has no hyphen (chapter 0, local offset 3) and a source hyphen where the arithmetic cannot carry (chapter 1, local offset 1). These are support failures before English scoring or inferred word boundaries.

For a descriptive held-page diagnostic, force the clock to continue despite contradictions, using observed (C=0,E=0) only to identify literal-F holds. On untouched p40–55:

- actual hyphen-event rate: **0.20808**;
- predicted carry-event rate: **0.42370**;
- accuracy **0.55458**, versus **0.79192** for the trivial no-boundary majority baseline;
- precision **0.21993**, recall **0.44783**, F1 **0.29499**, MCC **0.02502**;
- a physical line-break baseline has accuracy 0.76478 and F1 0.07143.

The development p0–39 numbers are essentially the same (carry F1 0.30010, MCC 0.02551), so there is no held-page gain hidden by a reset choice.

## Decision

**Reject this exact source-selected delimiter-event receiver.** It is a complete, lossless construction on positive controls, but the original printed hyphens contradict the p56 prime-carry grammar within at most three runes of every `$`-defined unknown chapter. No key phase, boundary fit, or language model is needed for the rejection.

The result does **not** reject carry/event framing generally. A successor requires a different independently selected state/key schedule or a different reversible event predicate. Do not rescue this branch by sweeping prime phases, reclassifying arbitrary punctuation as carries, or fitting delimiter offsets after seeing the original.

## Reproduction

`sims/lp2_primecarry_delimiter_event_sft.cjs`

Pinned inputs:

- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/external/relikd-solved-gp29-native-v1.json`

The computational core was also executed directly in the connected JavaScript runtime. Standalone Node/CI was not separately run.
