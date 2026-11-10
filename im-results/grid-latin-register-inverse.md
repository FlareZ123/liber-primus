# Latin-register original-grid inverse: source-pinned non-English decryption test

**Agent 38, 10 November 2026. Classification: original-rune, full-key-assignment inverse under independent non-English language model, with genuine-grid positive plants and shuffled-grid negatives. No unknown LP2 plaintext or cryptographic key recovered.**

## Why this new test matters

Earlier original LP2 AES/ChaCha tests of the eight authentic 256-bit columns of the base60 table used a language model trained on Shakespeare English transliterated into Gematria Primus. Genuine Cicada plaintext is known to be English on the solved pages, but the unsolved text's language is unknown. A correctly keyed stream producing Latin could score poorly under the English register, creating an unjustified false exclusion. This independently sourced **Latin** test addresses that specific failure mode with an exact original-rune inversion, instead of reusing Shakespeare as a universal oracle.

## Independent source and scorer

Train a smoothed 29-rune GP trigram model on **203,357 runes** of the *Latin Vulgate New Testament*, from eight distinct plaintext files (`luc_1`, `luc_2`, `io_1`, `io_2`, `act_1`, `act_2`, `rom_1`, `rom_2`) in the public [computationalstylistics/NT_Vulgate](https://github.com/computationalstylistics/NT_Vulgate) corpus. The script uses exactly the existing alphabet and digraph-tokenizer of `sims/grid_keyskip_viterbi.cjs`. GP triples never cross individual source-file boundaries. Store all eight original source Git blob hashes and sparse counts in [`resources/control/latin-vulgate-gp-trigrams.json`](../resources/control/latin-vulgate-gp-trigrams.json), derived reference SHA-256 `4cfd4846892cffbdfce5c92deaa91714ce1fbb2a0de06367b9c61e59a02bd4c5`. Preserve a **wholly separate** 2,400-rune GP reference from Revelation `ap_1.txt`, starting at rune offset 3,500, in [`resources/control/latin-vulgate-heldout-gp.json`](../resources/control/latin-vulgate-heldout-gp.json), derived file SHA-256 `09193e059863a5377eb2ab66db8b88d9aec905af8d41ae315026b27a578e4857`.

The smoothed unigram, bigram, trigram estimates and Viterbi implementation are **the same as in the existing English model**; only source-derived language counts differ. Authentic held-out Latin scores **−2.273586 nats/rune under Latin GP**, compared with **−3.208315** under the independent Shakespeare GP model. Held-out Shakespeare English GP scores **−4.341212 under Latin GP**. This verifies that the source register materially changes the adjudicator and is capable of distinguishing Latin from English.

## Actual ciphertext, key, nonce and inverse contract

Reuse all eight original 32-byte base60-grid columns, the exact eight original 300-rune body prefixes, and an exact Viterbi that can consume **one extra keystream symbol solely on a ciphertext-repeat collision**. For every nonce policy, search AES-256-CTR and ChaCha20, both grid-byte orders, both uniform byte-to-rune reductions (remainder and scaled-to-29), both GP +/- directions, and the globally optimal bijective **8!** key-column-to-section assignment. All this runs on 2,400 **unmodified** unsolved LP2 original ciphertext runes and the frozen independent Latin GP model.

Five already constrained nonce policies are tested: sixteen zero bytes; SHA-256(UTF-8 original red heading) truncated to 16 bytes; original red-heading GP rune bytes repeated to 16; the same heading interpreted as a big-endian base-29 numeral padded to 16 bytes; and the base-29 numeral in reversed little-endian order. This is a **register robustness check** on previously fixed IV models; the five variants were not selected for Latin by observed LP2 fit.

Before interpreting a negative on real text, plant **genuine independent Latin GP runes** from the held-out Revelation corpus into authentic-grid AES-256-CTR, source-derived IV, a hidden 8! key assignment, and an 81%-probability ciphertext-collision keystream skip rule. The exact same search recovers the true AES family and all eight key assignments **under every nonce scheme**, and exactly **2399 or 2400 of the 2400** original planted Latin runes (table below).

## Executed original-rune results

| Source-derived nonce | Best original log-score nats/rune | Genuine Latin plant recovered | Shuffled-grid choices as good or better /20 | Add-one upper-tail p |
|---|---:|---:|---:|---:|
| Zero 128-bit IV | −6.399676 | **2400/2400** | 7/20 | 0.38095 |
| SHA-256 original title | −6.433450 | **2400/2400** | 18/20 | 0.90476 |
| Repeated GP title indices | −6.426338 | **2399/2400** | 16/20 | 0.80952 |
| Title base-29, BE | −6.419240 | **2399/2400** | 10/20 | 0.52381 |
| Title base-29, LE | −6.409028 | **2400/2400** | 9/20 | 0.47619 |

The planted Latin ciphertext books score **−2.3686 to −2.3818 nats/rune** under the same Latin model while decoding almost perfectly, compared with authentic LP2 candidates near **−6.40 to −6.43**. For each IV choice, **20 independently byte-shuffled versions of the eight original grid columns** repeat the *entire* family-selection and key-assignment process on exactly the same real manuscript. None of the five original-grid results beats the shuffled-key family decisively. The nominally best zero-nonce score is near the null distribution (p0.381), and choice across five hypotheses requires further multiplicity control rather than enhancing its significance.

The positive tests have exact GP-rune recovery and correct AES/column assignments, so English-only model mismatch is **insufficient** to explain these negative results under the specified source cipher family if the hidden plaintext were comparable to the independent Latin control.

## Decision and limitations

The source-locked eight-section grid-column AES/ChaCha stream models with collision key consumption have **no demonstrated plaintext recovery under either independent English GP or Latin GP source**. Latin source controls close a concrete false-negative weakness of the earlier English-only tests. They do **not** exclude ancient or modern language registers outside these controls, a wholly different binary or 28-symbol intermediate alphabet, a different nonce construction, a transformed grid key, more aggressive insertion/deletion, or cryptosystem types not tested. The 20 nulls per family limit tail precision; the actual log-likelihood gap to genuine Latin plants is large and the source grids are ordinary among nulls. The original wording, intended destination and keys remain unknown.

**Reproduction:** [`sims/grid_latin_register_inverse.cjs`](../sims/grid_latin_register_inverse.cjs), CommonJS Node22. Original-rune exact test, 5 independent Latin positive controls, and 5×20 matched shuffled-grid null experiments passed in [manual GitHub Actions run 42787398446](https://github.com/FlareZ123/liber-primus/actions/runs/42787398446). No per-commit CI.
