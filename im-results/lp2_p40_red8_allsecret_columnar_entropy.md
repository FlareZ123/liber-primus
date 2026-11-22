# Original p40 red eight-rune columnar key: all-secret entropy obstruction

**Established exact invariant and source-matched empirical controls, 12 November 2026. No LP2 plaintext or key recovered.**

## The source-selected route

The original LP2 visual chapter spans pp40–53 with **3,008** GP29 runes. Its separately colored opening on **p40 local0–7** is the eight-rune sequence with indices \`[0,9,19,26,6,23,25,8]\`. All eight values are distinct. Alphabet/rank sorting gives the unambiguous classic columnar-transposition column order **[0,4,7,1,2,5,6,3]**. The remainder of the chapter is exactly **3,000 = 8×375** runes, requiring no column padding. An exceptional **51-rune red closing span** ends p53; excluding it leaves **2,949 = 8×368 + 5** runes, a standard ragged eight-column width. An original pp49–51 numeric table within this same visual chapter is printed in **eight columns**. Thus an eight-column cipher is a source-motivated, human-executable candidate with an unusually precise title/width/block-size fit, rather than a search over arbitrary key lengths.

A reversible classic columnar decoder can hold each of eight plaintext columns as one length-375 ciphertext block in the key's sorted order (or 368/369 for the alternate 2,949-rune body). Under the opposite writing convention, eight position-mod8 strided ciphertext groups are the fixed columns. **Neither reading convention affects the following result.**

## All-secret invariant and result

Suppose the output is native GP29 plaintext and each fixed column may be independently transformed by **any secret bijection of the entire 29-symbol alphabet**. A symbol permutation preserves its column's empirical histogram up to relabeling. Consequently it preserves that column's exact Shannon entropy, independently of the key, permutation, column ordering, or all-secret 29! lookup tables.

The eight original 3000-body column entropies in bits/rune (source byte order unchanged):

| Original grouping | Minimum column entropy | Maximum column entropy |
| --- | ---: | ---: |
| Eight consecutive length-375 ciphertext blocks | **4.769160812558** | 4.824045664995 |
| Eight stride-8 ciphertext substreams | **4.775167852125** | 4.810375332341 |
| Exclude terminal red51, eight classic ragged blocks | **4.769002165779** | 4.824597041936 |
| Exclude terminal red51, eight stride-8 substreams | **4.772322609370** | 4.808561798817 |

The maximum possible GP29 entropy is log2(29)≈4.85798. Here even the *lowest* of the original 32 column histograms is essentially near-uniform.

Controls use the repository's pinned Shakespeare, Gibran and Emerson text and exactly the existing source-native longest-match GP transliteration from the established word-shape SFT (\`QU→CW\`, \`V→U\`, \`K→C\`, \`Z→S\`, \`ING→NG\`). For each independent 3000- or 2949-rune native-GP window sampled at original-rune offset steps of 127, every eighth symbol makes one of eight plaintext columns. All native column maximums are **below every original column minimum**:

| Native source | Tested windows per body length | Maximum 3000-body column entropy | Maximum 2949-body column entropy |
| --- | ---: | ---: | ---: |
| Shakespeare, 217,644 GP runes | 1,691 | 4.366798716413 | 4.367937379346 |
| Gibran, 62,696 GP runes | 471 | 4.331537994878 | 4.331607728285 |
| Emerson, 323,083 GP runes | 2,521 | **4.391099678684** | 4.386410913611 |
| **Original source minimum across both layouts** | — | **4.769160812558** | **4.769002165779** |

The smallest source-to-largest native gap is **more than 0.37 bits per rune**, despite granting each column a completely independent unknown alphabet and allowing the sorted red key to choose column order. The fixed-label histogram proof is exact; the incompatibility with ordinary English is empirical, conditional on these three native-GP control registers and the frozen eight-column model. All observed original 8-column histograms are far beyond the selected controls. This excludes plain columnar transposition, ordinary per-column Caesar/Vigenère substitutions, and **every independently secret static 29-way column alphabet** in this exact representation.

## Finite literal decoder check and why the family remains closed

Using the original p40 eight-rune title itself as a repeated GP-ordinal or GP-prime-residue additive key, both signs, both classic columnar directions, and key addition before versus after the permutation gives **16 fixed combined maps**, alongside two pure transpositions. Original full-body IoCs remain between **0.034349 and 0.034683**, near 1/29≈0.034483, and no coherent text emerges. These finite outputs support the invariant but are less decisive than it: **no static secret column alphabet can restore English-like column histograms, even if an oracle supplies its exact 8-rune key**.

The SFT also round-trips source-native Shakespeare GP plaintext under eight independently secret affine column bijections and the original red key sorting. This positive control establishes the claimed reversibility without using an unknown-page crib.

## Decision and scope

The original red heading, matching table width, and no-padding body make this a plausible historically human-solvable guess worth one serious test. **That exact route is now strongly disfavoured**, independently of how one chooses eight static substitution alphabets. A useful successor would need a specific clue selecting a *time-varying within-column* operator, a non-GP intermediate/compression, or changed column segmentation; the original dimensional coincidences alone do not license arbitrary resets or high-entropy key searches.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_p40_red8_allsecret_columnar_entropy_sft.cjs), using original [GP corpus](../resources/liber-primus/lp2-corpus.json), [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), and the three pinned [native-GP control texts](../resources/control/). Original unchanged 12,956 unknown-rune source positions are not altered by any calibration.