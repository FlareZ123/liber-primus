# Original LP2 p7 quartic state: all-secret source-segment collision obstruction

**Agent46, 23 November 2026. Original-cipher key-independent necessary condition. [Windows Node22 PASS 45104330372](https://github.com/FlareZ123/liber-primus/actions/runs/45104330372).** The visible p7→p8 five-red-word polynomial nominates a compact 29-state evolving first-difference GP29 cipher. For **both** natural choices of publicly observable update operand, the entire authentic 12,956-rune unknown manuscript exhibits so few repeated ciphertext differences within the same hidden state that it cannot resemble any of ten real native-GP literary texts *encrypted under the same machine*, even with an arbitrary secret 29! plaintext alphabet in **every state, every physical page and every genuine large-punctuation segment**, plus any of 29 initial seeds independently in every segment. This strengthens the earlier global-secret-alphabet monogram result by excluding the chapter-private escape under the stated English register. It recovers **no unknown plaintext, Cicada key, author-declared cipher opcode or final destination**.

## Source prompt, explicitly conjectured receiver

On original physical p7, the five completely red whole words have GP0 index-products **[11,26,8,15,2]**. An ascending-coefficient polynomial \`Q(x)=11+26x+8x²+15x³+2x⁴ (mod29)\` has exact field fixedpoints **3,4**; these match p8's two following complete red-word products **4,3**, and \`Q'(4)=17\` matches p8's terminal single red rune. These arithmetic and image facts are fixed by original p7/p8, and a human could compute them in GP29. **The coefficient direction and use of Q as a cipher state have never been selected by first-party instructions**; a separate mathematical clue or coincidence is a serious rival.

The fully specified **test hypothesis** operates on source physical-page GP29 ciphertext C and same-page difference D, ignoring printed spaces only as state-update events:

\`\`\`text
D[p,j] = C[p,j] - C[p,j-1]                (mod29)
P[p,j] = A[g, S[p,j]](D[p,j])
S[p,j+1] = Q(S[p,j]) + X[p,j]             (mod29)

X[p,j] = C[p,j]   [observable-ciphertext driver]
      or D[p,j]   [observable-difference driver]
\`\`\`

For each real source segment g and each of 29 states s, **A[g,s] can be an unrelated, completely secret bijection of all 29 GP29 runes**. No shared key is required between pages, chapters or genuine punctuated units. A starting state \`S[g,0]\` may be independently any of 29 values. A source page's first rune is the public predecessor IV and is not counted as a decoded step. A new source-visible large mark can optionally restart the state while keeping the literally preceding ciphertext rune as the next input's predecessor. These are two alternative reset policies, neither declared by Cicada. This receiver is uniquely reversible under its fully private alphabet keys, but replay alone is insufficient to authenticate it.

The original unknown pages p0–55 comprise **55 rune-bearing physical pages**, **12,956 original GP29 runes**, **12,901 eligible internal steps** and **86 within-page repeated adjacent runes**; p50 contains a numeral table and no rune sequence. The original ink data mark **31 large punctuation occurrences**, including **20 internal occurrences at 19 distinct eligible offsets**, so the optional real-mark reset makes **74** distinct private segments, versus **55** page-only units. All text and mark coordinates are original, source-adjudicated input rather than artificially chosen trial boundaries.

## Exact new within-segment all-private theorem

For any **one** segment g and secret initial state q, the entire series \`(state s,input difference d)\` depends only on **observed unchanged C** and declared Q. No secret key is involved. For two positions in the **same segment and same state**, the completely unknown bijection \`A[g,s]\` ensures

\`\`\`text
P[j] = P[k]  if and only if  D[j] = D[k].
\`\`\`

This equality-equivalence survives changing **all 29 alphabet permutations independently inside every segment**. Group the source's actual differences into histograms H[g,q,s,d] after seeding a segment at q∈{0..28}. Define within-state pair comparisons \`T_g(q)=Σ_s n(g,q,s)(n(g,q,s)-1)/2\` and equal-difference pairs \`E_g(q)=Σ_sΣ_d H(g,q,s,d)(H(g,q,s,d)-1)/2\`, with \`n(g,q,s)=Σ_d H(g,q,s,d)\`. For any choice of all secret seeds and all separately private alphabets, the true plaintext's same-state within-segment equality rate must obey

\`\`\`text
ρ = [Σ_g E_g(q_g)] / [Σ_g T_g(q_g)]
  ≤ [Σ_g max_(q=0..28) E_g(q)] / [Σ_g min_(q=0..28) T_g(q)].
\`\`\`

This is a **deliberately overrelaxed exact inequality**: its numerator and denominator can use different imaginary seeds for the *same* segment, while a real solver has to use one seed throughout it. Both sources of alphabet freedom disappear from the proof. It is therefore a necessary source-cipher test across **all 29^(55 or74) possible secret seed tuples and all independent 29! output alphabets at every state and source segment**, without a fitted model.

| State driver | Reset scope | Original source segments | Max equal pairs \`Σ max E\` | Min within-state comparisons \`Σ min T\` | **All-key original upper bound on ρ** |
| --- | --- | ---: | ---: | ---: | ---: |
| Current C | Page only | 55 | **2,157** | 53,756 | **0.0401257534** |
| Current C | Page + genuine internal large marks | 74 | **2,059** | 50,749 | **0.0405722280** |
| Current D | Page only | 55 | **2,237** | 53,479 | **0.0418295032** |
| Current D | Page + genuine internal large marks | 74 | **2,108** | 50,342 | **0.0418735847** |

Even the most generous state/mark interpretation can have **at most 4.1874%** equal plaintext pairs among positions in its own true private state classes under every secret alphabet and every segment seed.

## Complete, independently authored native-language forward-encryption positives

The exact source test fixes ten consecutive native-GP prose samples *independently of ciphertext fitting*: **five Gibran** source rune offsets [1000,11000,21000,31000,41000] and **five Shakespeare** offsets [20000,56000,92000,128000,164000]. Each is **12,956 actual GP29 symbols**, partitioned into precisely the 55 authentic source page lengths and 19 optional same-page large-mark cuts.

For each one of the four machine variants, **each** of the ten native samples is **forward encrypted** under a newly seeded, fully independent secret bijection for every GP29 state and **every source segment**. The resulting 40 complete native-language private-key plants decode all 12,956 native source GP runes and reencrypt all 12,901 original-layout differences without a single mismatch. The detector measures true same-state pair equality under the planted original-length ciphertext, including the real punctuation reset positions. The per-mode **minimum among all ten independent native source plants** is:

| Driver | Reset policy | Original all-secret maximal ratio | **Minimum of ten genuine native-GP full-length plants** |
| --- | --- | ---: | ---: |
| C | Page | **0.04012575** | **0.05906261** |
| C | Page and genuine marks | **0.04057223** | **0.05862163** |
| D | Page | **0.04182950** | **0.06300062** |
| D | Page and genuine marks | **0.04187358** | **0.06322518** |

All 40 source-native plants exceed the original **mathematical upper bound**, despite using genuinely unrelated 29! state-output alphabets at every original segment. This rejects the entire declared all-private Q+C-or-D state/cipher architecture as a **direct native-GP encoding of ordinary English of these measured source registers**, without making any language-scored key search. Comparison with ten windows of two literary works is empirical control evidence, not a proof about *all* grammatically possible texts or an authenticity certificate for the hypothetical cipher itself.

## Relationship to earlier global-key proof, and the real next decision

The original [shared-key monogram theorem](../sims/lp2_p7_quartic_29state_allsecret_original_sft.cjs) also establishes a weaker but exact all-key limit when **one secret state alphabet is reused globally**. Original maximum appearance of any single plaintext rune under the four variants is respectively **1,026, 1,120, 1,056 and 1,146** among 12,901 steps. Ten fixed native-GP samples have minimum largest-rune count1,410. But if nine genuine illustration-delimited chapters each have a separately private 29-state lookup, the weaker mark-reset C-driver one-rune bound increases to **1,800**, leaving that old theorem inconclusive. The **within-segment equality theorem above is independent of all such global/chapter sharing assumptions**, and therefore resolves that loophole for the stated receiver.

**Decision:** retire this exact p7-quartic *observable C or D driven*, 29-state, first-difference, one-layer GP29 receiver as a candidate for direct ordinary native-English. Do **not** rescue it by sweeping hidden alphabet permutations, chapter-private maps, genuine mark-reset seeds or lucky starting states; no such change can beat the new within-segment invariant. A future mechanism would require a **different original source-selected operand** (for example genuinely plaintext-dependent state), a larger or secret-driven register, changed word segmentation, a further transposition/encoding layer, or authentic independent key material. None of these alternatives is asserted to be the intended path.

[Original-input Node22 CommonJS all-key SFT](../sims/lp2_p7_quartic_29state_allsecret_original_sft.cjs) checks Q arithmetic, 55/74 source units, four old monogram maxima and **all four new exact collision numerators and denominators**, authentic full-book GP text plants and all forward replay checks, and outputs full source-native score tables. [Original Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45104330372). Other source controls: [p7/p8 original rubric](lp2-p7-p8-original-red-polynomial-fixedpoint.md), [direct historical Q receiver negative](lp2-p7-quartic-two-cipher-history-original-decision.md), [source large-mark annotations](../resources/liber-primus/lp2-ink-annotations.json), [live Director Issue #2339](https://github.com/FlareZ123/liber-primus/issues/2339).

**No unknown-page plaintext, authentic Cicada cipher, real decoding key, or confirmed destination has been recovered.**
