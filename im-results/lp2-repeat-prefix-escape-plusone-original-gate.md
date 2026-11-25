# Repeated-prefix variable-length GP29 escape: all-secret original-source obstruction

**Agent46, 24 November 2026, Director #2273.** The original book excludes every deterministic stationary predecessor-conditioned prefix code in the model below, with any secret GP29 codebook, if nonrepeat codewords are single runes and every repeated-prefix codeword emits 2–226 runes. Even independently keyed illustrated chapters fail at p40–53 for maximum escape length 53. No unknown plaintext, key or general enumerative-capacity impossibility is established.

[Executed reproducible SFT](../sims/lp2_repeat_prefix_escape_allsecret_sft.cjs) (commit [644611a](https://github.com/FlareZ123/liber-primus/commit/644611ad76eb2122bdd264f09922b3917abd6278)). The previous fixed +1 model and its original independent Windows run are summarized below.

## Inverse contract and exact proof

A state is the preceding emitted GP29 rune s, optionally paired with original visible word-role flags. Each of 29 source symbols has exactly one stationary codeword in that state. A nonrepeat codeword emits a single rune c != s. An escape begins with s and continues with at least one rune; its total length is at most L. Codewords are distinct and prefix-free in each state, so decoding determines the plaintext symbol and updates s to the last emitted rune. Grant the first rune as a free seed, all secret codebooks, arbitrary suffix strings and lengths, and internal repeats inside escape payloads. No English assumptions or key estimates enter the proof.

An observed transition at original index i is forced if there is no preceding equal-adjacent transition within L-1 positions. It cannot be an escape suffix: every such suffix follows a repeated prefix within that distance. Every forced unequal transition s->c needs a one-rune codeword; every forced equal transition needs an escape codeword whose first suffix is the actual next rune t. Distinct ordinary c require distinct codewords; distinct first suffixes t require distinct escape codewords even if later suffixes differ or lengths vary. The two sets are disjoint. A row's summed distinct counts thus lower-bound its required number of plaintext symbols. A sum >29 is impossible. The bound is monotone in L; failure to exceed 29 does not establish a feasible code.

## Original-input results

Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and the separate transcription agree on all 12,956 rune identities and 2,896 complete printed groups, including source line/page carries. The continuous tape has 86 equal-adjacent events. At L=2, state AE (GP index25) requires all 28 ordinary successors plus seven distinct first escape suffixes (2,3,10,15,23,24,28): **35 input symbols**. Twenty-five of 29 predecessor states violate GP29 capacity.

| Shared visible state | Maximum required codewords at L=2 | Largest excluded L |
|---|---:|---:|
| Previous emitted rune | 35 | 226 |
| Previous emitted rune + original printed word-start flag | 35 | 226 |
| Previous emitted rune + original printed word-end flag | 33 | 197 |
| Previous emitted rune + both flags | 32 | 161 |

At L=226, EA (28) needs 28 ordinary successors and two different forced escape starts at original zero-based offsets 456 and 10508 (first suffixes 7 and14). At L=227 the bound drops to 29; this is a limitation of the certificate, not evidence of existence. Printed roles are granted as publicly known ciphertext state.

The nine independent chapter maxima at L=2 are 21,27,27,28,25,28,28,32,13. The p40–53 chapter rejects through L=53: W (7) has 27 distinct forced ordinary successors and three escape starts with first suffixes 13,22,27. Private chapter codebooks plus independent word-start or word-end state still reject through L=52 or43 respectively; both word flags together give a maximum of28 and are not excluded by this test.

## Distinct restrictions on mixed and word-contained escapes

Prefix-freeness means a state may choose either one literal repeated codeword [s] or longer [s,...] codewords, never both. If that mixed regime is granted at L=2, 25 predecessor states cannot support longer escapes; **at most three of the original 86 equality sites** could begin multi-rune escapes (states C, P, A, one event each). This is an upper bound, not an inferred true parse.

If escapes cannot cross printed word boundaries and the predecessor remains continuous, **18 original words end with their first observed equal-adjacent transition**. It cannot be the suffix of an earlier escape in that word and there is no room for even one suffix rune. Examples: p1:r194 (word101), p8:r107 (word438), p12:r207 (word693), p30:r262 (word1697). This excludes the word-contained multi-rune regime at every escape length even with secret per-word codebooks. Arbitrary per-word predecessor resets or literal single-rune repeated outputs change the premise.

## Reversible controls

The positive plant uses cyclic steps 1–27 for input indices 0–26, [s,s+1] for input27, and [s,s+2,s+2,s+3] for input28, modulo29. This is prefix-free and its four-rune escape deliberately contains an internal equality. Three seeds (0,13,28) each invert and re-encode **3,008/3,008** source symbols (2,979 solved-native GP runes plus all 29 input indices to exercise all codewords). All three ciphertexts contain 3,089 runes including the seed, and each forced-row bound is24. The controls validate the decoder and the obstruction on nontrivial variable-length codes, not historical authorship. Code Mode JavaScript execution used the exact repository corpus, transcript and solved-native register. No new independent CI execution is claimed.

## Relation to the earlier fixed +1 suffix

Agent25's original fixed F-escape model uses [s,s+1] for the sole escaped input F and a nonzero cyclic step for each other input. Its four native p57 controls invert exactly. The original 86 repeated events have only two next steps +1; the first contradiction is TH,TH,P at offset122. [Original SFT](../sims/lp2_repeat_prefix_escape_source_sft.cjs) and [Windows run 44167137098](https://github.com/FlareZ123/liber-primus/actions/runs/44167137098) remain available. The present result broadens that test to arbitrary secret codebooks and variable suffix lengths without repeating its fixed decoder search.

## Source-conditioned extension: p50 bit0 clock (Agent28, 25 November 2026)

The independently nominated [p50 base60 phase-zero parity selector](lp2-p50-bit0-dualecho-two-tap-original-gate.md) has opposing observed associations with adjacent equality and five-back word-local echo. It might support separate prefix codebooks for different public states, escaping the previous predecessor-only obstruction. Freeze the same continuous global clock: at original offset i≥1, use the parity of the original grid byte at (i−1) mod256. The state is the previous emitted rune plus that public bit. No source authentication of the bit as an opcode is asserted.

Apply the existing forced-row theorem to this more generous family, allowing an arbitrary, independent secret GP29 codebook for each of 58 states and, separately, each augmented source-visible state. All legal codeword starts use the preceding emitted rune and the public state at the **start of the codeword**, not at the end. All suffixes of escapes begin with a forced or unforced repeated prefix; no one-rune repeated codeword is permitted in this contract. The same distance certificate applies independently of how a codebook was obtained.

| Shared state | Largest forced row at L=2 | Excluded maximum escape lengths |
|---|---:|---:|
| Predecessor + parity | 32 | 2–171 |
| Predecessor + parity + printed word start | 32 | 2–130 |
| Predecessor + parity + printed word end | 32 | 2–100 |
| Predecessor + parity + both word flags | 31 | 2–50 |
| Predecessor + literal leading-zero bit + parity | 32 | 2–162 |
| Predecessor + full 256-phase index | 8 | None by this certificate |

At L=171 the even-parity AE row (GP25) requires all 28 ordinary unequal successors plus two distinct forced escape suffix beginnings at global offsets 1591 and 3140 (next GP indices10 and2). Even with both word flags, at L=50 the even-parity, internal-word F row requires 27 ordinary successors plus three escapes (offsets2192,7118,8776; suffix starts26,6,19). These are exact incompatibilities with 29 deterministic codewords, independent of English. At each tabulated next length the largest required row falls to29, not a feasibility proof.

Three bit-dependent prefix-code plants, seeds0/13/28, each recover all 3,008 native GP symbols plus exact cipher replay (3,089 runes including the seed); their L=4 maximum forced-row bound is23. Their 27 ordinary mappings and two genuinely bit-dependent escape paths (lengths2 and4) demonstrate that the certificate admits its own lawful family. This was executed on canonical inputs in the connected JS runtime; standalone [CJS SFT](../sims/lp2_p50_bit0_prefix_escape_allsecret_sft.cjs), commit 44fc788045cb49ed9be77ad36d405651022e6b29. No independent Windows CI run is claimed.

**Important boundary:** separate secret codebooks per illustrated chapter are not excluded here once parity is added: L=2 maxima are 15,21,23,26,20,23,24,29,10. Do not infer a chapter-specific solution or fit arbitrary phase/word codebooks on this evidence. The frozen shared parity interpretation fails as a short repeated-prefix encoder; its observed echo-rate association does not fix that failure. This does not close #2273's broader criterion.

### Chapter-private parity codebooks: exact language-envelope refinement

The preceding capacity result leaves independent illustrated-chapter codebooks possible. The table-containing p40–53 chapter provides a separate necessary condition without assuming original word boundaries survive, and without assigning any plaintext rune to any codeword.

For maximum escape length L=2 the parse is forced: a nonrepeat codeword is one rune and a repeated-prefix codeword is exactly two. Grant the chapter's first cipher rune as a free IV. In each of the 58 predecessor/parity rows, count distinct observed codewords and sort counts descending. Sum the sorted rows coordinate-wise into H. For every arbitrary injective labeling of those rows with GP29 plaintext symbols, its descending global count vector is majorized by H: the sum of any k labels is at most the sum of the k largest counts in each row. Convexity of x(x−1) gives an exact upper bound on the candidate plaintext IoC. Aligning all rows' largest counts attains the histogram bound, so no unknown key can improve it under this model.

The 3,008 original p40–53 runes parse into 2,989 source symbols and a seed (18 escapes). The exact maximum IoC is **0.051841132793**, below the minimum **0.055968717067** among every same-length contiguous window of the three source-calibrated literary reference corpora and every circular solved-native starting position (594,940 windows; overlapping windows are not independent trials). The other eight chapters have looser exact bounds and are not separately excluded by that comparator. This is a necessary-condition rejection of that specified ordinary-language register, not a theorem that no atypical plaintext can exist.

For arbitrary allowed escape lengths 2..L, let R be observed repeat count and F be the number of forced ordinary starts, meaning an unequal transition with no repeated transition in the preceding L−1 positions. Forced repeated starts G each require at least one extra emitted rune. Any possible plaintext length n therefore satisfies max(F,N−1−(L−1)R)≤n≤N−1−G. Sort the forced ordinary counts in every row and sum them into H, then grant **every other candidate plaintext position** an arbitrary label, all concentrated on the largest coordinate H[0]. The resulting majorizing envelope covers all parses, all unknown escape suffixes and lengths, all label assignments, and does not require retaining the printed spaces. The global p50 clock remains fixed; chapter-private alphabets are completely free.

| L | Plausible n | Maximum original IoC envelope | Smallest same-length native IoC, all allowed n | Minimum native−envelope gap at matched n |
|---:|---:|---:|---:|---:|
| 2 | 2,989 | .052957229 | .055968717 | .003011488 |
| 3 | 2,971–2,989 | .053723537 | .055961915 | .002245180 |
| 4 | 2,953–2,989 | .054436996 | .055961915 | .001531721 |
| 5 | 2,935–2,989 | .055294670 | .055961915 | .000674047 |
| 6 | 2,917–2,989 | .056214151 | .055961915 | −.000245434 |

The L2 generalized bound is deliberately looser than the exact forced parse. All lengths 2–5 fall below every matched reference window, even granting the unforced symbols free and adversarially favorable. L6 is **not** excluded by this relaxation. The range 2–10 uses 145 distinct possible decoded lengths and 86,297,620 length/window pairs (not independent observations); each minimum is calculated by sliding exact integer collision counts. Shakespeare, Gibran and Emerson use the established source-calibrated ING/IO/QU rune orthography; the solved-native register is 2,979 authentic GP symbols, treated circularly only for the comparator.

Four positive plants (L=2,3,4,8) each use 58 independently shuffled secret input alphabets, a genuine prefix code, native donor 2,979 symbols, and the original global p50 bit clock. All 11,916 symbols recover exactly and each actual histogram lies within its respective proven envelope. [Reproducible SFT](../sims/lp2_p50_bit0_prefix_escape_chapter_majorization_sft.cjs), commits 46f567673a14037b57bc2ea9c0f41058f0678dad and c8d8e2aba62ef25bb516076257aaeaa57181d6ce. The original and control calculations ran in connected JS; no standalone Windows CI claim.

**Decision:** retire the ordinary GP-native prose interpretation of shared or chapter-private short repeated-prefix encoders in the precise regimes rejected above. The pure capacity theorem excludes shared codebooks without a language assumption; the chapter-private L≤5 conclusion is conditional on the observed native-language register. A chapter-private encoder allowing L≥6, additional state, or a compressed intermediate remains outside the envelope rejection. There is no independently authored selector for any such rescue. No plaintext recovered.

## Source-selector audit for the remaining L6 envelope (Agent24, 25 November 2026)

The L6 statistical envelope is the only chapter-private maximum-length case not rejected by the matched-native IoC bound. I checked whether an original operand independently selects that maximum or an L6 language/codebook. **No such selector is established.**

- **Chapter geometry:** p40–53 is a 14-page section. Its p40 red heading is 8 runes; p50 is a 32×8 numerical table; p53's red span is 51 runes across 12 printed words, with lengths \`[5,4,4,11,2,3,2,6,5,5,2,2]\`. The single six-rune item is a ciphertext word, not a printed instruction that escape codewords have maximum length six. See [page-boundary carry gate](lp2-p40-53-page-boundary-carry-gate.md) and [p53 red-span boundary adjudication](lp2-p53-red-span-word-boundary-adjudication.md).
- **Insect emblem:** the p53 insect is a reused standalone drawing also present in LP1 p5 and LP2 p55; it has no caption selecting a textual keyword. Inferring the six-letter word \`CICADA\`, or using six legs, is interpretation rather than an authenticated codebook instruction. The existing [caption-omission gate](lp2-moth-caption-omission-gate.md), [art-coordinate registration audit](lp2-moth-art-coordinate-registration-source-gate.md), and [13/17/221 cycle audit](lp2-magicicada-13-17-221-allsecret-gate.md) do not supply an L6 selector.
- **DH23 value 6:** the player-visible worked example contains \`a=6\` and \`b=15\`; these are two private exponents in a Diffie–Hellman example. No source rule maps Alice's exponent specifically to a maximum escape length, and choosing \`a\` over \`b\` for that purpose is arbitrary. See [the DH23 player-visible gate](cicada2013-dh23-worked-example-player-visible-gate.md).
- **Authentic 2013 ISO sidecar:** the full 136,398,848-byte `3301.iso` has now been hash-verified and all seven historical phone-stage XOR slices replayed from its original `DATA/560.13`/`DATA/560.17` extents. The consolidated [pklmx continuation report](pklmx-2013-onion-continuation-gate.md) classifies that route as a 2013 recruitment branch and explicitly finds no LP2 selector, key, or plaintext; the separate [unclaimed-sector audit](cicada2013-original-iso-unclaimed-sectors.md) finds no extra hidden whole-sector or file-slack payload. This establishes the ISO's historical bytes, not an L6 codebook or an LP2 link (Issue [#2807](https://github.com/FlareZ123/liber-primus/issues/2807)).
- **p50 parity:** the fixed bit-0 clock is a plausible source-visible public state selector, but the source does not label it an opcode or specify an L6 language, escape maximum, or chapter-private codebook. See [the p50 bit-0 original gate](lp2-p50-bit0-dualecho-two-tap-original-gate.md).
- **2016 message:** the authenticated 43-word message is not established as the receiver/codebook for the p50 table or the chapter-private escape stream; the proposed word receiver was separately rejected as unsupported in [the Cicada article/p50 word-map gate](lp2-cicada-article-p50-row27-word-map.md) and Issue #304.

The exact missing premise is an author-authenticated rule selecting **L=6 rather than 2–5 or another maximum**, together with a deterministic derivation of the corresponding chapter-private language/codebook and a reversible serialization of the 18 escape payloads. The small L6 IoC-envelope overlap (\`−0.000245434\`) is only failure of this particular statistical exclusion; it is not evidence that an L6 encoder exists. Do not rescue the model by assigning L6 from a nearby numeral, an insect interpretation, or a single six-rune ciphertext word.

This closes only the bounded **“find an original L6 selector”** branch negatively. It does not close #2273 or exclude other source-selected side information, other code families, or a genuine original sidecar.

## Decision

Retire short stationary repeated-prefix escapes under the stated contracts, including the independently proposed p50 parity-conditioned shared-codebook extension (through L=171, or50 with both printed-word flags). The parity extension with private chapter codebooks is not excluded by the pure forced-row certificate, but the independent p40–53 language-majorization envelope excludes the ordinary native prose register for maximum lengths2–5 under that exact state and frame. A remaining proposal must specify additional state or a source-derived side channel, allow ordinary nonrepeat codewords to emit more than one rune, change the source alphabet, permit one-rune repeated tokens, or support long escape payloads (necessarily at least 227 globally, or54 in p40–53 with chapter-private predecessor-only state). These are length lower bounds, not inferred historical lengths. The bounded L6 source-selector audit found no original operand selecting L=6 or an L6 language/codebook; its statistical overlap is not a rescue. Arbitrary block/enumerative coding and source-selected external side information remain outside the obstruction. #2273 is not closed; no unknown plaintext or authenticated key was recovered.
