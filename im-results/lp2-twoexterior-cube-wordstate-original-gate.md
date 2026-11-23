# A source-motivated two-exterior word-state GP29 inverse fails on original LP2

**Agent 5, 23 November 2026; Director #2384. Classification:** one **fully specified, source-constrained candidate** rejected against an entire original chapter and an independent chapter, with exact 12,956-rune replay and authentic solved-text positive. No unknown plaintext, secret authorial state update or receiver found.

## Why this is a different decision

The [completed raw-Latin26 word-start exclusion](lp2-rawlatin26-causal-wordstart-allkey-gate.md) shows that an always-identical first-word state cannot emit the **29** observed original GP first-rune types from a 26-letter plaintext alphabet. The Director's subsequent exact source count on #2378 establishes that a state consisting **only of the preceding ciphertext word's last rune** also fails the necessary support bound: 24 of its 29 state rows show more than 26 distinct next-word initial runes, and five show all29. This does **not** disprove a richer preceding-word state.

The source provides two independent possible clues for such a state: solved p57 says **SHED OUR OWN CIRCUMFERENCES**, suggesting two outer runes of a printed word, while the independently authenticated 2016 signed word-number circuit selects the bijective **GP29 cube** \`Q(x)=x³ mod29\` with \`Q⁶=identity\`. Solved p56 supplies the precedent for additive GP29 encryption. An evolving two-exterior cube clock uses those concrete operations without inventing 841 arbitrary substitution tables. The competing explanation is that these source clues apply elsewhere and the ciphertext has a different encoder.

**Critical missing instruction:** no authentic LP2 clue explicitly says to use the preceding word's outer runes as an encryption key, to run opposite cube directions or to add the two states. The following is one *frozen test*, not a claimed historical mechanism.

## Frozen, invertible operation before looking at original output

Treat the exact 2,896 complete original LP2 words as a continuous ciphertext stream, retaining **all 32 cross-page carried words** and 12,956 original rune indices. Do not make new words at lines, pages, cuneiform-number annotations or punctuation art. Number runes within each complete word \`j=0,1,...\`.

For a ciphertext word \`C_i=(c_0,...)\`, let \`L\` and \`R\` be the first and last GP29 indices of the **previous complete ciphertext word \`C_(i-1)\`**. For the first word only, use the authenticated 2016 message's first literal word **HELLO**, whose source-native GP29 indices are \`[8,18,20,20,3]\`, giving \`L=8,R=3\`. There are no private secret parameters, page restarts or fitted offsets.

With \`Q(x)=x³ mod29\`, define the two ends to move in opposite six-cycle directions:

\`\`\`text
k_j = Q^j(L) + Q^(-j)(R) (mod29)
P_(i,j) = (C_(i,j) - k_j) mod29
C_(i,j) = (P_(i,j) + k_j) mod29
\`\`\`

State updates only between **complete printed words**, from the actual preceding transmitted ciphertext edges. The inverse and forward function use the same preceding ciphertext, so this is a well-defined **fully reversible complete-book codec**. Period six and backward iteration are exact properties of the authenticated GP29 cube permutation; the opposite-direction choice is conjectural, fixed before the original source test, and is not tuned against decoded text.

Unlike an affine progressive alphabet, \`k_j\` is a nonlinear six-periodic orbit sum controlled by the *preceding* word's two edges. The original first-word seed is a literal signed-source word. It is a genuine word-to-word evolving state law even though the particular law does not work.

## Original source and decisive output

The [read-only exact-source single-file test](../sims/lp2_twoexterior_cube_wordstate_original_sft.cjs) joins every original rune word across page and line wraps, removes exactly the isolated numbered cuneiform annotations, and asserts the concatenated **12,956** numeric indices exactly equal original physical pp0–55 from \`lp2-corpus.json\`. It also tests an exact forward replay of **all 2,896 encrypted words** after inversion.

| Source-exact receiver | Runes decoded | Unigram GP29 IoC | Beginning of decoded transliteration |
| --- | ---: | ---: | --- |
| Original physical pp16–21, first gate | **1,613** | **0.034325632770** | \`LEABEMFUDNGWHAEEIAYJTRPYOEUEIAW...\` |
| Distinct physical pp40–53 | **3,008** | **0.034453075802** | \`UJEOWIANGEAYMNNAEWNGIPSMGCR...\` |
| Entire original unknown pp0–55 | **12,956** | **0.034491624355** | No coherent English passage |
| Genuine clear p57 GP29 source reference | **95** | **0.0627099664** | \`PARABLE LIKE THE INSTAR...\` |

Both original source passages remain near the uniform alphabet coincidence level \`1/29≈0.0344828\`, and neither yields 300 continuous native-English original runes under the fixed algorithm. The 3,008-rune second passage was not used to select the law. Its rejection is a genuine independent original-input test, within the limits of the same unknown-book text register.

For a **native positive**, take the full authenticated 95-rune, 20-word solved p57 parable and encrypt it using the identical HELLO seed and recursively updated two-edge **ciphertext** state. Decrypt that planted cipher and recover **95/95 exact native runes** across all original source word boundaries. This shows the code has the necessary language discrimination and complete replay property. It does not authenticate the candidate operation as Cicada's own cipher.

## Decision, scope and a useful stop

This exact **oppositely clocked, two-edge predecessor cube/additive word cipher fails** to recover ordinary native-GP plaintext in original pp16–21 or pp40–53, even while fully reversible and source-initialized. It cannot satisfy Director #2384's required coherent 300+200 original-rune plaintext. The more general two-edge hypothesis is underconstrained: arbitrary 29² predecessor-state alphabet tables or fitted nonlinear word resets could be made to fit invented passages and are prohibited by the assigned premise gate.

**The remaining source input is an explicitly authored direction/operation tying both previous-word exterior glyphs to the next word's rune alphabet and clock, with a source-fixed initial state.** The signed 2016 message and solved p57 provide vocabulary for a hypothesis, but no such particular receiver instruction. Stop this finite branch and preserve the distinct source-visible two-edge possibility only as an open architecture. Do not promote this negative to the established cipher synthesis.

**Reproduction:** [Windows Node22 CommonJS source test](../sims/lp2_twoexterior_cube_wordstate_original_sft.cjs); read-only and package-free. The script asserts all original rune identity and count invariants, the exact values above, two-way complete-original replay, the six-cycle field identities and authentic p57 95/95 planted recovery.
