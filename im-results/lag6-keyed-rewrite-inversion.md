# Known-key inverse of the candidate lag-six collision rewrite

**Evidence class:** constructive cryptanalytic inverse and source-disjoint synthetic controls. **No unknown LP2 key, original plaintext or actual enciphering rule recovered.** Agent 39, 2026-11-10.

## Cryptographic premise and its exact inverse

The [joint forward-generator analysis](lp2-forward-generator-joint.md) proposes a uniformly randomized tentative 29-rune additive ciphertext `X_i=(P_i+K_i) mod29`. With probability `q=.81`, a tentative collision `X_i=C_(i-1)` is replaced. Before index six of each canonical word, the replacement is uniform among the 28 *different* runes. From word-local index six onward, the replacement is `T(C_(i-6))=(24-2C_(i-6)) mod29`. The previous published rune state carries across word and physical-page boundaries. This architecture was selected to explain already-known LP2 statistics; it remains a hypothesis.

When the additive key `K` is supplied, every original tentative rune must be one of `C_i` and the preceding published `C_(i-1)`. The second candidate is legal only when the observed rewrite could emit `C_i`: for word-local positions 0–5, any rune different from the predecessor; at positions 6+, specifically `C_i=T(C_(i-6))`. Every admissible tentative rune determines a plaintext candidate `P_i=(X_i-K_i) mod29`. Exact local emission likelihoods are 1 (ordinary noncollision), `1-q` (unrepaired collision), `q/28` (early random rewrite) or `q` (later deterministic rewrite), with the target-equals-predecessor case handled explicitly. The candidate set is algebraically complete for this declared generator, even if an overwritten symbol has become unknowable from ciphertext alone.

## Two implemented decoders

The original [local posterior inverse](../sims/lag6_repair_keyed_inverse.cjs) chooses independently between the one or two plaintext candidates at each position with a 29-rune word-position prior trained on Shakespeare. On its original heldout artificial 12,956-rune book, an exact-key control with 367 overwritten events recovered **12,681 / 12,956** plaintext runes (97.877%) versus 12,590 for the literal inverse, gaining 91; the true rune was in the candidate set at all 12,956 positions. The score describes *synthetic* source recovery, not actual LP2.

The stronger [contextual inverse](../sims/lag6_repair_contextual_inverse.cjs) makes the emission choice using a complete word-level decoder. It combines (1) exact prefix-trie traversal of an independently trained GP-English word-frequency lexicon, and (2) an exact two-state-history Viterbi decoder using smoothed GP rune trigrams with position-sensitive unigram backoff. It maximizes an explicit mixture over word-lexicon and trigram source models without enumerating all `2^word_length` candidates. It preserves the previous published ciphertext rune across word boundaries and uses the observed word-local lag-six target. The script includes a wrong-key negative control and independent-author positive controls.

The source model is trained on the **first 200,000 characters** of the canonical 300,000-character Shakespeare resource. A disjoint 40,000-character validation portion chooses just one of four lexical mixture weights (0.3, 0.7, 0.95, 0.99), selecting **0.95**. Final Shakespeare evaluation uses the untouched **last 60,000 characters** with its own random key and rewrite history. All three books are matched to the **exact original 2,896 word lengths** and 12,956 runes, with only three rare-length fallback excerpts in each Shakespeare book.

## Executed independent tests

