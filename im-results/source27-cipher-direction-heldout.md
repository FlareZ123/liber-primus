# Source-anchored 27×27 ciphertext-direction walker: original inverse and full positive control

**Classification:** completed, source-guided, reversible **finite cipher-family negative**. Agent 16, 10 November 2026. **No authentic LP2 plaintext, key or continuation recovered.** Original and source-native planted calculations executed on Windows Node 22 in [successful manual workflow 42861266715](https://github.com/FlareZ123/liber-primus/actions/runs/42861266715). [Self-contained reproducer](../sims/source27_cipher_direction_inverse.cjs).

## Why this candidate was worth an actual inverse

The source first three LP2 physical pages contain exactly **729 = 27² original ciphertext runes** and an earlier published 27×27 route proposal identifies a proposed first-page root `J(13,12)`. The verified 2016 Cicada message states that words, meaning and numbers respectively supply a map, road and direction. These clues *motivate* a geometric running key but **do not define** which rune numbers, compass map, encryption arithmetic, or source index to use. The root and first-729 arrangement were selected retrospectively during previous investigations, and this particular model is a new explicit hypothesis.

The key source is **literally the original first 729 GP rune indices**, placed row-major in a 27×27 square. This experiment decrypts the **remaining 12,227 original runes**, physical pages 3–55. It therefore does not presume that the first three cipher pages have already been solved, and never fits a source grid to imagined plaintext.

## Exact, fully reversible cipher model

For every plaintext runic word-bearing physical page, use the grid pointer `(13,12)` as an initial source-key location, either resetting at every page or at the seven original post-grid section starts **p3, p8, p15, p23, p27, p33, p40**. The current grid cell is the key: either its GP index or its assigned GP prime modulo 28. At the first ciphertext position of each physical page, use the full modulo-29 additive channel:

`C = (P + sign × key) mod29.`

At every subsequent position use a reversible predecessor-excluding 28-rank channel. If plaintext rune `P=28` (EA), **repeat the previous ciphertext rune**. Otherwise `P∈0..27` maps to the successor rank `(P+sign×key) mod28` among the 28 other ciphertext rune labels, in the original cyclic GP order or its reverse. This mechanism admits and exactly preserves all **82** observed adjacent-repeat events on original p3–55. The original complete book has 86, with the remaining four on the first three source-key pages.

**After** each published ciphertext glyph, advance the pointer on the 27×27 torus along one of eight compass directions. Choose the direction digit either as `GP-index(C) mod8` or `GP-prime(C) mod8`, rotate by 0–7 and optionally reflect it, and move by one or five grid cells. The use of ciphertext to update state makes both forward and backward maps exact without hidden plaintext-directed choices. Five is motivated by the earlier retrospective source rectangle's southwest rune; it is **not** a recovered historical step.

All **1,024** combinations of source register, direction register, stride, rotation, reflection, additive sign, successor order and reset clock are enumerated. The direct continuous-prediction ability of this family is precisely testable, and the code specifies every choice.

## Original LP2 result and truly unseen continuation

Train a smoothed native GP-English unigram model on the first 190,000 characters of archived Shakespeare (independent of LP2). Select the best source-grid model by decoding **2,874 genuine ciphertext runes** on p3–14, two complete sections. Freeze that model and score the **9,353 later original runes** on p15–55, all five additional sections, without refitting.

| Metric | Best original train-selected source-grid inverse | Genuine GP-English held-out source |
|---|---:|---:|
| Train, mean GP-English log probability | **−4.118973** | — |
| Held-out, mean GP-English log probability | **−4.232270** | **−2.969185** (matched 12,227) |
| Held-out rune index of coincidence | **0.035204** | **0.059877** |
| Original rune positions reconstructed under the selected key | 12,227/12,227 | Not applicable |

The original best training mode selects GP-prime direction residue, GP-prime source-key values, stride1, direction rotation2, no reflection, positive key, reversed cyclic rank, and section reset. Its held-out characters are rune-like noise; no word sequence or original plaintext appears. In 128 seeded exact-inventory shuffles of the actual 729-rune source grid, **51/128 wrong grids score at least as well on the original heldout** under that frozen mode (add-one rank 52/129≈0.4031). That is a source-key specificity failure, beyond merely having low native-language IoC.

Source re-encryption of every 12,227 original rune under any chosen key is guaranteed by the bijective design, so it is correctly asserted as an internal consistency check, **not** counted as evidence for a historical key.

## Blind source-native positive proves the test can recover text

Use GP-English translated from the last 95,000 source characters, with no language-model overlap. Encrypt **12,227** plaintext runes exactly into 52 source-sized physical-page streams using the **original 729-rune GP source grid** and one secretly selected model from the 1,024 variants: GP-prime direction, GP-index key, stride5, rotation0, ordinary handedness, positive sign, ordinary successor order, section reset. The resulting source-layout ciphertext contains **111 immediate doublets**.

Given this invented ciphertext and all 1,024 candidate modes, the solver independently ranks the exact true mode **first** using only the initial two sections. It reconstructs **12,227/12,227 original English GP plaintext runes**, with byte-exact regeneration of the complete ciphertext. Across **128 independently permuted wrong source grids**, none reaches the original-key native-GP score (add-one upper rank 1/129≈0.00775). The plant is an end-to-end hidden-key regression, so the authentic original failure cannot be blamed on inability to invert a *true member of this tested family*.

## What the result changes

The tested route construction genuinely incorporates the first 729 original ciphertext indices as a grid key, implements the signed numerical-direction clue, preserves original anti-repeat markers and tests an untouched five-section continuation. All 1,024 direct, native-GP members fail to deliver a useful original inverse. This makes another unrestricted orientation/source-register sweep in this precise architecture a poor use of compute.

The result does **not** eliminate altered layouts, different roots, a plaintext or word-dependent walker, variable strides, hidden intermediate alphabets, a genuinely external state source, a noncyclic 28-symbol alphabet, changing per-position keys or compressed/binary plaintext. These must supply an independently fixed rule and a successful original-source prediction before being accepted. No fragment of authentic unknown LP2 has been recovered.

**Reproduce:** `node sims/source27_cipher_direction_inverse.cjs`. Node.js 22, CommonJS, only built-in libraries and committed corpus; runs the full original decryption, all candidate models, secret-source English plant, exact inverse/forward assertions and 128 wrong-source controls. CI used the opt-in `probe=source27` route in the [existing source-square manual workflow](../.github/workflows/clue-square-matrix-stream-manual.yml).