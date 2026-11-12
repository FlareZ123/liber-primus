# Source-frozen 2013 Instar title at original p27: complete bounded Vigenère crib gate

**Director Issues #664 and #671; 12 November 2026. Decision: retire this exact 17-rune p27 title transfer under the predeclared additive operations. No unknown LP2 plaintext or historical key was recovered.**

## Original selection, independent evidence and obstacle

The original 2013 761.MP3 metadata titles the audio **THE INSTAR EMERGENCE**. The unsolved LP2 physical p27 (44.jpg) depicts an insect wing above a **19-GP-rune red heading**; the solved p57 PARABLE already speaks of an instar and emergence. These are plausible source cues for placing the title at p27 red offset0, although no original instruction authenticates the location or cipher. The fixed [pre-cipher source contract](../workplace/2013-instar-p27-wing-locked-crib.md) places exactly its 17 GP29 symbols at the first 17 red runes. The printed red words have lengths **3/12/4**, while the proposed GP title has **2/6/9**. Thus a word-boundary-preserving cipher cannot encode this title literally at that location.

The original 19 red p27 indices begin:

~~~text
C[0..18]  = 19 13 26 20 15 3 24 25 8 20 18 12 10 19 20 20 15 5 13
P[0..16]  =  2 18 10  9 15 16 24  4 18 19 18  4  6 18  9  5 18
K=C-P mod29 = 17 24 16 11  0 16  0 21 19  1  0  8  4  1 11 15 26
~~~

## First locked test: periods 1–14 and known LP1 operations (#664)

No repeating additive key of period 1–14 has the exact 17-runic implied-key consistency. The conflict counts for these periods are **[16,15,13,13,12,10,10,9,8,7,5,5,4,3]**. The predeclared historical Atbash+3 and exact DIVINITY-phase-zero decoders also fail. Original p53's red span is an independent wrong-image comparator, located at **physical p53 rune offset128**, with 51 red runes. Its first17 title-derived residues do not have any exact 1–14 period. The 17-symbol historical positive controls are exact. See [prior SFT](../sims/lp2_2013_instar_p27_crib_sft.cjs) and [original contemporary report](p27-instar-title-original-crib-gate.md).

The test on the 17-rune prefix cannot exclude a period17 key, because a 17-position key always fits 17 supplied plaintext symbols. Its value depends entirely on the **remaining original cipher**. That is the separate test below.

## Frozen original-cipher inverses: period17 and two autokeys (#671)

Use only original physical **pp27–32**, source-visible contiguous chapter length **1,433 GP29 runes**, with p27 red offset0 as chapter index0. True page lengths: **[234,269,277,263,269,121]**. Retain real printed words, lines and page boundaries for display; reset no cipher state at any boundary. With the 17 fixed crib runes as P[0..16], test three specified recurrences for i≥17:

1. Repeating Vigenère: P[i]=(C[i]-K[i mod 17]) mod29, with K as above.
2. Plaintext-autokey Vigenère: P[i]=(C[i]-P[i-17]) mod29.
3. Ciphertext-autokey Vigenère: P[i]=(C[i]-C[i-17]) mod29.

**Unseen p27 red positions17–18** immediately predict GP plaintext **B E**, **O A**, **S F**, respectively. The original red cipher runes at those positions are C P (indices 5,13). The next 1,416 decoded GP runes are held out from crib construction.

| Frozen decoder | Original 1,416-rune holdout IoC | Holdout Gibran trigram mean log score |
| --- | ---: | ---: |
| Period17 | 0.03450620 | -4.655299 |
| Plaintext autokey17 | 0.03434948 | -4.606867 |
| Ciphertext autokey17 | 0.03468487 | -4.681909 |
| Original ciphertext, no decoder | 0.03419077 | -4.573720 |

**Independent language benchmark:** canonical GP29 greedy transcription with documented QU→CW, V→U, KQ→C, Z→S normalization. Train conditional GP29 trigrams on all **63,114 Gibran** GP runes, using α=0.05 additive pseudocount. Evaluate 300 length-matched, evenly spaced **1,416-rune** windows from **218,800 Shakespeare** and **324,630 Emerson** GP runes, with Gibran as the training source. Native minimum/median/maximum log score = **−2.898483 / −2.537367 / −1.899158** (higher is more English-like). The three candidate holdouts fall **below all 300 independently sourced native GP controls**, including the unchanged original. The candidate streams show no coherent extended English or identifiable source-native GP plaintext. The scores are method-dependent diagnostics; this is a bounded rejection of these fixed inverses, not a proof about every possible language or postlayer.

**Wrong-image comparator:** derive the identical 17-position title key from p53's **actual red start at offset128**, rather than from p53 page-start black runes. With 51 total red runes it supplies 34 withheld control runes. The p53 title-key indices are **[14,24,26,3,0,20,22,8,13,19,19,2,5,15,18,18,9]**. Its original 34-rune holdout scores −4.628968 (period17), −4.519687 (plaintext autokey), and −4.424864 (ciphertext autokey). Replacing the p27 period17 key with this p53-derived key scores −4.670219 on p27's 1,416 holdout. Autokey continuation after the fixed title seed does not depend on its initial derived key. This comparator is weak due to its short holdout, and none of its continuations is plausible plaintext.

## Exact controls and reproduction

[The single runnable CommonJS test](../sims/lp2_2013_instar_p27_autokey17_sft.cjs) checks the original p27 prefix, exact stipulated key, six physical page lengths, p53 red source position, all 1,433 original cipher runes, three full 1,433-rune **source-native positive cipher plants**, exact decoding of each plant, and exact re-encryption of every tested original candidate. It outputs the complete 200-rune GP-token opening under each decoder **with original printed word and line boundaries**, original page offsets, independent-control statistics, and the wrong-image comparator. None of the original roundtrips selects a key, since every bijective inverse reverses exactly under any key.

The original and new tests both **passed** in the repository's existing *manual-only* [GitHub Actions run 43319258325](https://github.com/FlareZ123/liber-primus/actions/runs/43319258325). The new step was added to the established [p27 Instar manual workflow](../.github/workflows/p27-instar-crib-manual.yml); it introduces no per-commit workflow.

**Director decision:** close the strict p27 title transfer after these three full-chapter extensions. The original insect/instar connection remains a source-visible theme, most directly matched by the solved p57. Reopening this placement would require independent creator-derived evidence selecting different original plaintext, address, key or operation. No phrase shifts, alternate periods, word-break repairs, F omissions or tuned postlayers were searched.
