# Historical 2013 *Liber AL* running key with cipher-collision rejection: original LP2 gate

**Agent32, 16 November 2026.** **Decision:** no unknown Liber Primus plaintext or source-derived deciphering key recovered. This tests a historically motivated *candidate* key source under a **specified, reversible anti-repeat transport**, and rejects its direct GP29 fixed-alphabet versions at the original LP2 p0–2 opening. The broader source-book possibility with different operations, unknown mappings, or different entry offsets remains open.

## Independent evidence and narrow conjecture

The solved 2013 Cicada 3301 book code genuinely used *Liber AL vel Legis* as a source text. The original LP2 unknown ciphertext also has a strong near-absence of adjacent equal runes, which motivates a *collision-rejection* encryption step. Neither historical evidence **proves** that *Liber AL* supplies LP2 key material or that the following anti-repeat algorithm is author-selected. This experiment specifically tests their **conjunction**, rather than retrying prior ordinary running-key Vigenère tests ([prior direct-key negative](issue253-liber-al-keyword-projective-gate.md); [independent two-English affine/doublet obstruction](lp2-twoenglish-affine-runningkey-antirepeat-gate.md)).

Freeze the historical source as the three original textual chapter files in \`resources/external/2013-book-of-law-{I,II,III}.txt\`, concatenated in I–II–III order. Tokenize each with either the conventional seven GP digraphs or the historically attested LP1 orthography adding **ING** and **IO**; K→C, Q→CW, V→U, Z→S. At each plaintext position initially propose \`c=(p ± key[j]) mod29\`; if \`c\` equals previous accepted ciphertext, with probability **q=0.81** skip the current key rune and try the next with the *same* plaintext. Emit when not a repeat, or with probability 0.19 accept the repeat. State carries through original printed word and page seams, without restarting. This is a candidate transport, **not** p56's authentic transparent-F mechanism.

Test **both signs**, **every starting offset** of each entire candidate book, and the original **first 729 printed GP29 runes** of physical p0–2 without deleting/altering original characters. The readout language model is a fixed smoothed within-word GP29 trigram trained on the early part of the independent Gibran control book. Original printed word starts reset that model's state; they never reset the key. An exact collision-consistency inverse permits 0–2 key-symbol skips per position and uses a width-24/32/48 beam. Screening stages: all offsets on the first **90** original runes, top **400** to rune262, top **40** to rune729. Those are computational filters; **they do not exhaustively decode every 729-rune path at every initial offset**, so the conclusion is scope-limited. The actual candidate source text wraps once.

## Original-cipher measurement and positive control

The original first 729 rune indices from the image-faithful transcription match the independent derived \`lp2-corpus.json\` p0–2 records exactly. The known p57 solved rune text is an additional native-GP positive-control plaintext. For each spelling/sign cell, a disjoint Gibran 729-rune native-English heldout passage was encrypted at known book offset500 with the same anti-repeat generator and recovered *exactly* by the same fixed-alphabet inverse, including its key-skip count. The actual solved Cicada p57 GP29 body likewise passes a separate 90-rune source-native planted control.

The reproducible original-source [Node.js 22 CommonJS SFT](../sims/lp2_liber_al_antirepeat_runningkey_sft.cjs) and [successful GitHub Actions run 43804512853](https://github.com/FlareZ123/liber-primus/actions/runs/43804512853) report:

| Source spelling | Key sign | Original source offsets screened | 729-rune planted control log score | Planted key skips | Best original 729-rune log score | Best original offset | Outcome |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Legacy GP7 | +1 | 21,645 | +1,051.982 | 17 | −2,322.779 | 19,018 | Nonlinguistic |
| Legacy GP7 | −1 | 21,645 | +1,046.343 | 28 | −2,296.497 | 17,718 | Nonlinguistic |
| Authored ING/IO | +1 | 21,523 | +1,037.571 | 17 | −2,236.736 | 18,296 | Nonlinguistic |
| Authored ING/IO | −1 | 21,523 | +1,036.939 | 20 | −2,214.356 | 12,184 | Nonlinguistic |

Scores are an unnormalized summed **native-English trigram log ratio to independent uniform GP29** plus explicit skip/keep log factors. Hence comparison is between the same-length plants and original per cell, not between different spellings as if calibrated identically. The four original best 90-rune prefixes score from **−212.587 to −183.506**, whereas independently planted p57 source-native 90-rune scores are **+75.567 to +82.421**. The original readouts have no coherent 150-rune span, no identified key/data transfer and no continuation.

There were exactly **86,336 fully scored 90-rune source offsets** across four cells, followed by **1,600 262-rune rerankings** and **160 729-rune rerankings**. All code and original/plant checks ran to completion.

## Decision and causal fork

The fixed original GP29 mapping, ordinary Cicada-era chapter order, full offset search, and this specific ciphertext-collision rejection transport **do not expose LP2 opening plaintext**. The original manuscript's exceptional repeat gap is by itself insufficient to select a deciphering method. Do not rerun the same four-source cells with new arbitrary offsets or optimised language scores. A more ambitious hidden key alphabet would need an **independent clue** selecting such an alphabet; a different key clock or non-English plaintext is outside this measured negative.

This result does **not** modify the established \`results/README.md\` conclusion that the 56 original LP2 unknown pages are unsolved.