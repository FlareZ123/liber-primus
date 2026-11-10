# Source-anchored 27×27 ciphertext-direction walker: English/Latin original inverse and hidden-key controls

**Classification:** completed, source-guided, reversible **finite cipher-family negative**. Agent 16, 10 November 2026. **No authentic LP2 plaintext, key or continuation recovered.** Original and English/Latin source-native planted calculations executed on Windows Node 22 in [successful manual workflow 42864577857](https://github.com/FlareZ123/liber-primus/actions/runs/42864577857). Self-contained reproducers: [English](../sims/source27_cipher_direction_inverse.cjs) · [Latin](../sims/source27_cipher_direction_latin.cjs).

## Why this candidate was worth an actual inverse

The source first three LP2 physical pages contain exactly **729 = 27² original ciphertext runes** and an earlier published 27×27 route proposal identifies a proposed first-page root `J(13,12)`. The verified 2016 Cicada message states that words, meaning and numbers respectively supply a map, road and direction. These clues *motivate* a geometric running key but **do not define** which rune numbers, compass map, encryption arithmetic, or source index to use. The root and first-729 arrangement were selected retrospectively during previous investigations, and this particular model is a new explicit hypothesis.

The key source is **literally the original first 729 GP rune indices**, placed row-major in a 27×27 square. This experiment decrypts the **remaining 12,227 original runes**, physical pages 3–55. It therefore does not presume that the first three cipher pages have already been solved, and never fits a source grid to imagined plaintext.

## Exact, fully reversible cipher model

For every plaintext runic word-bearing physical page, use the grid pointer `(13,12)` as an initial source-key location, either resetting at every page or at the seven original post-grid section starts **p3, p8, p15, p23, p27, p33, p40**. The current grid cell is the key: either its GP index or its assigned GP prime modulo 28. At the first ciphertext position of each physical page, use the full modulo-29 additive channel:

`C = (P + sign × key) mod29.`

At every subsequent position use a reversible predecessor-excluding 28-rank channel. If plaintext rune `P=28` (EA), **repeat the previous ciphertext rune**. Otherwise `P∈0..27` maps to the successor rank `(P+sign×key) mod28` among the 28 other ciphertext rune labels, in the original cyclic GP order or its reverse. This mechanism admits and exactly preserves all **82** observed adjacent-repeat events on original p3–55. The original complete book has 86, with the remaining four on the first three source-key pages.

**After** each published ciphertext glyph, advance the pointer on the 27×27 torus along one of eight compass directions. Choose the direction digit either as `GP-index(C) mod8` or `GP-prime(C) mod8`, rotate by 0–7 and optionally reflect it, and move by one or five grid cells. The use of ciphertext to update state makes both forward and backward maps exact without hidden plaintext-directed choices. Five is motivated by the earlier retrospective source rectangle's southwest rune; it is **not** a recovered historical step.

All **1,024** combinations of source register, direction register, stride, rotation, reflection, additive sign, successor order and reset clock are enumerated. The direct continuous-prediction ability of this family is precisely testable, and the code specifies every choice.

## Original LP2 result in two independently sourced GP languages

For both English and Latin, select the best of the **same 1,024 original-source grid modes** by only **2,874 genuine LP2 ciphertext runes** on p3–14, two complete sections. Freeze each language-selected mode and score the **9,353 later original runes** on p15–55, five independent subsequent sections, without any second-stage fitting.

The GP-English source is a smoothed unigram count from the first 190,000 characters of independently archived Shakespeare. The GP-Latin source is the independent Vulgate reference's **203,357 training GP runes**, with Jeffreys smoothing (`count + 0.5`), originally assembled from Luke, John, Acts and Romans. Their historical spellings and GP encodings follow the committed source normalizers. Latin is a relevant alternative because a *separate unverified* LP2 incipit candidate reads `SEQUENDI RATIO`; the current attack does **not** assume this candidate is real plaintext.

| Frozen original-source result | English-GP scorer | Latin-GP scorer |
|---|---:|---:|
| Best training mean log likelihood/rune (p3–14) | **−4.118973** | **−4.544980** |
| Frozen original heldout mean log likelihood/rune (p15–55) | **−4.232270** | **−4.711917** |
| Native source/reference GP likelihood per rune | **−2.969185** (12,227-rune independent English) | **−2.814605** (2,400 independent Latin heldout runes) |
| Original heldout GP rune IoC | **0.035204** | **0.035183** |
| Native source GP rune IoC | **0.059877** | **0.072029** |
| Shuffled original 729-rune source keys at least as good as true, fixed-mode heldout | **51/128** | **82/128** |
| Add-one wrong-source rank | **52/129 = 0.40310** | **83/129 = 0.64341** |

The best English mode uses GP-prime direction and prime key, stride1, rotation2, normal handedness, positive sign, reverse GP28 successor ranks, section reset. The best Latin mode instead uses prime direction and prime key, stride1, rotation0, *reflected* orientation, negative sign, ordinary successor order, section reset. The source key and both apparently best modes are not shared across the two languages. Both original heldout streams have near-uniform IoC, and neither produces recognizable text. The Latin-trained original performs **worse than 82 of 128 randomly permuted wrong 729-rune source grids** under its frozen mode. This specifically rejects the proposed historical source-grid ordering as an explanation within this mechanism.

Source re-encryption of every 12,227 original rune under any chosen key is guaranteed by the invertible design, so the exact original round-trip is **an implementation check**, not key authentication. The full source-grid permutations are matched wrong-key controls; we do not treat their 128 draws as a discovery-wide p-value or a test of all possible grid traversals.

## Two blind source-native positives: authentic language recovery in the hypothesized model

The first positive encrypts **12,227** genuine held-out GP-English plaintext runes sampled from the last 95,000 Shakespeare source characters, disjoint from model training. It splits this text into the original 52 physical page lengths and encrypts using the **exact real 729-rune LP2 grid** under one secretly selected mode among the 1,024. Its published-like synthetic ciphertext contains **111 immediate doublets**.

The separate Latin positive uses **2,400 genuinely independent GP-Latin heldout runes** from the Latin Apocalypse, cyclically tiled to 12,227 original-sized positions. This repetition is explicit: the test checks this cipher's symbolic **unigram** selection and lossless inversion, so it is a valid basic key-discrimination regression but does not mimic continuous Latin prose across tile boundaries. It uses the same secret test mode as English, again with the authentic original source grid.

In **both blinded tests**, the true hidden mode ranks **first** using only the two training sections, every **12,227/12,227 GP plaintext rune** is recovered, the original 12,227-rune synthetic ciphertext is re-encrypted exactly, and **0 of 128 independent wrong-grid controls** reaches the true grid's recovered language likelihood (plus-one 1/129≈0.00775 for each). The English original source reference has IoC0.059877, the Latin heldout GP register IoC0.072029. The native GP source plant visibly separates the correct source key from wrong keys, while both original LP2 language fits remain indistinguishable from arbitrary source grids.

The plant controls validate the complete fixed-model original inverse; they do **not** demonstrate which original unknown LP2 text, if any, used this algorithm.

## What the result changes

The tested route construction genuinely incorporates the first 729 original ciphertext indices as a grid key, implements the signed numerical-direction clue, preserves original anti-repeat markers and tests an untouched five-section continuation. The shared 1,024-member source-guided family fails to deliver useful original prose under *either* independently trained native GP English or Latin likelihood; both language-scored original sections remain nonlinguistic with independently selected source-key shuffles scoring as well or better. This makes another unrestricted orientation/source-register sweep in this precise architecture a poor use of compute.

The result does **not** eliminate altered layouts, different roots, a plaintext or word-dependent walker, variable strides, hidden intermediate alphabets, a genuinely external state source, a noncyclic 28-symbol alphabet, changing per-position keys or compressed/binary plaintext. These must supply an independently fixed rule and a successful original-source prediction before being accepted. No fragment of authentic unknown LP2 has been recovered.

**Reproduce:** `node sims/source27_cipher_direction_inverse.cjs` and `node sims/source27_cipher_direction_latin.cjs`. Both use Node.js 22, CommonJS, built-in libraries and committed independently sourced corpora. Together they run the full English/Latin original decryption, 1,024 candidates per register, two distinct source-native hidden-key plants, exact inverse/forward assertions and 128 wrong-source controls per register. The existing [manual source-square workflow](../.github/workflows/clue-square-matrix-stream-manual.yml) offers opt-in `probe=source27`, and [run 42864577857 passed both Windows test steps](https://github.com/FlareZ123/liber-primus/actions/runs/42864577857).