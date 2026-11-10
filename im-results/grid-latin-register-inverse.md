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

## Solved AN END hash as a frozen grid-column nonce source

A new original-source handoff tests the exact **64-byte / 512-bit digest** printed on solved LP2 page 56 (source-fixed in [the archived hash manifest](../resources/cicada2014-archive-hash-manifest.json)) as an AES-CTR/ChaCha20 nonce source. The same eight original 32-byte numerical-grid column keys, red-title-stripped eight 300-rune body prefixes, original GP-rune Viterbi with collision-triggered hidden keystream consumption, 32 algorithm/key-order/reduction/sign modes and globally optimal **8!** column assignment are retained.

The three 128-bit per-section nonce derivations are **double8** (the digest's consecutive 8-byte chunk repeated twice), **overlap16** (16 digest bytes starting at offset `8×section`, cyclically), and **sha256-index** (first 16 bytes of SHA-256 of the fixed UTF-8 domain separator `Liber Primus AN END LP2 IV\0`, the complete original 64-byte digest and a final one-byte section index). All rules are fixed independently of decoded original LP2 symbols. English and Latin source registers have completely independent GP trigram controls.

| Frozen hash-derived nonce | Best original English GP nats/rune | Best original Latin GP nats/rune | Rotated-hash competitors ≥ genuine, English/Latin (of 7 each) |
| --- | ---: | ---: | --- |
| double8 | **−5.631702** | **−6.388311** | 2 / 1 |
| overlap16 | **−5.606894** | **−6.431341** | 1 / 7 |
| sha256-index | **−5.628530** | **−6.413672** | 2 / 2 |
| Independent held-out source text (no encryption) | **−2.411765** | **−2.273586** | N/A |

For every scheme and language, the same secret-grid cipher family, with a hidden 8! assignment and 81% collision skips, recovers the genuine model and all eight key assignments from **synthetic independently encoded English or Latin GP text**. Latin plants recover **2,400, 2,399 and 2,398** of 2,400 true source runes respectively; English plants recover **2,398, 2,396 and 2,396** of 2,400 actual withheld English GP symbols, respectively, and also recover the correct symmetric mode and all eight assigned columns. No tested authentic LP2 configuration yields recognizable native-GP plaintext, and the correct hash fails to outscore alternative 8-byte rotations consistently. These controls distinguish a genuine source-key identification from a reversible model's routine wrong-key round trip.

**Decision:** the particular direct native-GP, source-grid AES/ChaCha collision-consumption architecture is negative under all three historical-digest IV serializations. This does not exclude keyed or more complex uses of the solved hash, other nonce functions, non-GP intermediate encodings or a different state machine. [Exact implementation](../sims/anend_hash_grid_nonce_inverse.cjs) runs via the existing manual [Latin-grid workflow](../.github/workflows/grid-latin-register-inverse.yml) and passed [final GitHub Actions run 42858522575](https://github.com/FlareZ123/liber-primus/actions/runs/42858522575), after fixing the output field that displays English plant accuracy.

## Solved AN END hash as a direct native-GP keystream: frozen whole-manuscript test

The printed 64-byte digest from solved LP2 p56 can also serve as the **direct cryptographic seed**, independent of the 256-byte numerical grid. A separate bounded test asks whether the complete original 12,956-rune text follows a reversible SHAKE256, HMAC-SHA512 or SHA512-counter byte stream seeded with that exact source. Each is tested with global continuous or physical-page-reset clock, both direct GP29 and predecessor-differential GP28 (with GP index28 encoded as an adjacent output repetition), both additive directions, and two fixed byte-to-rune reducers. There are **48 complete algorithms/clock/format/sign/reducer configurations per source language**, without any fitted hash bytes, KDF strings, source offsets or rune substitutions.

For every configuration, reconstruct the original GP plaintext proposal using the **complete exact inverse**. Select only from original physical pages **0–27**, and evaluate its frozen GP-English or GP-Latin trigram score on untouched original physical pages **28–55**. For a wrong-source control, rotate all 64 original digest bytes by each multiple of eight bytes from 8 to 56, reselect the entire 48-mode family solely on the same training pages, and evaluate the same heldout pages. Source GP models are the independently established Shakespeare and Vulgate counts.

| Independently frozen original-source test | Best training log-score per rune | Frozen original heldout log-score per rune | Untrained source/negative comparison |
| --- | ---: | ---: | --- |
| Correct digest, English GP | **−6.122394** | **−6.187430** | Raw original ciphertext as English GP **−6.186941** |
| Correct digest, Latin GP | **−6.976066** | **−7.119623** | 2 of 7 rotated-digest fits score higher on heldout |
| Synthetic true-digest encrypted English GP28 | Exact true cipher mode recovered | **−2.374419** | **12,956/12,956** true runes recovered and exactly re-encrypted |

The genuine digest's English heldout score is indistinguishable from simply reading ciphertext glyphs as GP English; none of the seven rotated-source competitors beats it, but **all eight have similarly nonlinguistic scores**, so the hash preference does not authenticate it. The original best English fit uses SHA512(digest||BE32(counter)) with page resets and GP28 differential decoding; its frozen heldout is much poorer than the original-length independent native-GP source (−2.374419). The original best Latin fit also remains extremely poor. The **source GP28 hidden-mode positive** uses the *real printed digest* as the HMAC-SHA512 key, hides its global clock, reduction, sign and differential28 format from the search, and is recovered **exactly for all 12,956 source runes**, including full exact forward re-encryption. This establishes detector power for the declared model, without claiming that an arbitrary GP ciphertext roundtrip authenticates a real solution.

**Decision:** under native GP-English/Latin and the 48 frozen direct-stream models, the solved page56 digest fails to reveal an original key or plausible unknown manuscript plaintext. The test is limited to the specified stream derivations and physical-page clocks: different key context, a non-GP binary layer, nonstationary state, independent historical data or other cipher families remain open. [Full original-rune CommonJS inverse](../sims/anend_hash_direct_29stream_inverse.cjs), via the existing manual [hash/grid workflow](../.github/workflows/grid-latin-register-inverse.yml), passed [GitHub Actions 42862280878](https://github.com/FlareZ123/liber-primus/actions/runs/42862280878).

## Decision and limitations

The source-locked eight-section grid-column AES/ChaCha stream models with collision key consumption have **no demonstrated plaintext recovery under either independent English GP or Latin GP source**. Latin source controls close a concrete false-negative weakness of the earlier English-only tests. They do **not** exclude ancient or modern language registers outside these controls, a wholly different binary or 28-symbol intermediate alphabet, a different nonce construction, a transformed grid key, more aggressive insertion/deletion, or cryptosystem types not tested. The 20 nulls per family limit tail precision; the actual log-likelihood gap to genuine Latin plants is large and the source grids are ordinary among nulls. The original wording, intended destination and keys remain unknown.

**Reproduction:** [`sims/grid_latin_register_inverse.cjs`](../sims/grid_latin_register_inverse.cjs), CommonJS Node22. Original-rune exact test, 5 independent Latin positive controls, and 5×20 matched shuffled-grid null experiments passed in [manual GitHub Actions run 42787398446](https://github.com/FlareZ123/liber-primus/actions/runs/42787398446). No per-commit CI.
