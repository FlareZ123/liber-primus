# P29 contains a DH-shaped eight-rune frame around a p28-length field

**Agent 2, 23 November 2026. Provisional original-source discovery and bounded negative. No new plaintext, authenticated cipher, or destination.** The field ordering was recognized after inspecting the original p29 ciphertext. Preserve that postselection when evaluating the pattern.

## The new source-aligned frame

The authenticated 2013 Cicada TCP challenge's DH23 example fixes modulus p=23, generator g=5, public values A=8 and B=19, and shared secret K=2. Its recoverable private values are a=6 and b=15. In the original GP29 field, K*a=12. Separately, the previously documented p28 operator H(x,y)=(x-y,x+y) modulo29 fixes H(A,B)[0]=18. This H interpretation is historical research, not an independently authenticated LP2 instruction (see [DH/cube source gate](lp2-p28-dh23-gp29-cube-bridge.md)).

The original physical p29 (scan 46.jpg) begins with exactly **[2,23] = [K,p]** and ends with exactly **[5,18,12,6,8,19] = [g,H(A,B)[0],K*a,a,A,B]**. Its third rune is independently **6=a**, giving a longer prefix [K,p,a]=[2,23,6]. The eight framed symbol values are pairwise distinct.

P29 has **277 original GP29 runes**. Removing the two first and six last runes exposes one contiguous **269-rune field**, the exact length of the immediately preceding original **p28 (269 runes)**. Among all 55 physical adjacent-page transitions in pp0–55, p28→p29 is the **only +8-rune transition**. The only absolute-eight-length rival is p25→p26, a decrease of eight. Thus the literal original rune alignment is fixed without selecting a cipher phase:

    original p28[0:269]  <->  original p29[2:271]

Two older, independently documented hypotheses had already conditionally pointed to p29. P28's DIRECTION clause projects signed-word index29 onto physical p29 ([original page selector](lp2-p28-the-direction-p29-selector.md)). The original p39 red triad gives G(X)=15X²+5X+27, which exactly divides the source-original p29 rune polynomial ([original quotient study](lp2-p29-g-original-quotient.md)). The eight-field frame and exact p28-length body are newly documented here; the p29 selector and G factor are prior work.

## Caveats and contrast

The proposed packet straddles p29's printed word breaks. The first two runes belong to a longer word, and the final six cross word divisions; the page's final word continues on p30. There is no printed packet delimiter, codebook, or author-identified rule arranging these eight DH fields. The split 2|269|6 and the chosen set of field labels were recognized after inspecting the ciphertext, despite their source antecedents. Ordinary numerical coincidence remains a rival.

A conditional descriptive reference: for the page's exact 277-rune frequency histogram, random reordering puts this **exact ordered eight-field tuple** in these fixed positions with probability **5.8314122685700975e-12**. Uniform GP29 would give 29^-8 = 1.9990148336715043e-12. Neither calculation accounts for the substantial number of historical page, field and opcode hypotheses searched by the project, so neither is a discovery significance level or evidence of authorship.

## Original full-body inverse trial

Treat p29's precisely matched 269-rune inner field as a paired-page additive mask for all of p28. Direct subtraction has IoC **0.03354047606** and opening WRAJUPGTHUEARJAEEISUFCANG; direct addition has IoC **0.03453919991** and opening MGIAOERWHSPXDXEOERWBMIHAE. Both remain ciphertext-like.

The earlier signed-DH/GP29 source-derived x^3 permutation and its x^19 inverse supply two additional *fixed operations*. Applying identity/cube/inverse to either original stream and both additive directions gives 18 completely reversible original 269-rune inversions. The best of 18, cube(p28) minus p29-inner, has IoC **0.03681407091**, still unlike independent known native-GP prose. Original p28 itself is 0.03390112634; a 269-rune native reference made from solved p57 is 0.0689119457. Every original inverse re-encrypts its 269 source runes exactly, and each recovers the full independent solved-p57 planted control. No native prose is obtained by any direct paired-page transformation in this bounded set.

## Decision and next action

The p29 boundary is a concrete **candidate source-derived DH state/receiver**, accompanied by an unusual exact neighboring-body length. It lacks the author-selected inverse/operand instruction and might be postselected arithmetic. **Do not promote it to recovered plaintext or a verified puzzle mechanism.** Its best potential use is an independently sourced nonadditive operation that directly predicts a contiguous unknown p28 passage from the exact p29 interior; avoid arbitrary offsets or secret fitted pads. The full original check and native positive control are in [single-file Node22 CJS SFT](../sims/lp2_p29_dhframe_p28_original_sft.cjs).
