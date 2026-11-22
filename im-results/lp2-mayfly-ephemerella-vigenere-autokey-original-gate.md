# Literal *Ephemerella ignita* key fails 36 original mayfly GP29 Vigenère and autokey inverses

**Agent50, 22 November 2026. Source-first plaintext attempt; bounded negative, no new unknown plaintext.**

## One unusually concrete candidate source of an actual key

The bilateral mayfly printed repeatedly beside Liber Primus physical pp24–26 appears to match the inverted *Ephemerella ignita* specimen 5 in *Wings XIV*, Figure 4. The artwork attribution is documented in [the earlier original-artwork and article reconstruction](lp2-metafysica-wings14-figure-prose-key-source-gates.md), with the illustrated source [here](https://www.metafysica.nl/wings/wings_14.html) and [source image](https://www.metafysica.nl/wings/thieme_90.jpg). The illustration is credited to Severa in J. Zahradník's 1977 *Thieme's Insektengids*. The figure provides a human-recognizable **Latin species name** as an exact candidate key without choosing it to fit ciphertext.

The prior test tried the *full visible modern website text* as a nonrepeating GP29 pad, and found no prose on pp23–26. A much cheaper, genuinely different historical operation is the repeating-name **Vigenère key** or one of its two classical **autokey continuations**, familiar transformations a 2014 solver could have attempted on the supplied GP29 alphabet.

This is a **candidate human clue**, not proof that Cicada intended the species name, a Vigenère cipher, or even the scientific figure's 1977 source book as a key. The metadata dates on the current website do not prove its exact 2014 wording; the candidate Latin name is the identifiable illustration's species label, not an invented nonce.

## Immutable candidate and reversible operations

Using the canonical 29 runes and the manuscript's solved ING/IO orthography, the unpunctuated literal original-name key is **17 GP runes**:

```text
EPHEMERELLAIGNITA
E  P  H  E  M  E  R  E  L  L  A  I  G  N  I  T  A
18 13  8 18 19 18  4 18 20 20 24 10  6  9 10 16 24
```

The same unchanged `resources/liber-primus/lp2-corpus.json` and original page-marker transcript supply **p23=213, p24=270, p25=273, p26=265** GP ciphertext runes. P24–26 contain **178 complete printed page-local word slots after the three unfinished page-leading word fragments are excluded**. Their rune values still participate in every tested cipher clock.

Freeze three textbook GP29 cipher families, each with both additive directions `P=(C+K) mod29` and `P=(C−K) mod29`:

1. Periodic Vigenère: `K_t = species[t mod17]`.
2. Plaintext autokey: first 17 consumed keys are the species, then `K_t=P[t−17]`.
3. Ciphertext autokey: first 17 consumed keys are the species, then `K_t=C[t−17]`.

For each, three author-visible clock boundaries are tested: reset on each physical page, reset at illustrated p24 and continue through p25/26, or start at illustrated p23 and continue through p26. Two strictly determined F rules are checked: **every source ciphertext rune consumes a key position**, or the literal ciphertext GP-F rune (index 0) emits F and does not advance the clock. **Important:** this deterministic ciphertext-F rule is a *diagnostic*, distinct from the genuine solved-page **plaintext-F-transparent** encryption, where an F ciphertext can have multiple possible predecessors. The latter's full branching inverse is not claimed covered.

Thus a total of exactly **3 families × 3 source clocks × 2 signs × 2 F diagnostics = 36 frozen original-input inverses**, with no fitted key phase, text offset, extra seed, word-boundary mutation or arbitrary species-name spelling.

## Results on the original manuscript

All 36 decoded original p24–p26 streams remain near uniform, and even the best whole-word count is sparse and confined to very short tokens. The unchanged pinned TextBlob source vocabulary maps to **29,060 unique native-GP forms** (including A/I/O). It is used *only as an evaluator* of the fully frozen candidate decodings, with no dictionary-chosen original key or cipher parameter.

| Frozen source-name inverse family | Maximum source-printed complete native-GP word matches (out of 178) | English-like long-word evidence |
| --- | ---: | --- |
| 17-rune repeating name | **14** | At most one 4-rune dictionary word in a candidate, no phrase |
| 17-rune plaintext autokey | **19** | Zero 4-rune-or-longer dictionary words in the best candidate |
| 17-rune ciphertext autokey | **15** | Zero 4-rune-or-longer dictionary words in the best candidate |
| **All 36 variants** | **19/178** | **At most one** whole dictionary word length≥4 in *any* variant; the greatest run of adjoining complete dictionary words is **2** |

The globally best option is plaintext autokey, carried from p24 through p26, subtracting the species key and treating ciphertext F as a nonconsuming literal. Its exact per-page matches are **p24: 10, p25: 4, p26: 5** of 63,57,58 source words, respectively. **None** of its matched words is even four runes long. The isolated four-rune matches elsewhere are ordinary chance-like words `LIDS` and `PITS` from different bad hypotheses. They do not combine into syntactic plaintext.

A positive **actual source-shaped encryption** selects entire genuine GP29-native TextBlob words with the unchanged exact original p23–26 word-length profile, then encrypts all **1,021 page runes** under separately planted periodic, plaintext-autokey and ciphertext-autokey species-name machines using distinct frozen source clocks and signs. The same inverse reconstructs **all 1,021 original-shaped plaintext runes exactly** for each positive, and yields **178/178** genuine GP29 dictionary words on the target three pages. Full forward replay also passes. The F-transparent diagnostic branches were *not* used in these positives; their full ambiguity is outside the conclusion.

## Decision

The original, illustration-selected *Ephemerella ignita* name **does not directly decrypt the three pages** using the simplest historical GP29 name Vigenère or textbook autokey consumers, on any of the three source-motivated page clocks and either additive direction. There is no original unknown plaintext or key recovery.

This does not disprove a different authenticated source text, a hidden image-byte password derivation, genuine plaintext-F ambiguity, an independently selected secret phase, other key-consuming grammar, or the wider insect puzzle's significance. **Stop direct species-name key tuning** without a first-party opcode or receiver instruction; the name was a concrete low-cost candidate and its conventional inverses have been tested.

**Reproducer:** [Node.js22 CommonJS original-input source-shaped SFT](../sims/lp2_mayfly_ephemerella_vigenere_autokey_original_sft.cjs). The 36 original deterministic decodings and source-native word-count results were evaluated directly in V8 with the pinned remote primary sources on 22 November 2026, and the standalone SFT preserves matching source assertions, planted positives and the best-result invariants. No CI run is asserted.
