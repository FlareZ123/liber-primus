# Signed-2016 EPIPHANY crib: one exact GF(29) LFSR continuation gate on original LP2 p0–p2

**Decision, 23 November 2026 (Agent 15): negative for one frozen direct-prose model.** A conditional 13-rune red-title crib from Cicada's verified 2016 words gives a uniquely short six-state linear recurrence, but its exact extrapolation across the next **716** untouched original runes does **not** recover native-GP English. A separately declared state reset at the red/black title delimiter also misses all **three** withheld runes of the same signed 2016 quotation. There is **no new authenticated plaintext or author-selected cipher**.

## Why a player might try this, and its strongest rival

The original 2014 LP2 p0 first two red printed words have GP29 rune lengths **8 and 5**, followed by a dot. A later, authentic signed Cicada 3301 message (2016) explicitly says *“epiphany seeks the devoted”*. The 8+5-runic GP29 spelling of its first two words, with Latin **K→C** as required by Gematria Primus, is `EPIPHANYSEECS`; it fits the original red heading exactly in *word lengths*, while its placement and actual decipherment remain **unproved**. A different, previously explored p7-derived RISE/H serializer reproduces the same 13-rune local crib using first-party p7 numbers, but its readout assignments were retrospective and do not authenticate the decoder. Related failed body transfers: Issues #1975, #2076, and the p7 circulant reports.

The 2016 message is two years later than LP2; its sentence can be a general invitation rather than a literal quotation of p0. Even assuming the red-title crib, p0's black text could use a completely different key, reset, alphabet, or nonprose payload. That rival is serious. The limited trial below asks exactly whether one historically available, economical **GF29 linear feedback / known-plaintext** inference can produce the required original continuation. It does not tune another mask after seeing an English score.

## Reproducible original-input operation

- Input is the authoritative `resources/liber-primus/lp2-corpus.json` p0=262, p1=266 and p2=201 runes, in page order. Those **729** source runes have SHA256 `7878349fef98939f6c816d657547e7e80f1b875d83b28e239c328e67b26159c7` when written as the literal GP0 byte values 0..28. The first 13 source runes transliterate `SHEOGMIAFSYENGC`.
- Conditional known p0 red plaintext: `EPIPHANYSEECS` (8|5 source word lengths). Under the demonstrated solved-page additive law, `K[i] = (C[i] − P[i]) mod 29`. This produces the fixed 13-value key prefix `[26,24,8,19,27,24,18,3,0,8,0,16,19]`, identical to the previously proposed p7 key but independently calculable from this specific quoted phrase. **A fitted known-plaintext prefix is not a decryption.**
- Standard Berlekamp–Massey over GF(29), applied once to that prefix, gives shortest degree **6** connection coefficients `[1,9,13,23,22,17,23]`, meaning `K[n] = −9K[n−1] −13K[n−2] −23K[n−3] −22K[n−4] −17K[n−5] −23K[n−6] mod 29`. Do not select degrees, offsets, signs or restarts by language fit.
- Continue this exact stream at the start of the manuscript, consuming no punctuation symbols. Decipher `P[i] = C[i] − K[i] mod29` across all 729 original runes; return the identical ciphertext with the inverse, including all 2014 page boundaries.

The red13 crib yields **only** its stipulated 13 letters. The genuinely untouched output is:

| Scope | Rune count | GP29 index of coincidence | Beginning of inverse (GP roman form, no spaces) |
| --- | ---: | ---: | --- |
| Original p0 red known crib | 13 | 0.064102564103 | `EPIPHANYSEECS` (imposed) |
| Original p0 black body | 249 | **0.035270112709** | `BEAENGEXSFESYJEAEAYIJJIASOECAENGEAWPNRAEMOEC...` |
| Original p1 untouched | 266 | **0.034331110796** | `HUMURWTNSSFNGGXSBAYTFTDIJIHNGIAWYDEAEOEA...` |
| Original p2 untouched | 201 | **0.035024875622** | `EAPEOLAOECXFMHPMMIFDCEOBMYBEAAEOEXCJS...` |
| Full original p0–p2 | 729 | 0.035326127919 | no continuous recognizable native GP prose |

For contrast, the physically clear original solved p57 page has GP29 IoC **0.062709966405**. A predeclared **planted** 95-rune p57 control encoded with the recovered BM6 source stream recovers **95/95** native runes and reencodes exactly; the 729-rune original inverse also reencodes **729/729** exactly. These controls show the code implements the proposed inverse correctly; they do not prove Cicada selected an LFSR.

## A stronger falsifiable same-phrase holdout, with a title/body reset

A 2014 solver might instead reset at the original red-heading terminal dot. If the 2016 quote literally continued into the black text, its next runic plaintext would begin **THE DEVOTED** = `TH,E,D,E,U,O,T,E,D` (9 GP runes, Latin V→U). Hold out the last **three** symbols `T,E,D`. Using the **same, already frozen title-derived BM6 connection**, derive a **fresh six-symbol state** only from the **first six** presumed body symbols and the original ciphertext rune offsets13–18. This fresh state is `[0,22,12,7,28,8]`.

The recurrence then predicts the original rune offsets19–21 to decrypt to **`I,EO,O`**, versus the withheld 2016 continuation **`T,E,D`**: **0/3 exact**, with no new settings selected. An independent source-native planted six-seed control recovers 95/95 runes, so the predicted disagreement is substantive for this exact reset-and-continuation model. The original black printed word lengths differ from a literal 2|7 THE|DEVOTED rendering; the test generously permits spaces to change.

This is a stronger rejection than the initial body IoC test for the *one exact* 2016-literal-continuation + reset + shared polynomial claim. It does not refute a separate body cipher or a 2016 literary reference unrelated to p0.

## Decision and bounded next action

**Retire direct continuous BM6 and single-dot-reset BM6 as interpretations of this specific conditional heading crib.** The p0 title remains unverified: a length-matched historical phrase and perfect replay of an imposed 13-symbol crib do not constitute an unknown-page solution. The source does **not** independently tell a human to use Berlekamp–Massey, does not select a six-state register, and does not declare that the full 2016 sentence appears in p0. Only an original clue that fixes the *actual* word/body receiver and its state transition would justify another dependent cipher run.

- **Runnable standalone Windows Node.js 22 SFT:** [`sims/lp2_p0_epiphany_signed2016_bm6_sft.cjs`](../sims/lp2_p0_epiphany_signed2016_bm6_sft.cjs). Read-only canonical corpus; explicit known-crib, recurrence, reencryption, native positive, and literal-quotation three-rune holdout assertions.
- **Actual source/positive Windows GitHub Actions run:** https://github.com/FlareZ123/liber-primus/actions/runs/45129088640
- **Authenticated phrase:** `resources/historical/cicada2016-4gq25-outguess.asc` and signed historical 2016 Cicada 3301 public records. The key transfer through p7 is classified separately at Issue #2066 and its linked reports.

No originally unknown LP2 plaintext, destination or complete cipher has been recovered here.
