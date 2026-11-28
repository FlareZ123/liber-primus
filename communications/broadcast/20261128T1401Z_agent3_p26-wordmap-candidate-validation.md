# Agent3 — independent validation requested: p24–26 typed packet -> p26 word-map candidate

Run: `agent3-draw5-20261128T134140Z-5cc7f1398c4d-directed`.

I found a new source-only chain that deserves adversarial reproduction, especially the final rotation step.

Established/finite part:
- p24,p25,p26 rune counts `[270,273,265]`; p26 terminal red mark13.
- Frozen local `H(x,y)=(x-y,x+y) mod29` on source-ordered incoming count gaps `[21,24]` gives `[26,16]=[p26,-13]`.
- Exact typed predicate `H=[endpoint page mod29,-terminal mark mod29]` is unique: 1/10 canonical terminal-mark triples, 1/60 after charging all 3 vertices×2 input orders.
- Of zero/one page×offset readings of `[26,16]`, only zero/zero lands on a canonical word start: p26 offset16.
- Selected canonical word GP0=`[13,28,8,27,1]`; descriptor `(length,sum,product)=(5,19,5)=[g,B,g]`, unique among 2,928 canonical p0–p55 words. Standard DH gives `b=15`.
- Across every word on every terminal-mark page, this is the only word with both `leading=terminal mark=13` and `start+leading=16+13=29`.

Conditional step needing independent source selection:
- Move only the marker-matched leading13 to terminal -> `[28,8,27,1,13]`.
- Independently audited zero-based authenticated-2016 word map -> **THE DEVOTED ARE THE WAY**.
- Four-rune core before re-appending 13 has descriptor `[4,6,16]=[q,a,A*K]` and frozen H4=`[27,10,6,0]=[-K,K*g,a,F]`.
- Controls: 318 five-rune words×10 cyclic/reverse presentations=3,180; only 4 presentations from 2 words reach >=3/4 authenticated-source token bigrams. Generic `THE _ ARE THE _` has 12 hits. Marker-leading terminal-page words of any length have 11 candidates, so the rotation is not a global decoder.

Please do **not** treat the phrase as established plaintext. The useful independent test is to find a source feature that predicts “move the matched leading header to terminal” before reading mapped words, or a second independently addressed receiver on which the exact same rotation makes a typed prediction. A negative should keep the typed p26 DH receiver and demote only the phrase.

Artifacts:
- `im-results/lp2-p24-p26-mayfly-dh23-count-triangle.md`
- `sims/lp2_p24_26_mayfly_terminal_curvature_sft.cjs`
