# Source-native rare-EA chain: keyless original many-page inversion

**Agent 9, 17 November 2026.** A fully reversible, source-motivated 29→28 ciphertext-step hypothesis was tested on all original 55 encrypted rune-bearing LP2 pages. **The original failed a whole-page-held-out direct plaintext recovery and a stronger key-independent, all-secret-page-salt invariant. No genuine unknown plaintext, key or continuation was recovered.**

## Why this distinct inverse deserved a decision

The unmodified original ciphertext contains **86 immediate equal-rune steps** among **12,901** within-page adjacent rune pairs, just **0.6666%**. The genuine solved-LP1 reference and clear LP2 p57, transliterated in 29-rune GP, contain the final GP rune **EA (index28)** at **20/3,074 = 0.6506%** before smoothing, or **0.6638%** with 0.5 pseudocount per symbol. Those rates nearly coincide. The author-defined 29-symbol alphabet also has exactly **28 nonzero modular increments**. A mathematically natural, fully invertible chain could therefore reserve the zero increment for rare plaintext EA and encode all 28 other plaintext runes as nonzero steps, using a secret 28-valued offset. This is a clue-constrained model worth attempting as a *direct* decryption, rather than guessing a high-entropy pad.

The rate match is suggestive only. The exception choice EA, local page reset, and shared secret schedule are the analyst's hypotheses; no authentic Cicada text commands this mechanism. Printed word boundaries are not used to fit any key. The known anti-repeat/ciphertext-step statistical literature makes this a plausible independent architecture test rather than proof of intent.

For each physical page `p`, at local rune position `j≥1`, define `D[p,j] = (C[p,j] − C[p,j−1]) mod29`. Let `P[p,j]` be the unknown plaintext rune with native GP index `0..28`. A reusable but otherwise entirely arbitrary secret `K[j]` ranges over 28 positions; optionally each physical page has an arbitrary secret additive salt `S[p]`.

```text
D[p,j] = 0                              when P[p,j] = EA (index 28)
D[p,j] = 1 + ((P[p,j] + K[j] + S[p]) % 28)  otherwise

P[p,j] = EA                              when D[p,j] = 0
P[p,j] = (D[p,j] - 1 - K[j] - S[p]) % 28   otherwise
```

The first ciphertext glyph is the page's arbitrary chain state and is not treated as a predicted plaintext glyph. Every subsequent rune is exactly invertible for a given key and page salt. This construction naturally produces occasional repeated ciphertext runes at the plaintext EA frequency without discretionary skipping or impossible 29-to-28 compression.

## M1: actually recover an arbitrary unknown shared pad from other pages

Train each local key symbol `K[j]` by maximum source-native GP29 unigram likelihood on all original pages except a fivefold blind physical-page holdout (page position modulo5). Each key position is fitted completely independently from the 44 other pages, including its identity and full 28-value range. Reconstruct only the eleven held-out pages under the inferred key. Zero steps predict EA without using any key. Source language frequencies use `resources/liber-primus/lp1-plaintext-reference.txt` and the clear original p57, **3,074 GP29 runes**, with 0.5 pseudocount per rune.

- **Unchanged original 12,901 steps:** mean held-out GP log likelihood **−4.255227601633948** nats/rune, with folds from **−4.22655 to −4.31334**. All 86 authentic zero increments are included as fixed EA predictions.
- **Three independent original-page-length GP English plants with the same unknown 28-position pad:** held-out **−2.94001 to −2.95090**, a decisive recovery. The same inversion decrypts the known plaintext **exactly** given true `K`.
- **Three independent per-rune fresh random pads**, containing the *same plaintext EA exception*, yield null held-out **−4.23464 to −4.26253**.

The actual encrypted manuscript is indistinguishable from the independently random-key null, rather than from the directly decipherable shared-secret plants.

## M2: cancel every unknown shared key symbol even with arbitrary secret page salts

For every pair `p,q` and shared local position where both ciphertext steps are nonzero:

`D[p,j] − D[q,j] ≡ P[p,j] − P[q,j] + S[p] − S[q] (mod28)`.

The unknown `K[j]` cancels identically, regardless of its entropy, length, period or historical generation. From the same native-GP reference, form the 28-position *conditional* difference law for two independently drawn non-EA GP runes. Grant **each** of the manuscript's **1,485 page pairs** its own optimal offset among all 28 shifts, without enforcing that the resulting offsets can actually arise from 55 coherent page salts. The original gives **305,556** valid paired positions; 0-valued steps are omitted only from this difference calculation, because the model predicts them to be unencrypted EA.

| Original or source-native control | Best normalized GP28 difference log likelihood per paired rune |
| --- | ---: |
| **Original LP2, 55 physical pages** | **−3.3281427652** |
| Planted shared pad + independent page salt, seed1 | −3.3065787632 |
| Planted shared pad + independent page salt, seed2 | −3.3063444604 |
| Planted shared pad + independent page salt, seed3 | −3.3059817420 |
| Independent step-pad null, seed1 | −3.3281376493 |
| Independent step-pad null, seed2 | −3.3283935521 |
| Independent step-pad null, seed3 | −3.3288720362 |

The near-uniform reference for this 28-symbol difference is `−ln28 = −3.33220451`. Original results track the independent-pad controls closely and differ strongly from all three positive native-GP salted plants. Allowing unrestricted pairwise relative salts makes this **more generous** than any globally consistent secret-salt recovery.

The direct inverse and pairwise tests probe different necessary consequences: M1 seeks plaintext by recovering a page-shared secret pad, while M2 survives arbitrary secret page offsets and eliminates *every pad value* algebraically before scoring. The latter is the stronger exclusion of this exact page-local shared-key architecture.

## Decision and limitations

The exact, reversible **rare EA → zero ciphertext step; other 28 letters → keyed rank28 step** architecture explains the manuscript's overall doublet *rate* as a numerical possibility. **An aperiodic keystream shared across all 55 page-local rune positions, with or without one independent Caesar salt per page, fails on original ciphertext.** Neither test found a decryption. It would be misleading to cite the near-match of EA and ciphertext-doublet rates as a recovered code: a globally counted event class does not determine its individual plaintext locations or the secret key.

This leaves open completely independent secret keys for each page, a source-directed varying key clock, unknown chapter/word resets, plaintext-F-transparent disruptions, variable-output escape encodings, other exception runes, mixed code tables, and a non-English or non-GP intermediate register. The plaintext controls preserve original **physical-page lengths** and the special-rune frequency through contiguous solved text; they do not preserve the ciphertext's exact printed word-boundary pattern. A convincing extension must specify an independently authored state/key clock or predict a held-out source-original passage. Further arbitrary key catalogs on these two fixed models have no causal value.

## Reproduction

[Node.js 22 CommonJS read-only SFT](../sims/lp2_rare_ea_step28_sharedpad_original_sft.cjs) consumes only the committed original-source `resources/liber-primus/lp2-corpus.json` and solved `lp1-plaintext-reference.txt`; it computes all original statistics and the three deterministic independently seeded positive/null experiments, verifies exact forward/backward reconstruction of all source-native plants, and asserts that originals behave null-like. Its fixed controls use original 55-page rune-length geometry and fresh secret position keys and page salts. The code has no downloads, external service access, or file mutations. The exact original inputs and sample parameters are in the script.

Windows manual CI run of the exact committed test is dispatched; add its actual completed status only after examining the real run.