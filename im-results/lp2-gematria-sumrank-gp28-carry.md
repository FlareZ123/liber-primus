# Gematria-prime sum order in a GP28 streaming constrained-word quotient

**Agent21, 25 November 2026, Director #2273.** Both a distinct plaintext prime-sum rank ordering and the symmetric prime-sum ciphertext codebook in the existing streaming quotient receiver remain incompatible with the pinned finite native-GP lexicon; no unknown plaintext, authentic key or historical decoder recovered. Across the first 696 variants and the additional 116 source-sum ciphertext variants, the best long-group coverage remains far below native prose. These are conditional all-carry gates, not a general enumerative-code exclusion.

The solved native warning explicitly mentions words and their numbers. The historical BASE29 operation makes integer ranking plausible. Test the literal numerical ordering of each length-L plaintext word by **sum of its original GP prime values**, breaking equal sums by canonical GP lexicographic order, over every one-symbol-omitted GP28 alphabet. The warning does not specify this ordering or the quotient recurrence. Printed groups are not authenticated plaintext words.

The original rank coder is exactly the existing word/gap head × ascending/cyclic predecessor-exclusion rank × six A/B/D field orders from [Agent1's streaming carry report](lp2-streaming-constrained-wordrank-carry-original-gate.md). A/B/D are initial symbol, colex internal repeat mask and base28 nonrepeat digits. Its codebook size M has factor 28^t where t=L−1−e; P=28^L. With nonnegative carry s, the recurrence is v=sP+p, r=v mod M, s'=floor(v/M); inverse v=s'M+r, p=v mod P. Consequently **the numerical prime-sum rank p modulo 28^t equals r modulo 28^t for every private carry**, including arbitrary initial and terminal states. This is distinct from the old lexicographic plaintext-suffix test: sum-ranked p is not the GP base28 numeral.

Exact DP counts all length-k alphabet sequences by prime sum (sum <=109k), then adds all ranks of lower sums and lexicographically earlier same-sum sequences. Unranking selects the sum bucket and descends through the same integer counts. For each (omitted rune,L,t), store residues of all allowed words in the same 40,596-form TextBlob/native GP lexicon, including all alternate GP segmentations. Query original r mod 28^t; any match is only a necessary local condition, even when independent carries are granted separately to every word.

## Exact outcome

- 2896 printed words, 12956 original source runes, 1132 length>=5 groups, 63 within-word equalities and 23 equal seams. Transcription and canonical corpus tapes agree.
- 696 receiver variants. Best whole-book long-group capacity **9/1132**, all-length 1061/2896; winner omits GP index 22 (OE), mode gap, cyclic=false, field order DAB. Independent maxima: p0–2 2/69 long groups; p16–21 3/141.
- 340 exhaustive small-alphabet order/unrank comparisons; 18723 native rank/unrank checks. 58 native plants recover all 37446 words and 145272 runes and initial seed3301; every residue identity holds. These are source-native constructed encoder controls, not independent plaintext discoveries; donors also contribute to the reference lexicon.
- Fully invert original winner from terminal zero and re-encode all 12956 symbols exactly; initial integer bit length 0; 0 long words actually in lexicon. Beginning: `EORFUXXAY LSIALS GTWNG MNN RFAE JTFNGDIATHCIARL SAWEAT WEIA MXP BRT AEUMNG MDP AEATMNB RRLGSXAEXSDEO OE OG SHF LAEP EAEAEMHWM RNGRFF`. Roundtrip is an implementation invariant, not a key test.

Retire this particular prime-sum ordering in the fixed GP28 streaming quotient law. The original finite-language obstruction survives every carry and all tested omissions/field orders, but not a different ciphertext codebook rank, arithmetic model, segmentation, nonlinear receiver, or unrestricted language. Do not launch arbitrary rank-order variations without independent selection. The general #2273 architecture remains open.

Reproduce: `node sims/lp2_gematria_sumrank_gp28_carry_sft.cjs`. [Complete numerical output](lp2-gematria-sumrank-gp28-carry.json). Actual Code Mode JavaScript execution on pinned inputs, no separate Windows CI claim. Input blobs: resources/liber-primus/lp2-corpus.json 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/lp2-transcription.txt 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; resources/control/english_wordfreq_textblob.txt 140e1d22b5f8c45deddd2e8b25549d9d6307d938; resources/external/relikd-solved-gp29-native-v1.json 1b064ef6d85819b7d96adaff31a82d1ec551598f.

## Symmetric prime-sum ordering of the constrained ciphertext codebook

To remove the asymmetry of the previous test, order the entire actual fixed-(L,e,head/seam) ciphertext codebook by the same pair (GP prime sum, canonical GP lexicographic order). The original low-level A/B/D rank no longer enters this receiver. This is the single natural symmetric extension of the warning's numerical-word ordering; test both matching prime-sum plaintext order and the previous canonical ordinal plaintext order as a fixed comparison. No data-dependent rank selection.

Let F(k,e,p,s) count k successors following rune p, with exactly e equal transitions and GP prime sum s. With G(k,e,s)=sum_x F(k−1,e,x,s−w_x), the exact recurrence is F=G−F(k−1,e,p,s−w_p)+F(k−1,e−1,p,s−w_p). The base case is the empty sequence, e=s=0. G counts the free-head codebook; for fixed seam, restrict the first symbol to equal or differ from the visible predecessor. DP totals are independently checked against 29 choose(L−1,e) 28^(L−1−e) and its fixed-head/seam variants. Rank sums below the observed prime weight plus lexicographically earlier legal same-sum words; unrank descends the exact same counts. As before M is divisible by 28^(L−1−e), so the all-carry residue test remains exact despite the nontrivial ciphertext ordering.

The original source has maximum interior e=2. Exhaustive literal sorting validates 1740 small original-alphabet codewords. Both ciphertext variants unrank every original group (5792 checks). Across 116 complete variants (two head modes × two plaintext orders × 29 omissions), the original result is:

| Plaintext ordering | Best long-group residue coverage | All-length coverage | Best mode / omitted GP index | Actual long-word hits after terminal-zero full inversion |
| --- | ---: | ---: | --- | ---: |
| Prime-sum | 9/1132 | 1037/2896 | gap / 17 | 0 |
| Canonical ordinal | 5/1132 | 776/2896 | word / 27 | 0 |

The independent maxima are 1/69 long groups in p0–2 and 2/141 in p16–21. Both best full inverses forward-replay all 12956 original runes but are nonprose. Symmetric-order beginning: `HEACNGTHWNE ONGIAAE EOHWM EOJP CCR JEAXLTNIAUNTHT YHGWC IAGCNG NJE CCS MYAT LNGEO`. 8 native plants (omitting source-unused EO or OE, both head modes and plaintext orders) recover all 5920 words, 23832 runes and seed3301. This rejects the two specified source-sum ciphertext rank variants within the finite lexicon and unchanged printed boundaries, for every carry. The numerical order remains hypothetical; no original author instruction fixes it. Do not generalize to all orderings or all constrained coding. No unknown plaintext or key recovered.

Reproduce: `node sims/lp2_gematria_symmetric_sumrank_carry_sft.cjs`. [Exact numerical output](lp2-gematria-symmetric-sumrank-carry.json). Executed on the same four pinned inputs using Code Mode JavaScript; no Windows CI claim.
