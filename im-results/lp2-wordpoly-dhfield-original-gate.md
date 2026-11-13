# GP29 word-polynomial field readout: full secret-family original-cipher gate

**Agent 18 · 13 November 2026 · intermediate original-cipher decision.** The 2,896 original unknown LP2 rune words do not directly encode 2,896 ordinary native-GP English plaintext symbols under any of the three source-motivated finite-field extraction families below. This is a test of a new possible decipherment architecture, **not an identified authorial cipher**. No unknown LP2 plaintext, key, decipherment mechanism or continuation was recovered.

## Upstream premise and discriminating decision

The independently signed 2016 clue says that the manuscript's words are the map and their numbers the direction. The independent signed 2013 TCP worked example supplies the BASE29 3301 digits \`3QO\`, which define the established quadratic \`H=3+26X+24X²\` if interpreted as ascending polynomial coefficients. The original p39 red rune triad gives \`G=27+5X+15X²=15(X−24)²\` over GF29. The original 256-byte numerical table and p29 each have the documented G factor; the table also has H. Physical p3's red triad defines the primitive 840-order field element \`u\` through \`u²=3u+8\`.

A new, finite possibility is that **each complete ciphertext word is an overcomplete encoding of one plaintext GP rune**, permitting the printed text to be a code-group carrier rather than word-preserving encrypted prose. This would make its unusual word lengths less puzzling. The conjectured connection is to interpret each word's literal GP ordinal sequence as polynomial coefficients, evaluate at the visually/source-marked double root **24**, and use the resulting two field coordinates as a plaintext-carrying word symbol:

\`\`\`text
W(X)  = c[0] X^(L−1) + ... + c[L−1]  over GF29
E     = W(24)
D     = W'(24)
\`\`\`

The pair \`(E,D)\` is the exact residue of W modulo \`(X−24)²\`, the marked factor of the original table/p29. This test evaluates the words in printed order, including the **32 words crossing physical-page boundaries**. Full reversal of each word is the single independent coefficient-orientation alternative. **There is no original instruction establishing that word polynomials, rather than page polynomials, should be evaluated this way.** A successful direct readout would have produced a concentrated GP-English one-symbol-per-word stream, inviting a full lossless side-channel reconstruction.

## Complete original-cipher extraction tests

All inputs are the canonical 12,956 unknown runes, 2,896 complete words and the published 29-symbol GP order. For every variant below, the **best case is selected adversarially over the complete secret family**, rather than fixing a favorable historical key:

1. **Arbitrary nonzero linear trace:** \`P = aE+bD+c mod29\`, all **840** nonzero \`(a,b)\` for each coefficient direction. The unknown \`c\` only relabels symbols and cannot affect IoC. Any trace from the p3/H quadratic fields after multiplication by an arbitrary nonzero secret field element is in this linear family. **1,680** original readouts in total.
2. **Field norm after any secret field translation:** For all **841** offsets \`(a,b)\`, compute \`Norm_H((E−a)+(D−b)z)\` in the 2013-derived field \`z²+18z+11=0\`, or \`Norm_p3((E−a)+(D−b)u)\` in the p3 field \`u²−3u−8=0\`. Each allows arbitrary field multiplication as an output relabeling, plus an arbitrary GP symbol relabeling. Both word directions: **3,364** original readouts.
3. **Primitive field logarithm:** Map \`(E,D)\` to \`E+Du\`, take its discrete log to the exact p3-source primitive \`u\`, allow **all 840 secret phase offsets**, both exponent signs, then output either the low or high base-29 digit of the resulting exponent 0–839. The two orientations give **6,720** original readouts. Zero field elements (two forward words or six reversed words, including trivial length-one zeros) are marked with GP index28; the zero handling is a hypothesis, not source-authenticated.

Index of coincidence \`IoC=Σ_r n_r(n_r−1)/(N(N−1))\`, with N=2,896, is invariant to **any** final secret global permutation of the GP symbols. Results:

| Exhaustive original readout | Printed polynomial order, highest IoC | Reversed word coefficients, highest IoC |
| --- | ---: | ---: |
| Any nonzero linear trace \`aE+bD\` | **0.0353894121** | **0.0357095488** |
| Any translated field norm in signed-2013 field H | **0.0360301625** | **0.0361821201** |
| Any translated field norm in p3 primitive field | **0.0360320709** | **0.0361620817** |
| Either base29 digit of primitive logarithm, both signs, all phases | **0.0346076776** | **0.0347696543** |
| **Best of all 11,764 specified original tests** |  | **0.0361821201** |

The winning candidate is the **reversed-word H-field norm** with secret field translation \`(a,b)=(27,27)\`. This is a post-selected numerical maximum, **not** recovered authentic key material. Its IoC remains close to the 29-way random baseline 1/29=0.03448276. No best candidate remotely approaches a genuine original-language GP symbol distribution.

## Unfitted natural-language source control and lossless positive plant

The independent, repository-preserved Shakespeare source is GP-transliterated with the normalizer used elsewhere: QU→CW, V→U, K/Q→C, Z→S, and greedy recognition of TH, NG, EO, OE, AE, IA, EA. Its first 300,000 characters yield **216,874 GP runes**. The first 2,896 symbols have native **IoC 0.0617109896**. A fixed stride-101 sample of **2,119 original-text windows**, each exactly 2,896 symbols, has **minimum IoC 0.0547588717**, still far above **every** original-source candidate. The reference window and alphabet are never fitted to original ciphertext.

To prove this family *could* reveal real GP text in similarly shaped code groups, a reversible planted word encoder preserves **all 2,896 original word lengths and every rune except the last of each word**. It chooses the last symbol uniquely so that \`W(24)+2W'(24)=\` the next authentic Shakespeare GP rune, producing **2,896/2,896 correct** recovered plaintext runes on exact decoding. Preserving the untouched prefixes as a side register reconstructs the complete 12,956-rune planted carrier. The detected plaintext has the native IoC above. This positive is an implementation/capacity control, **not** evidence that LP2 actually used this codec. The norm and discrete-log proposals are extraction tests; additional side information would be needed for arbitrary-lossless reconstruction.

## Decision

**Retire direct one-rune-per-complete-word GP-English readout from marked-root polynomial evaluation under every secret linear trace, all secret H/p3 field-norm translations and every p3 primitive-log phase covered above.** The source does not fix a word-field operation, and allowing 11,764 arbitrary key choices produces no authentic phrase or useful plaintext register. A different nonlinear word code, variable state across words, a second encryption layer, altered segmentation or an unexpected plaintext language is not excluded.

Further use of the p29/p50/p39 polynomial bridge needs an independently signaled **consumer that recovers a full original passage**, including any padding/side information and the original page’s punctuation and word structure. Extending these failed word-projection families with fitted offsets, ad hoc symbol assignments or an unselected key would not follow from the evidence.

[Single-file CommonJS source-native SFT](../sims/lp2_wordpoly_dhfield_allsecret_sft.cjs), reading only the pinned original corpus, original word parser and independent Shakespeare control. The script explicitly asserts original counts and both red triads, enumerates all cases, checks the frozen original-cipher maxima, builds a real GP native-text positive code, re-encodes every planted word and prints a compact JSON decision.
