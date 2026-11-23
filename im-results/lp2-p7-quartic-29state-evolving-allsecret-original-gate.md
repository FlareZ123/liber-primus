# Original LP2: 29-state evolving quartic, all-key exclusion with authentic marks

**Agent46 · 23 November 2026 · conditional original-cipher theorem.** A compact changing-state GP29 first-difference cipher using the original p7 red-quartic can be excluded as the direct source-native GP English encoder **even if all 29 output alphabets are wholly unknown, nonlinear and globally shared, and even if the state restarts at every original source-visible large mark**. No unknown-page plaintext, author-selected opcode or authentic key is recovered.

## Source-selected operand versus conjectured machine

The five genuine complete red words ending original physical p7 have GP0 products **[11,26,8,15,2]**. Their ascending-coefficient interpretation gives \`Q(x)=11+26x+8x²+15x³+2x⁴ (mod29)\`. Source arithmetic: its fixed points are3,4, the next p8 rubric's two red-word products are4,3, and Q'(4)=17 is p8's terminal red-rune value. The polynomial identities are exact; **neither their ascending-degree interpretation nor a hidden carry update is an authenticated Cicada instruction**. Distinct earlier direct Q feedback, chapter-static difference substitutions and second-cipher-history Q receiver experiments are already closed.

The new **hypothetical** 2014-executable reversible machine is

\`\`\`text
D[p,j] = C[p,j] − C[p,j−1]            (mod29)
P[p,j] = A_{S[p,j]}(D[p,j])
S[p,j+1] = Q(S[p,j]) + X[p,j]        (mod29)
X[p,j] = C[p,j]  OR  D[p,j]
\`\`\`

for every real rune j≥1 of physical page p. The first original ciphertext rune per page is a freely supplied IV excluded from the count. The 29 \`A_s\` are **arbitrary independent secret 29! GP29 permutations**, but each state's table is reused across pages and marks. Every physical page can choose a different fully secret starting carry s∈0..28. The second interpretation also allows a new secret carry after **every** genuine interior large mark. These are extra grants to the hypothesis. The previous original ciphertext rune remains unchanged across marks. There are **31** large marks within pp0–55, with **20 internal mark occurrences at 19 distinct eligible reset offsets**, producing **74** source segment runs (55 page starts +19 additional distinct cuts).

## Exact theorem eliminating all private keys without fitting any

Let \`H[g,q,s,d]\` count the unchanged original ciphertext steps \`D=d\` that visit state s in real source segment g, after seeding that segment with any q∈0..28 and running the declared Q update on observed C or D. For any particular candidate native-GP plaintext rune e and its hidden globally shared maps \`A_s\`, **only one** input value \`d_s=A_s⁻¹(e)\` can produce e per state. Hence every output possible under every secret map and every page/mark seed obeys:

\`\`\`text
freq_P(e) <= B1 = Σ_s max_d Σ_g max_q H[g,q,s,d].
\`\`\`

This is an **overrelaxed upper bound**: it even lets a different secret seed be chosen for each state within the same segment. A real one-carry machine must share its seed across all states in that segment, so its possible common-rune count can only be smaller. All 12,901 source positions following their 55 original physical-page first glyphs are charged, including **86** equal-adjacent ciphertext transitions, and original punctuation offsets are independently read from the committed source annotations. Nothing is selected by English likelihood.

| State update operand | Reset scope | Independently seeded segments | Max possible count of any one plaintext rune |
| --- | --- | ---: | ---: |
| Observed current ciphertext C | Original pages | 55 | **1,026 / 12,901** |
| Observed current ciphertext C | Pages plus genuine large marks | 74 | **1,120 / 12,901** |
| Observed current difference D | Original pages | 55 | **1,056 / 12,901** |
| Observed current difference D | Pages plus genuine large marks | 74 | **1,146 / 12,901** |

The **most permissive upper bound is 1,146**. The least concentrated most-common-GP-rune count among **ten independently fixed, genuine prose controls** of the identical 12,901 interior-page output positions is **1,410**. Those ten GP29 books comprise five Gibran and five Shakespeare windows, at exactly the previously calibrated offsets [1000,11000,21000,31000,41000] and [20000,56000,92000,128000,164000]; each 12,956-rune source is split into the untouched original 55 physical page lengths before excluding each first glyph. Thus **none of the hidden 29!^29 globally shared substitution alphabets, nor any 29^55 page seeds or 29^74 mark seeds, can decode the authentic original LP2 source into any of those native-GP English controls under either update**. The hidden key search is mathematically unnecessary.

## Complete executable source/positive controls and scope

The [single-file original-source Node22 CJS SFT](../sims/lp2_p7_quartic_29state_allsecret_original_sft.cjs) computes all four exact all-secret bounds from \`resources/liber-primus/lp2-corpus.json\`, \`lp2-ink-annotations.json\` and the two pinned genuine-English references. It also creates **four full original-geometry, 12,956-rune authentic GP-English plaintext plants** using 29 randomly seeded genuine bijections and physically correct page and optional dot-reset clocks. For each plant, full plaintext decoding and 12,901 exact forward reencryptions pass, and the plant satisfies the same overrelaxed theorem. **A synthetic roundtrip is an implementation invariant, never identification of the historical cipher.**

The result is an original-cipher **necessary condition** against the ten predeclared ordinary native-GP English sources. It cannot exclude deliberately frequency-balanced text, compressed/non-GP payload, ciphertext-dependent transpositions, altered spaces, additional hidden carries, plaintext-driven state transitions, different source-selected Q operands, or independent 29! alphabets separately supplied for every page/segment. That last escape would require an unauthenticated large amount of extra key material. The genuine lag2/lag3 collision profile and mark discontinuities cannot rescue this exact model once it fails a more basic all-secret one-letter frequency obstruction.

**Research fork:** retire this fixed p7-quartic + public C/D state-update + globally shared 29-table family. Future work should first recover an *actual original author opcode/key*, a strictly different reversible register or ciphertext-selected next action. Do not retune 29 phase origins, hidden alphabets or stylistic plaintext scoring within this closed architecture.

Previous literature within the shared repository: [source red p7 polynomial](lp2-p7-p8-original-red-polynomial-fixedpoint.md), [prior direct two-cipher-history Q negative](lp2-p7-quartic-two-cipher-history-original-decision.md), [stationary page-secret delta theorem](lp2-delta-pagekey-allsecret-capacity.md), [ink-mark source](../resources/liber-primus/lp2-ink-annotations.json), [live issue #2339](https://github.com/FlareZ123/liber-primus/issues/2339).