[Successful Actions run 42766461513](https://github.com/FlareZ123/liber-primus/actions/runs/42766461513) executed the parser regression, both inverse scripts, Shakespeare validation and test, a deliberately wrong pad, and independent Gibran/Emerson plaintext control books. All measurements below use the actual source hidden from the decoder and an **already-known synthetic additive pad**.

| Corpus / model | Actual overwrites | Literal-only rune hits | Local posterior rune hits | Contextual rune hits | Exact entire-word hits |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare validation (model selection only) | 349 | 12,607 | 12,700 | **12,898** | 2,842 |
| **Shakespeare final test (untouched)** | **381** | 12,576 | 12,668 | **12,842 (99.120%)** | **2,797 / 2,896** |
| Gibran, *The Prophet* (independent author) | 359 | see run | see run | **12,848 (99.166%)** | **2,793 / 2,896** |
| Emerson essays (independent author) | 328 | see run | see run | **12,837 (99.082%)** | **2,795 / 2,896** |

On the same untouched Shakespeare control, the contextual model recovers **174** more correct runes than the local posterior and **266** more than the literal-only inverse. All 12,956 synthetic positions still have only one or two exact tentative-source candidates by construction. In the final test, the decoder selected a source-lexicon path for 2,522 words; its 2,797 whole-word correct predictions include some trigram-decoded words outside that lexicon.

The **wrong-pad control** replaces the known synthetic key with independently generated uniform mod-29 key digits. It restores only **593 / 12,956 (4.577%)** true plaintext runes; the source-lexicon path is selected for just **166** words, versus 2,522 with the correct key. Thus the contextual decoder can strongly discriminate one correctly supplied key from an unrelated pad on the planted source. This does not calibrate a future search across thousands of original-material key hypotheses, unknown symbol permutations, variable key-skips, or unrelated source encodings.

**Reproduction:** `node sims/lag6_repair_contextual_inverse.cjs` with Node 22 and the committed control text; on-demand workflow [`.github/workflows/lag6-repair-keyed-inverse.yml`](../.github/workflows/lag6-repair-keyed-inverse.yml). Fixed seeds: validation `0x391701`, final test `0x391702`, wrong key `0x391703`, Gibran `0x391704`, Emerson `0x391705`. The full JSON is preserved in CI logs and its artifact. There is no workflow trigger per commit.

## Original-source screen: the 79-rune red key does not resolve the 79 lag-six ambiguities

The source-count coincidence is exact: the red spans on pages 15, 40 and 53 contain **20 + 8 + 51 = 79 runes**, while the word-local lag-six rule has **79 ambiguous sites** after excluding the one T6 hit that is already an adjacent repeat. This is a motivated alignment hypothesis, not evidence of a key by itself.

A chronological one-to-one comparison is weak. Only **5 / 79** red runes equal either possible tentative symbol (C_i or C_(i-1)) at the corresponding ambiguous site. Allowing reversal and all 28 rotations of the source-derived map T(x)=(24-2x) mod 29 raises the best match to only **10 / 79**.

The existing contextual inverse was then run on the original 2,896-word ciphertext with the same Shakespeare model and the already-validated synthetic mixture weight 0.95. Tested pads were the 79 red GP indices repeated globally (both directions and signs), and the source-derived F79 stream 53^(15+i mod 78) mod 79 reduced modulo 29 (both signs).

| Pad candidate | Lexicon-selected words / 2,896 | Lexicon words of length ≥5 | Decoded rune IoC |
| --- | ---: | ---: | ---: |
| Red79 GP index, forward, plus | 160 | 0 | 0.03787 |
| Red79 GP index, reverse, plus | 165 | 0 | 0.03751 |
| Red79 GP index, forward, minus | 165 | 0 | 0.03775 |
| Red79 GP index, reverse, minus | 199 | 0 | 0.03775 |
| F79 generator, phase 15, plus | 179 | 1 | 0.03791 |
| F79 generator, phase 15, minus | 182 | 0 | 0.03815 |

The independent Shakespeare holdout IoC is approximately **0.05879**. These outputs remain near the wrong-pad behavior already documented above: a few short dictionary coincidences, no coherent text, and no independently reproducible plaintext. The single length-five lexicon hit under one F79 sign is not meaningful evidence.

**Decision:** the exact 79-to-79 count match does not currently provide a usable collision selector or additive key. This rejects the tested direct symbol alignment and the specified periodic additive readings; it does not rule out every possible encoding of the red spans. Reproduction command: node sims/red79_lag6_contextual_screen.cjs.

## Consequence and unresolved dependency

The best-tested candidate inversion has now recovered over **99% of a complete planted LP2-length English plaintext** in three source-disjoint/artificial controls, given its correct key. This makes the missing **actual LP2 keystream** the decisive obstacle. The original manuscript's unusual lag-five same-rune and S-specific repeats remain substantially unexplained by the lag-six-only generator. The same rewrite architecture is still speculative, and word-level language recovery on an artificial source does not validate it for original LP2.

A next genuine decryption should obtain a key independently from manuscript/archival material, screen it against untouched original ciphertext with rigorous multiple-candidate correction, recover coherent source text over independent positions, and re-encrypt with a fully specified mechanism. Avoid re-running the finite synthetic search as if it were an original decipherment.
