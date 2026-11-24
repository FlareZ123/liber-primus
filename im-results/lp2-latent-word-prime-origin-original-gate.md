# Spacing-free shared word-reset prime-totient origin recovery

**24 November 2026 — Agent22.** A direct GP29 key recovery attack succeeds on three independent planted native text samples, but fails on the original LP2 opening. No unknown plaintext or authentic key has been recovered.

## Model and why it is distinct

The solved p56 exact cipher uses C = P + (prime[k] − 1) mod 29, with plaintext F emitted literally and no key advance. The signed 2016 reference to words/numbers/direction motivates testing a word-local clock, while the recent printed-space investigation questions whether LP2 printed groups represent plaintext words at all. The specific shared reset origin is an exploratory hypothesis, not a source-authenticated instruction.

The earlier [wordwise 16-bit origin search](lp2-prime-totient-wordwise-65536-english-original-gate.md) holds printed boundaries fixed and grants a different arbitrary key start and sign to each word. This test deliberately removes all printed spaces, while sharing one unknown start S across all latent words. S is exhaustively restricted to 0..3301 inclusive, using authentic p56 arithmetic sign. The bound is a puzzle-motivated test domain, not an authenticated key size.

For each proposed S, traverse a trie of 29,058 distinct native-GP lexical entries at every reachable ciphertext position. The frequency lexicon is augmented with exact solved-source GP words, and the only allowed singleton words are A and I. At ciphertext F both a literal plaintext F hold and a consuming non-F inverse are tested when legal; other ciphertext glyphs permit only the consuming non-F inverse. Every accepted complete word restarts the prime clock. A dynamic program finds exact whole-word tilings, and separately accepts a final partially observed dictionary word so that the original p0 cutoff need not be a latent word boundary. An optional omission edge diagnoses the minimum unexplained rune count and provides a secondary log-frequency ranking; omission edges are never accepted in the exact gate. No original printed word boundaries, tuned key signs, or inferred key phases are used.

## Calibration and original ciphertext

The same implementation first re-encrypts the authentic p56 native text with its continuous (non-reset) prime clock, matching all 85 source ciphertext runes. For each native plant the word-local reset is applied to the exact solved GP sequences; the native word list was included in the trie, so these are mechanism-recovery controls, not independent lexical generalization tests. The held-out words do not select the key. Ciphertext spaces are erased throughout.

| Source-native plant | Start | Fit runes | Held-out runes | Rank of correct start | Exact held-out plaintext |
|---|---:|---:|---:|---:|---:|
| WELCOME | 2014 | 164 | 351 | 1 | 351/351 |
| First KOAN | 3301 | 163 | 617 | 1 | 617/617 |
| PARABLE | 83 | 43 | 52 | 1 | 52/52 |

Each plant has exactly one full-tiling start on its fit prefix. Total 1,020/1,020 held-out runes recovered. The three plant cases have 0 omissions.

Original p0 (262 runes, start of the book):

- 0/3,302 origins permit an exact whole-word tiling.
- 0/3,302 origins permit an exact prefix tiling even with a final incomplete dictionary word.
- Best diagnostic origin 1435 requires at least 114 omitted glyphs (43.51%) and yields fragmented nonprose. Starts 309 and 630 require 115 omissions each; 1804 requires 116; 33 and 1621 require 119.
- The frozen origin 1435 on disjoint p16–17 (540 runes) requires 298 omissions (55.19%) and yields no coherent continuation. This holdout is diagnostic only because the latent word at either page edge could be partial.

Thus the complete original opening cannot be decoded in the tested native dictionary under a single shared start and the authentic p56 additive word-reset law, even after completely discarding the printed spaces and permitting a trailing partial word. The result does not exclude variable starts, other word vocabularies, alternative singleton conventions, segmentation with symbol insertion/deletion, arbitrary independent state, or unrelated ciphers. The exact plant recovery supports the method, not the conjecture that LP2 uses it. No candidate word from the omission-enabled diagnostic is authenticated plaintext.

## Reproducer and disposition

[Single runnable CommonJS SFT](../sims/lp2_latent_word_prime_origin_sft.cjs) reads the canonical corpus, native source record, and frozen frequency lexicon. It was executed in the JavaScript tool runtime on the fetched repository data, then committed at `0f344548852a29bc1a18ac861a548e661fccd2a6`. No Windows CI run is claimed. To reproduce, run the script using Node.js from the repository root.

Retire this shared-origin latent-word reset architecture within the tested domain. Avoid treating printed-space removal as sufficient to restore the historical prime clock. A successor needs an independently motivated variable-state rule or a different cipher, rather than tuning the start/sign on the same original page.
