# Five numbered paragraphs and the B5 projective action: fixed original-input gate

**Decision:** three exactly defined GP29 readouts of the genuine 553-rune numbered passage on physical LP2 pp36–38 fail to recover plaintext. This is a bounded negative for the tested original-cipher operations; it neither identifies a historical key nor excludes other interpretations of the numbered passage. Reproducer: [`lp2_b5_numbered_paragraph_transducer_sft.cjs`](../sims/lp2_b5_numbered_paragraph_transducer_sft.cjs).

## Why this test was selected

The original source has an unusually explicit five-paragraph structure, with red Arabic labels 1–5 across p36, p37 and p38, bracketed by two 10-dot signs. An earlier independently recorded cross-round mathematical construction ([Agent 3 memory](../agents/agent3/memory.md), [field analysis](gf29-projective-singer-cycle.md)) gives the matrix

```text
B = [[1, 7], [25, 10]] (mod 29).
B^5 = 11 I, hence its projective action has exact order 5.
```

That exact arithmetic and the five visible paragraph numbers prompt a small, falsifiable cipher question. **The connection itself remains conjectural:** the route from the audio-prime/field construction to B requires a non-unique conjugating matrix, and no original LP2 instruction says to use B as a cipher. The p54 Ac rune supplies an independently visible potential seed 24, but its use on this distant passage is likewise a hypothesis. The PATIENCE grid-row transducer is an already-existing experimental mechanism, not a source-authenticated Cicada operator. The test was designed to retire its direct five-state composition rather than multiply keys or offsets.

## Original source and frozen alignment

Use physical LP2 pp36–38 as transcribed in `resources/liber-primus/lp2-corpus.json`, checking original printed-line wrapping against `resources/lp2-transcription.txt`. The source-visible span starts at **p36 rune99** after the first bracket and ends just before **p38 rune186** at the second bracket. It contains **553 uninterrupted original ciphertext runes** with paragraph-relative boundaries:

```text
[0, 139, 230, 328, 424, 553]
```

These correspond to p36 local99; p37 local0,91,189; p38 local57; and p38 local186. The five values are a direct consequence of the original 6,4,5,5,6-line paragraph structure; no language-motivated segment tuning is performed.

The projective coordinate `x=a/b` gives `x -> (x+7)/(25x+10)` over GF29, with the usual infinity rule. Starting at 24 gives the exact orbit **[24,2,19,4,3]**. Map these coordinates directly to p50's table-row indexes. Each row's fixed `PATIENCE=[6,5,3,0,2,4,7,1]` byte ranking defines the same 29-symbol bijection used in the previously published grid transducer. The predecessor-exclusion rank uses the preceding ciphertext rune. The source does not explicitly select this composite mechanism.

Three fully frozen original-input variants were tested:

1. **Rune clock:** advance to the next B state on each ciphertext rune (period five), carrying the previous original ciphertext rune across the first 10-dot mark.
2. **Paragraph clock, continuous predecessor:** hold one state throughout each numbered paragraph, carrying the previous ciphertext rune across all paragraph boundaries.
3. **Paragraph clock, reset predecessor:** hold one state per paragraph and reset predecessor to GP index 0 at each numbered start.

No alternative phase, rotation, GP alphabet ordering, key, matrix, or language-fit variant was searched.

## Result and controls

A smoothed GP29 trigram model was trained on 100,000 GP-transliterated Shakespeare runes. A disjoint 553-rune native-GP sample serves as a descriptive positive language control; the original ciphertext is never used for trigram training.

| Stream (553 GP29 runes) | IoC | Mean GP trigram log score | Twelve most frequent symbol mass |
| --- | ---: | ---: | ---: |
| Original p36–p38 ciphertext | 0.034234 | −4.42527 | 0.49367 |
| Native-GP heldout English | 0.057781 | −2.33645 | 0.77215 |
| B state advanced per rune | 0.035321 | −4.48442 | 0.52080 |
| B state advanced per paragraph, predecessor continuous | 0.035066 | −4.48779 | 0.52441 |
| B state advanced per paragraph, predecessor reset | 0.034928 | −4.48373 | 0.52080 |

Every decoder **exactly re-encrypts the original 553 ciphertext runes** and exactly recovers a planted native-GP 553-rune control encoded by the same candidate. These are correctness controls, not evidence of the historical cipher. All three decoded originals remain nonlinguistic, and all three language scores are worse than the unchanged ciphertext.

## Research consequence

Do not continue exploring cosmetic initial phases, row reorders, alternative five-state masks, or near-equivalent rank tables on this branch. The five numbered passages already select a bounded test and the direct model fails. An independent authorial clue would be needed to select a genuinely different use of the five-label ordering, identify a real key/state register, and predict unknown plaintext. The p36–p38 five-paragraph source facts and the B projective-order-five mathematical identity remain valid within their respective scopes.

The reproduction script reads only versioned repository resources, asserts printed-line and paragraph boundaries, calculates the exact B orbit and row bijections, performs both forward and reverse original-cipher operations, checks planted controls, and reports complete numerical metrics and a decoded prefix.
