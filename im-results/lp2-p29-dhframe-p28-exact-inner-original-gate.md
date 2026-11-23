# P29's source-word DH packet, Q-parity, and unresolved 269-rune receiver

**Status (Agent 44, 23 November 2026): verified original-source arithmetic and a finite paired-cipher exclusion. No original unknown-page plaintext, authentic decryption rule, or final destination.** Two source-compatible packet cuts are distinguishable and must not be conflated. Their numerical DH interpretation was recognized after extensive examination of the source.

## Two reproducible cuts of the original page

LP2 physical p29 has exactly **277 GP29 runes**, and its immediate predecessor p28 has 269. The original p29 transcription starts with one complete three-rune printed word `[2,23,6]`, followed by 269 runes bounded by source word separators. Its final complete two-rune word is `[18,12]`; the final page fragment `[6,8,19]` **continues as the same word onto p30**, so the latter is not a complete three-rune word. The source-selected cut is therefore

```
p29 source words/fragments: [2,23,6] | 269 runes | [18,12] | [6,8,19] --> carried into p30
rune offsets (half-open):  [0:3]    | [3:272]   | [272:274] | [274:277]
```

This **3|269|2|3** cut keeps both its initial word and 269-rune field aligned with printed boundaries. It is structurally different from the previously reported **2|269|6** cut, `[0:2]|[2:271]|[271:277]`, which is also exactly 269 in the middle but splits the initial full word and two closing words. The source alone does not establish either cut as an encryption scheme. Original unknown pp20 and31 also each have 269 runes, so equality of size alone does not choose p28 as a unique paired recipient. Among original rune-bearing p0–55 pages, p29 is the sole page with first-complete-word length three and final complete word/terminal-fragment lengths two and three in this shape.

## Signed 2013 DH and the polynomial check

The historically documented miniature DH exercise has `p=23, g=5, a=6, b=15, A=8, B=19, K=2`. The first p29 full word exactly matches `[K,p,a]=[2,23,6]`. The complete two-rune trailing word corresponds to `[A-B (mod29),K*a (mod29)]=[18,12]`, and the final carried fragment corresponds to `[a,A,B]=[6,8,19]`. These assignments are possible readings of original runes, not authenticated author-selected labels.

Separately, p39's original red triad `[27,5,15]` as low-to-high coefficients specifies `G(X)=15X²+5X+27` over GF29. A source-DH-shaped candidate is `e=a/K=6/2=3`, yielding high-first `Q(X)=G(X)(X-3)=[15,18,12,6]`. The original p29 polynomial, read from its first rune as the highest-degree coefficient, is **exactly divisible by Q**. Replacing only its terminal three runes by `[0,0,0]`, computing its GF29 remainder modulo Q, and subtracting that remainder **uniquely predicts the actual last fragment `[6,8,19]`**. No terminal values are used to select the polynomial after `G` and `e` have been frozen. The direct last-two G check similarly predicts `[8,19]` from the preceding 275 runes.

This checksum is mathematically exact, but its source interpretation is conditional. The choice to combine p39's G with the a/K DH ratio, the reading of p29 as a polynomial, and the meaning of the final fragment were all motivated by observations of these pages. The last-three prediction is an algebraic corollary of the previously established Q-divisibility, **not an independent cryptographic discovery** or authenticated plaintext. A future human-visible instruction must select Q and describe how the 269-rune body is consumed.

## Revised original-body shared-pad decision

Original p28's 269 runes and the **new** p29 `[3:272]` 269-rune body were compared, respecting each page's printed word boundaries. On complete page-contained words, there are five distinct overlapping six-rune windows at zero-based positions **19, 45, 64, 218, 252**. The necessary relation for a completely unknown paired pad is

```
C28[t] = s*P28[t] + pad[t] + a                    (mod 29)
C29[t] = s*P29[t] + gain*pad[t] + b              (mod 29)
P29[t] = gain*P28[t] + s*(C29[t]-gain*C28[t]) + s*(gain*a-b)
gain in {1,...,28}, s in {-1,+1}, a,b arbitrary constants
```

This eliminates every rune of the unknown `pad[t]` before any scoring. The six-rune overlaps must permit **one shared relative shift** across both complete-word English candidates in the checked-in dictionary (standard GP ligature rules and separately the historical ING/IO contraction variant). Exhaustively checking all **28 gains × 2 signs × 29 offsets** yields **zero shared shifts for all 56 gain/sign families**. Across the 56 families, the five windows individually allow no offset in **19, 38, 18, 42, 35** cases. Under gain=1 and sign=+1, the window candidate counts are `[1,1,2,1,0]`; for sign=-1 they are `[1,0,1,1,0]`. Every declared original check passes a full **30/30** source-word-length-matched simulated English plant control.

This decisively retires **the newly aligned intact-word shared affine-pad model under the finite native-GP English lexicon**. The earlier **2|269|6** alignment was independently tested with its four six-rune overlaps, 28 gains and two signs in [the original paired-source report](lp2-p28-p29-dhframe-sharedpad-source-gate.md); it also fails. These are two distinct and complete negative gates on this one cipher family. They do not exclude nonlinear information-preserving mixing, altered plaintext word segmentation, other source-language registers, or different p29 packet roles.

For the older 2|269|6 cut, direct subtraction of p28 and its inner p29 body gives GP29 IoC **0.03354047606**, while addition gives **0.03453919991**. Applying the source-proposed cubing and inverse to each page before addition/subtraction gave 18 fixed and reversible trials with best original IoC **0.03681407091**; none yielded connected GP-native plaintext. Those figures refer **only to the original, one-rune-earlier alignment** and must not be silently transferred to the revised source-word cut.

## Remaining decision and reproducibility

The physically grounded 3|269|2|3 field boundary strengthens the case for examining a **typed page-to-page operation**, but it does not provide the missing encryption law. A genuine next step requires a historical instruction selecting whether the p29 body is key material, checksum, ciphertext, or state, and indicating its receiver among the 269-rune pages. The frame's same-size correlation or a successful synthetic roundtrip alone cannot establish a real solution.

- **[Single-file Node 22/CommonJS original and planted reproducer](../sims/lp2_p29_wordframed_dh29_original_sft.cjs)**; Windows [successful run 45181447854](https://github.com/FlareZ123/liber-primus/actions/runs/45181447854). Tests exact printed offsets, DH source values, full Q long-division, all 56 pad-gain/sign families, and 30 positive checks.
- **[Older 2|269|6 receiver and native-control test](../sims/lp2_p29_dhframe_p28_original_sft.cjs)** and **[original Q syndrome census](lp2-p28-p33-p29-dh-cubic-syndrome-gate.md)**. The latter establishes that p28 and p33 alone share one Q residue; that is a checksum-class observation rather than a decoded common text.

Research classification: exact original-source packet shape, exact source-dependent GF29 parity, and negative finite-dictionary gate. **No new LP2 plaintext or decryption key recovered.**
