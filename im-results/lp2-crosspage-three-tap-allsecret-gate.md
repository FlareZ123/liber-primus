# Original LP2: exhaustive two-back ciphertext-state GP29 inverse across physical page seams

**Decision, Agent 9 (15 November 2026; Director #1089):** A reversible linear two-back ciphertext-state decoder, followed by **any secret GP29 output substitution**, fails to recover source-native English-level rune concentration on every one of the eight major original LP2 source sections. Each section may choose all its parameters independently, and its state continues uninterrupted across physical page breaks, including **12 complete printed-word seams within the last section p40–55**. This is a finite, exhaustive conditional exclusion of one genuinely cross-page state architecture. **No actual unknown LP2 plaintext, original key or author-specified cipher operation is recovered.**

Reproducer: [single-file read-only CommonJS SFT](../sims/lp2_crosspage_three_tap_allsecret_sft.cjs), executed successfully as the final step of [manual Windows/Node22-compatible Agent9 research suite, GitHub Actions #43705145603](https://github.com/FlareZ123/liber-primus/actions/runs/43705145603). Original and source-shaped synthetic controls are processed by the same complete reversible decoder.

## Plausible clue and necessary operator

The manuscript uses the authenticated 2013 **29-character Gematria Primus** alphabet; the first unsolved chapter's original 13-dot mark is printed in three columns, and its rune layout and other visual sections create natural opportunities for a human to consider a short-state, multi-track operation. The operative **three-tap linear filter is a proposed mathematical consumer**, not a decipherment direction written by Cicada. The question was whether an inexpensive, fully exhaustive finite version of this idea, allowing a freely secret key and output alphabet, could produce actual native-GP prose and stay coherent across printed words that continue from one physical page to the next.

The stronger competing explanation is a nonstationary nonlinear cipher, an external high-entropy key, a different plaintext register or a process that moves the printed spaces. None is tested here. Crucially, a free inverse fitted to every individual rune is excluded from this experiment: that construction is always able to manufacture arbitrary text, so it cannot be an independently constrained decryption.

## One invertible rule, entire secret-key family

For each of the eight authentic source sections separated by printed \`$\` boundaries, let \`C_i ∈ Z/29Z\` be the original ciphertext rune index. The proposed original plaintext is

\[
P_i = \sigma_s\!\left(C_i + b_s C_{i-1}+c_s C_{i-2}\pmod{29}\right),
\]

where \`s\` indexes the section and \`b_s,c_s ∈ {0,…,28}\` are otherwise completely arbitrary secret coefficients. The output alphabet \`σ_s\` is **any of the 29! secret permutations**, chosen independently by section, and does not need to be an affine or Caesar alphabet. At the section start, the two absent previous-cipher values are initialized to zero; the bound conservatively omits the first two positions. All original physical-page continuations retain the same state and alphabet. There is no key reinitialization between adjacent physical pages inside a source section.

This decoder is always invertible, even for secret \`b_s,c_s\`:

\[
C_i=\sigma_s^{-1}(P_i)-b_s C_{i-1}-c_s C_{i-2}\pmod{29}.
\]

More generally, an arbitrary nonzero coefficient \`a_s\` on \`C_i\` can be absorbed into a new permutation \`σ_s\`; therefore exactly **29²=841 pairs** \`(b_s,c_s)\` exhaust every reversible three-tap GP29 linear equation followed by any stationary secret alphabet, including all **23,548** nonzero-coefficient normalized linear triples. All secret additive offsets are absorbed into the permutation too.

For a proposed English plaintext, the ordinary rune **index of coincidence** (IoC) is invariant under every \`σ_s\`. Thus compute the unpermuted candidate histogram for all 841 coefficient pairs and take the highest possible IoC. This is a strict **all-key upper bound on native-GP symbol concentration** for the specified state family. No dictionary, candidate word, named key, English-phrase scoring, or original-text-fitting permutation enters the search.

## Untouched original ciphertext results

The source is the complete original-image-derived [canonical master transcript](../resources/liber-primus/lp2-transcription.txt), cross-checked rune for rune against the 12,956-index [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json). The eight printed \`$\` sections have source-native rune lengths **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680 and 3,316**; the first two positions of each section are excluded from projection histograms.

| Source section | Original runes | Best \`(b,c)\` among 841 | Maximum original projected IoC | Independent native-GP Shakespeare IoC |
| --- | ---: | :---: | ---: | ---: |
| 0 (pp0–2) | 729 | (11,27) | **0.03594909** | 0.06374079 |
| 1 | 1,145 | (28,0) | **0.03570044** | 0.06319205 |
| 2 | 1,738 | (28,0) | **0.03544934** | 0.06286516 |
| 3 | 1,894 | (28,0) | **0.03536614** | 0.06128063 |
| 4 | 1,021 | (4,1) | **0.03549842** | 0.06155442 |
| 5 | 1,433 | (27,16) | **0.03566678** | 0.06042623 |
| 6 | 1,680 | (28,0) | **0.03541215** | 0.06254928 |
| 7 (pp40–55) | 3,316 | (28,0) | **0.03539266** | 0.05970595 |

The reference is a source-native GP29 encoding of eight **fixed, consecutive, disjoint Shakespeare windows** from the existing pinned first-300,000-letter control, using the authentic GP29 orthography (including single-rune TH/NG/ING and the historical aliases). Each window has exactly its original section's rune length. Those observed GP control IoCs range **0.05970595–0.06374079**, while even the **best possible original inverse** among every secret three-tap coefficient and every GP29 output substitution stays **below 0.03595**. The smallest chapter-matched gap is **0.02431329** IoC. The independently solved original p57 clear-GP reference has **0.06270997** IoC.

The result does not rely on 29-symbol frequencies being in their conventional GP order. Any secret alphabet merely relabels the counts and cannot raise IoC. The entire unseparated 12,956-rune original book under a single shared three-tap coefficient has its optimum at **(b,c)=(28,0)** with IoC **0.03532506**, a first-difference transform, so a single global state relation also fails. Other coefficients give lower original global concentration. The near-uniform source result is a stringent obstacle to producing ordinary clear-GP English with this particular inverse.

## Actual page-carry dependence, not pseudo-seams

The standalone reproducibility check reconstructs **2,896 authentic source-printed complete words** and verifies **32 original words** crossing physical page breaks, including the p50 runeless-table jump. Inside section 7, **12 separate original words** cross a physical-page cut (pp40→41, 41→42, 42→43, 43→44, 44→45, 45→46, 46→47, 47→48, 48→49, 51→52, 52→53 and 54→55). The proposed ciphertext-state register \`C_{i-1},C_{i-2}\` stays continuous through every such cut and through ordinary printed word breaks, so this is a **cross-page-coupled** test rather than independent per-page guessing.

The 12/32 split-word sites alone carry no assumed plaintext and generate no artificial language oracle. The information comes from the requirement that the *same secret state/filter and output alphabet* operate across all original page seams within each complete visible section. The continuous, source-defined operation is reversible, so a genuine cipher of this form could be tested with one section and independently extended to all its seams.

## Positive and interpretation

The SFT constructs all eight original-length sections from the Shakespeare GP29 controls, chooses **different nontrivial two-back coefficients** and different secret output permutations by source section, and enciphers every native rune. The same unchanged decoder restores **12,956/12,956 planted GP runes**, exactly reenciphers every site and transports state across all physical page cuts. The corresponding arbitrary original ciphertext inverse also forward-reconstructs all **12,956/12,956** genuine symbols. These are implementation controls: **every fixed bijection will reencrypt**, even a wrong one. The missing original plaintext concentration is the discriminating test.

This excludes the direct, stationary-per-section three-tap **linear ciphertext predecessor** model with a secret arbitrary GP29 output alphabet for the tested source-native English register. It extends beyond the earlier page-keyed **plaintext**-feedback affine seam gate #977 because the operands and state direction are different, and every secret output alphabet is granted. It does **not** exclude secret coefficients that change inside each section, more than two predecessor states, nonlinear predictors depending jointly on earlier symbols, a variable-length binary encoding, alternative language, a different page/word segmentation, or original-language statistical anomalies. It also does not prove the three-column mark was an instruction; that remains an exploratory premise.

**Research fork:** The original page-carry geometry supplies useful continuous-state tests, but neither the original three-column artwork nor source history identifies the actual reversible value operation and key. Since even the complete short-state linear family has no native-GP plaintext concentration, do **not** extend it by adding arbitrary coefficient clocks and tuned exceptions. Seek an independently visible nonlinear transition, authentic external key material, or an actual withheld original plaintext span; then use the same 12 cross-page seams as a blind consistency control.
