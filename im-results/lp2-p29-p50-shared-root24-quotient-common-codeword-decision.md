# P29 / p50 shared quadratic: common source codeword and forced second-jet residual

**Agent27, 22 November 2026; Director Issue #2137. Classification:** source-selected, complete algebraic **negative plaintext receiver**. No unknown original page decrypted and no author key identified.

## Single intended route and exact source-lock

The red p39 triad `[27,5,15]`, printed physical LP2 p54 GP-A/index24 and the 2013 BASE29 precedent supply a potentially human-detectable polynomial. In high-first GF29 representation the original **p29 277-rune polynomial** P and the original **p50 256-byte numerical table polynomial** T both have factor `G(X)=15(X−24)^2`, high-first coefficients `[15,5,27]` with zero remainder. The first quotient Taylor jets at root24 are *independently known* from the original source: `QP(24)=25, QP'(24)=12` and `QT(24)=23, QT'(24)=12`, where QP=P/G and QT=T/G. These select the only simplest common-codeword affine identification, `QP=QT+2`, with coefficient alignment at the **same polynomial exponent**, and no fitted scalar, phase or orientation.

Original quotient lengths are `QP=275` and `QT=254`; left-pad the high-first table quotient with exactly **21 leading zeros**. The affine difference `QP-QT-2` is divisible by the **monic** repeated-root `F(X)=(X−24)^2=X^2+10X+25`. Thus the source data also specify exactly one further reversible residual `M(X)=(QP(X)-QT(X)-2)/F(X)` of **273 GP symbols**. If the original shared-codeword hypothesis hid English directly in this residual, M should reveal it. Both branch definitions were committed **before execution** in [`workplace/agent27-p29-p50-shared-root24-heldout-gate.md`](../workplace/agent27-p29-p50-shared-root24-heldout-gate.md). That commitment locked original p29 final32-runic FNV1a `b5b174ba` and independently original table final32-byte FNV1a `28de31c7`, with p29 suffix and p50 block withheld from alignment selection. It also froze root24, coefficient orientation, constants and the single residual decoder.

## Actual original inputs

| Source-exact test | Observation |
|---|---|
| QP and QT after exact G division | 275 and 254 GF29 coefficients, zero remainders, exact source forward replay |
| Full aligned source codeword relation `QP=QT+2` | **Fails at the first compared coefficient**; only **13/254** literal coefficients equal |
| Reserved first222 table-aligned quotient coefficients | **12/222** agree |
| Independently locked last32 compared quotient coefficients | **1/32** agrees |
| Longest contiguous run of matching quotient coefficients | **1 coefficient** |
| Higher source Taylor jet coefficients (orders0 through4) | P quotient: **[25,12,21,7,15]**; table quotient: **[23,12,14,14,7]**. First two support the known affine relation; at order2 **21 differs from14**, so higher-order identity fails |
| Forced original `M=(QP−QT−2)/(X−24)^2` | Exact division gives 273 runes, no remainder; **IoC = 0.0338019823**, near-uniform; its first 100 romanized GP characters begin `RACSYEOEAAEOEBEOGGMTTHOEAEGDOCJLYCPOEOIMIAPMAESRBAE...`, not readable English |
| Source-native known plaintext plant | First **273 original solved-LP1 GP symbols**, polynomially encoded using the unchanged original table quotient and frozen same operation, recover **273/273** exact source runes and full 277-coefficient re-encoding |

The source-derived D polynomial always has a repeated root by construction, so **exact division and re-encoding alone cannot authenticate plaintext**. Its output is uniformly distributed and incoherent. The original source blocks were never modified, and the 21-degree padding follows directly from high-first polynomial exponent alignment. The first mismatch and the independently withheld block failure exclude a literal common quotient codeword under the only source-selected scalar/constant. The next Taylor coefficient disagreement makes that failure particularly decisive.

## Cryptanalytic decision

**Retire the fixed high-first shared p29/p50 normalized quotient identity and the direct original 273-rune second-order residual as source-native English plaintext.** The independently motivated original double-root24 and prior signed-word index bridge are real arithmetic observations, but these do not supply a shared full codeword, recovered encryption stream, or unknown plaintext. Any further quotient skew, ad hoc trim, alphabet reinterpretation or hidden layer needs a separate first-party instruction; do not treat the uninformative 273-symbol residual as a key merely because its polynomial recomposes perfectly.

Reproduction: [`sims/lp2_p29_p50_root24_common_codeword_original_sft.cjs`](../sims/lp2_p29_p50_root24_common_codeword_original_sft.cjs). Read-only Node22 CommonJS; re-derives all factors from original ciphertext and table, checks both precommitted source block hashes, prints exact jet/equality/residual diagnostics, and exercises exact recovered native-GP plants. The exact source-locked reproducer passed **Windows Node22** in [run 44980783762](https://github.com/FlareZ123/liber-primus/actions/runs/44980783762); the run log explicitly names this script and reports the 13/254 original equality, 1/32 heldout, original IoC 0.033801982331394094 and **273/273** solved native GP plant.
