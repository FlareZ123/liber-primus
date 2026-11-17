# LP2 p0 cross-caption hypothesis: one exact 8+5 title and original-cipher test

**Agent 11, 17 November 2026. Status:** the first-party printed image supplies a concrete iconographic caption of the opening chapter, but the proposed title/plaintext and historical GP29 cipher transfer **fail** an exact original-source inverse. No unknown-page plaintext, authentic heading, title operation, key or destination has been recovered. Director [#1363](https://github.com/FlareZ123/liber-primus/issues/1363).

## Why this specific title rather than a new keyword sweep

The unchanged May 2014 original LP2 p0–2 images (archive original `17.jpg`–`19.jpg`) each display a pair of three-bar crosses *exactly 180° apart*, with the ink graphics related by an almost perfect centrally symmetric half-turn. This visual fact and its p1/p2 repetition were already established; see [original pixel and cipher reports](lp2-p0-central-cross-rotation-original-gate.md) and [iconographic comparator](lp2-p0-p2-orthodox-cross-source-plate-gate.md). The source does not say that the crosses are a cipher operation.

The original p0 red title has eight GP29 runes, a small red dot, five GP29 runes, and a large red 13-dot marker. The natural caption **INVERTED CROSS** has precisely **8+5 GP29 runes** in the authentic Cicada spelling **`INUERTED CROSS`**, where historical GP runic U represents Latin V. This is a *visually selected whole-title candidate*, not a decoded text or an authored caption. It is nonunique: **REVERSED CROSS** is another 8+5 native-GP description of the same pair, and the crosses themselves may simply decorate the opening chapter. We did not search a family of cross titles to optimize a language score.

A 2014 player could plausibly read a 13-rune title through the original historically demonstrated Liber Primus LP1 Koan 13-symbol GP29 repeated-key Vigenère mechanism with the authentic transparent-plaintext-F rule. This is one precise, fully reversible and previously demonstrated cipher family; the original author has not instructed solvers to reuse it for LP2. Freeze its phase0 initial heading position and derive the **entire** 13-symbol key from the hypothetical title. No key fitting on black-body source, sign menu, phase sweep, guess about ciphertext-F bypass, phrase variants or artificial boundary adjustment enters the test.

## Exact original result

Original printed p0 title indices:
`[15,8,18,3,6,19,27,0,15,26,18,21,5]`.

Proposed native title `INUERTED CROSS` indices:
`[10,9,1,18,4,16,18,23,5,4,3,15,15]`.

With `C = P+K (mod29)`, their unique implied key is:
`K=[5,28,17,14,2,3,9,6,10,22,15,6,19]`.

All 13 proposed plaintext symbols are non-F, so each consumes a key position. The initial title enciphers exactly, as guaranteed by deriving the key from its assumed plaintext. The large red marker occurs immediately after rune12, and the 716-rune black body begins at zero-based rune13. Repeating the 13-key thereafter:

- Exhaustively retain every historical plaintext-F interpretation, where the literal plaintext GP-F emits ciphertext F and consumes **no** key symbol; an encountered ciphertext F may instead be consumed if decrypting it yields a non-F rune.
- From the first black rune, propagate every possible legal key clock without language scoring. The number of live clocks never exceeds **three**.
- **Every legal clock becomes impossible at original chapter-relative zero-based rune137, still on physical p0.** The original black-body decoder cannot reach the next physical page.
- The simple no-F-skip all-black-body native-GP IoC is **0.034320428175176776**, close to uniform **1/29**, and its first four decoded symbols are `Y EO E J`, with no legible four-rune word.
- A separate test encrypts all **95 authentic clear GP29 p57 runes** with this exact speculative key and real native-F emitter; the same complete state inverse accepts all 95/95. Exact known-path decoding and reencryption recover the original 95-rune source. This validates the decoder's treatment of F but does not validate the hypothesis.

The standalone [CommonJS original-source SFT](../sims/lp2_p0_inverted_cross_8plus5_title_fclock_sft.cjs) asserts the original 729-rune opening, exact 13-rune printed values, GP-native caption and key, first impossible rune137, body IoC, and authentic complete positive. It passed [Windows Node22 manual CI run 44117413026](https://github.com/FlareZ123/liber-primus/actions/runs/44117413026). The [manual workflow](../.github/workflows/agent11-p0-inverted-cross-title.yml) can repeat the gate.

## Decision

The 180° original decoration is a **real source-visible operation** and makes a concise English title speculation possible, but the manuscript does not authenticate *INVERTED CROSS* as plaintext, does not identify that phrase as a key, and supplies no reason to transfer the known LP1 13-phase cipher. The one frozen source-plausible model is **mathematically incompatible** with the original full black body under the authentic F-transparent rule; its first four body runes are already nonprose under the naive variant. A distinct title or cipher operation is left open, but should be pursued only after a **new original operand or explicit authored instruction** selects it. The separate preexisting 27×27 chapter and cross-half-turn routes already tested simple reversals and source-selectors without genuine plaintext; they are not repeated here.

The general p0 title-to-instruction route currently lacks the essential discriminating observation: a 2014 player-visible cue translating the 13 literal original red runes into a unique executable **decoder and key/state source** that makes a blind black-body prediction. Neither a correct length match nor a successful key-by-crib title replay is cryptanalytic recovery.
