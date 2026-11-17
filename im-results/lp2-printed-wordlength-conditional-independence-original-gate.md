# LP2 printed word lengths do not exhibit native-English adjacent-length grammar

**Evidence:** original LP2 runic word boundaries and source-independent English control corpora; authentic solved LP1 positive. **Result:** a calibrated, cipher-independent discriminator, not plaintext or a recovered key. Original Windows/Node22 SFT: [source](../sims/lp2_wordlength_chapter_mutualinformation_sft.cjs), [completed run 44038558428](https://github.com/FlareZ123/liber-primus/actions/runs/44038558428).

## Why this is a decoding decision

If an unknown-page cipher changes rune values while preserving the order and boundaries of native-GP English words, its printed **word lengths and adjacent length pairs are unchanged**. A GP29 substitution, a key stream with the authentic plaintext-F skip, or letterwise encryption alone cannot erase this grammar. By contrast, permutation of complete words, decoy word delimiters, a source different from ordinary English, or a variable-length word encoding could change it. This test asks whether the intact printed LP2 sequence has the same weak but reproducible word-length syntax as actual English encoded in Cicada's GP29 orthography.

Original source is the unchanged 55 rune-bearing unknown physical LP2 pages p0–55, **12,956 runes, 2,896 printed words**, including 32 physical-page word carries. The actual nine visual chapter word counts are **158,255,383,437,224,326,378,669,66**. Source punctuation `-`, `.`, and `&` delimit; visual `/` and page `%` do not. Each chapter ends on a genuine word boundary. The fixed length register uses classes 1 through 11 and one class for 12 or more runes. Every sample and shuffle respects actual chapter boundaries.

The statistic is empirical adjacent-word-length mutual information:

```text
MI = sum_{a,b} P(a,b) * ln(P(a,b) / [P(a)*P(b)])
```

This plug-in estimate is biased upward for short samples, so inference compares it to **3,000 exact-marginal Fisher-Yates shuffles performed within the same chapters**, with seeded deterministic xorshift32. The authentic 2014 LP1 word-length control is separately calculated from all fifteen sections of the pinned original source, preserving its own separators. The independent Gibran and Shakespeare prose controls are GP29-encoded with the established English spelling normalization: QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA.

## Original and calibrated outcomes

| Corpus and register | Word count | Observed adjacent MI | Matched shuffled mean MI | Upper-tail empirical p |
|---|---:|---:|---:|---:|
| Original unknown LP2, nine original chapters | **2,896** | **0.02031044** | **0.02194119** | **0.71709** |
| Independent genuinely solved LP1, 15 original sections | **698** | **0.10971080** | **0.08438602** | **0.006998** |

In 128 original-length, chapter-shaped, contiguous **Shakespeare** English windows, observed MI has minimum **0.02734778**, mean **0.04067655**; **0/128** is as low as original LP2. In 128 independent **Gibran** windows, minimum is **0.04486975**, mean **0.06328208**; **0/128** is as low as LP2. Both registers use the fixed 2,896-word source length and source's nine chapter cuts. The finite comparison is **0/256** below original, not an assumption that every natural-language or editorial style necessarily has this pattern.

A source-nominated lag family at **1,2,3,4,5,6,7,8,10,11,13,14,16,28,29,32,64,76,128,256** was tested using the same nine chapter resets. The greatest positive deviation is lag **32**, **z=1.76923**, but the **joint familywise permutation p=0.62344** across 400 fixed shuffles. No lag from that registered menu supplies a word column or transposition stride. Retain the original word lengths as real physical evidence without inferring a hidden word-permutation key.

## Interpretation and actionable fork

This is evidence **against** an unmodified ordinary GP-native English plaintext word stream simply encrypted in place with fixed word boundaries. It is consistent with several distinct alternatives: deliberate reordering of words; hidden or misleading word boundaries; a language, source genre or orthography outside these English controls; and a cipher that changes the count or segmentation of runes per plaintext word. Authentic solved LP1 demonstrates that the test can detect word-length syntax in Cicada prose, while p56 and p57 are too short individually to establish a powered reference MI.

**Next decisive task:** choose a transposition/segmentation operation from a source-visible instruction, reconstruct its actual word ordering, and test **held-out printed-word-length transitions** after freezing the choice. A word-level columnar inverse could be attacked by training a row-column path on part of the original and evaluating disjoint rows, with genuine plaintext plants and matched fake-order controls. If it recovers a stable word permutation, then apply the exact permutation to original *rune words* before an independently motivated GP29 cipher inverse. If withheld original pairs remain as independent as the printed ones, withdraw that particular word-order route. An apparent training-only increase in MI or re-encryption under an arbitrary key is insufficient.

This result does not prove deliberate word shuffling or change the requirement for an independently sourced cipher/key. No unknown original plaintext, original key or final destination has been found. The original manuscript's 86 equal-adjacent-rune events and global IoC remain additional constraints to explain.
