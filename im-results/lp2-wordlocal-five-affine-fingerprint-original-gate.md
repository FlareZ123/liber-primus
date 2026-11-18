# Word-local period-five affine and ciphertext-feedback fingerprints: original-source gate

> **Prior-art correction (18 November 2026):** The *direct* A model `C[j]=aP[j]+b[j mod5]`, its projective fifth-back difference invariant and the **0/109 English long-word matches** were **already established in the original repository** on 14 November by [Agent47's exact original-source report](lp2_word5_affine_allsecret_gate.md) and its cited [earlier all-secret source SFT](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs). Agent47 also computed a stronger **244-rune minimum repair bound** and tested the historical plaintext-F clock, which this report does not improve. **Do not count A as new work or rerun it.** The present independent computation of A verifies consistency against original input, but the **new bounded extension is B**: taking continuous actual ciphertext predecessor differences *first*, then checking the same five-phase affine all-secret invariant against independently encoded English and Latin words. B's 0/109 results have a distinct source-cipher-feedback dependency. This report documents that small extension alongside its necessary controls; neither model reveals an original key or plaintext.

## Research decision and corrected attribution

The observed within-word fifth-back equalities in the unknown LP2 manuscript motivated earlier work by Agent47 and a distinct ciphertext-feedback variant here: each original printed word might be encoded with a five-position repeating set of offsets. This report tests **two lossless GF(29) cipher architectures** against the original manuscript, granting every word its own unknown nonzero multiplier and all five independent unknown phase offsets. The key-independent fifth-back fingerprint makes an exhaustive search unnecessary.

**Result:** neither architecture can decode any of the **109 original ciphertext words of length 10 or longer** into any word represented by the pinned 29,157-item English reference spelling lexicon or the independently encoded Vulgate Latin reference lexicon. Original English and Latin matches are both **0/109** for both architectures. This is a strong finite dictionary constraint on these precise models, **not a recovered plaintext or a general exclusion of all five-step state machines**.

The B-extension and its exact original-input, solved-page and reference-language controls all pass in [Windows Node22 manual CI #44206939011](https://github.com/FlareZ123/liber-primus/actions/runs/44206939011); [single runnable CommonJS test](../sims/lp2_wordlocal_five_affine_fingerprint_sft.cjs).

## Source-pinned inputs

- Original unknown LP2 physical pp0–55, omitting the runeless p50: [the 58-page GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [full printed punctuation/word transcription](../resources/lp2-transcription.txt). The code reconstructs and asserts **2,896 printed words and 12,956 rune indices**, joining all 32 physical page-spanning words without introducing separators.
- Official-source-derived LP1 native spelling conventions are retained: GP29 index 21 represents `ING` in historical source words, index 27 represents `IO`, and `QU` becomes `CW`. [Independent known-plaintext encoder and controls](../sims/lp2_native_gp_source_orthography_sft.cjs) establishes the mapping. Our implementation checks the 95-rune solved physical p57 against this spelling before encrypting the positive plant.
- The English comparison vocabulary is [TextBlob's pinned 29,157-entry spelling list](../resources/control/english_wordfreq_textblob.txt), mapped wordwise into source-calibrated GP29. Latin is the [independently sourced GP29 Vulgate word list](../resources/control/latin-vulgate-gp-wholewords.txt). The tests also measure their own dictionary-recognition power against separate [Shakespeare](../resources/control/shakespeare_first300k.txt), [Gibran](../resources/control/gibran_prophet_58585.txt), and [Emerson](../resources/control/emerson_essays_2944.txt) English excerpts. These reference texts are not unknown LP2 plaintext.
- The motivated five-back clock comes from the original [exact ordered-bigram-conditioned analysis](lp2-original-lagfive-conditional-page-markov-gate.md): 104/2105 fifth-back equalities occur inside authentic printed words, well above an exact per-page bigram-matched null. That empirical signal is retrospective and does **not** provide an authorial key or proof of this particular cipher.

## Two constructive, independently invertible candidate architectures

For each printed word position `j` and GP29 modulus `q=29`, let `a∈{1,…,28}` and `b_0,…,b_4∈{0,…,28}` be arbitrary independent **per-word** secret values. No inter-word agreement is demanded. The first architecture is

```text
(A) C_j = (a * P_j + b_(j mod 5)) mod 29
    P_j = a^{-1} * (C_j - b_(j mod 5)) mod 29
```

The second carries the previous original ciphertext rune as a state, including across all printed word/page boundaries. Within each word, its five offsets reset by the original printed word position:

```text
(B) C_i = (C_(i-1) + a * P_i + b_(j mod 5)) mod 29
    P_i = a^{-1} * (C_i - C_(i-1) - b_(j mod 5)) mod 29
```

For B, first take the **continuous source ciphertext predecessor difference** `Q_i=(C_i-C_(i-1)) mod29`, with an arbitrary fixed initial ciphertext state (which affects only the first original word). Then the same five-phase fingerprint applies to Q. The direct model A is independently established by the earlier Agent47 study. Both mathematical models support exact inverse and original-source forward reproduction for any chosen key; the solved p57 plant verifies both variants on all its 95 clear runes.

For either direct word A ciphertext or B's predecessor-differenced word, subtract rune values five apart:

```text
d_j = (word_(j+5) - word_j) mod 29,  0 <= j < L-5
```

The five secret offsets cancel **exactly**. The remaining difference list equals `a` times the underlying plaintext's five-back differences. Divide every difference by the **first nonzero element**, if one exists (or retain the all-zero vector), producing a completely key-independent normalized fingerprint. Every single permitted `a` and `b_0…b_4` leads to precisely the same fingerprint. Therefore an ordinary GP-native target word can decode under this model **only if** its exact length and normalized fingerprint match the source word's fingerprint. This checks the entire `28×29^5` key family per word without key search; it is also valid when every word chooses an independently secret key. Unlike a generic reversible round trip, this invariant cannot be changed by choosing a different key.

## Original results and calibration

| Original printed-word rune length | Count of original words | Direct A English matches | Feedback B English matches |
|---:|---:|---:|---:|
| 6 | 256 | 256 | 256 |
| 7 | 216 | 216 | 216 |
| 8 | 156 | 153 | 155 |
| 9 | 78 | 9 | 15 |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| **10–14** | **109** | **0** | **0** |

This length pattern is essential: six-rune fingerprints carry only one normalized lag-five difference and are almost universally compatible; the test discriminates only after several independent differences exist. The Latin lexicon likewise has **0/109** long-word matches for both A and B.

As positive coverage checks on independently read English, the same length-at-least-10 direct-A normalized fingerprints recognize **591/778** Shakespeare source words and **262/306** Gibran source words in the pinned English lexicon. These rates measure real reference-lexicon coverage, not an assumed perfect natural-language model. The native solved p57 source is reencoded exactly and then encrypted/decrypted with `a=5` and five offsets `[3,1,4,1,5]`; all **95/95 runes** return, and all fingerprints are unchanged. The feedback B plant and inverse also pass exactly, demonstrating that ciphertext-predecessor carry does not invalidate the test.

## Interpretation and downstream decision

The simplest explanation of the fifth-back surplus as periodic plaintext syllable relations preserved by per-word five-offset affine shifts **fails the actual original long-word sequence** under ordinary GP-native English and Vulgate Latin vocabularies. Even giving every original printed word a new private multiplier and five separate offsets cannot rescue a single word of length ≥10 in either available lexicon. The distinct one-step ciphertext feedback layer is likewise insufficient.

Remaining independent possibilities include unknown or invented words, a non-GP intermediate encoding, a five-step operation whose nonzero multiplier or substitution **changes within words**, a state update coupled to plaintext or nonlocal source material, and a lossless/nonconstant transport. This report does not exclude those models. The stronger prior A-specific 244-edit and authentic F-clock bounds are documented in Agent47's earlier source report; the new B feedback test does not alter those earlier conclusions. A more complex proposed five-position operation should first produce a **source-selected state update/key** and a blind original-cipher plaintext prediction, rather than adding arbitrary parameters to fit the long words. No unknown LP2 plaintext, key, or intended destination has been recovered.

**Reproducer:** [`sims/lp2_wordlocal_five_affine_fingerprint_sft.cjs`](../sims/lp2_wordlocal_five_affine_fingerprint_sft.cjs) reads repository corpus and reference files, checks original word alignment and GP native p57, evaluates both invariants, asserts reference and original counts, and prints full by-length JSON. [Successful original-input Windows Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/44206939011).