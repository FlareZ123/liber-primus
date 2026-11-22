# P50 as a recurrent cipher clock: exact 256-state source-map collapse and original-word witness

**Agent25, 22 November 2026. Classification: original-source, all-secret *necessary-state* exclusion for one fixed 256-state architecture; no unknown LP2 plaintext, genuine author cipher, key, or continuation recovered.** Source operation is *hypothetical*, as is the original ordinary-GP-English register.

## Distinct causal hypothesis and essential prior art

Physical LP2 p49–51 prints exactly 256 two-character cells as a 32×8 panel. The signed 2016 Cicada message says the words' numbers give direction. A human could therefore treat a table cell as an address whose printed value specifies the next cell, a simple **256-state memory and successor table**, and advance the state at an original word boundary or after every rune. This would be a concrete reversible *cipher clock* if every address selected an undisclosed bijective GP29 output map. The previous [first-cell direct-byte pointer report](lp2-p50-direct-byte-pointer-firstcell-cycle-gate.md) already explored source navigation and rejected direct repeating additive ring keys. The [original table functional-graph report](lp2-p50-functional-graph-2016-wordmap.md) already established the **two base60 cycles** from actual source images. **Those graph observations are prior work.** Separately, [Agent24's word-collision theorem](lp2-allsecret-minimum-finitestate-wordcollision-original-gate.md) already established that every complete original unknown cipher word of length at least four is unique, and restricted deterministic transducers with few start states. The new test joins these two previously independent source results into **an exact obstruction on the table itself as the complete evolving cipher state**, allowing *arbitrary secret per-state symbol maps* and both source-radix interpretations.

The strongest rival is that the table supplies an address, a nonrecurrent key operand, an external link, or one of multiple secret state variables. No first-party signed instruction defines `nextState = table[currentState]`, commands exactly one update per word or rune, or restricts the cipher state to the table pointer. Accordingly this report tests a compact *conditional architecture*, not a purported author-selected cipher.

## Exact source successor map and all-seed cycle certificate

Use the unchanged [original cell transcription](../resources/liber-primus/base60-grid.json), physical row-major order p49 ten rows, p50 thirteen, p51 nine; no row or page reset. Under the conventional base60 alphabet or the source-possible lower-case-`f`-omitted base59 alphabet, each cell `i` is an integer in `[0,255]`. Let `T[i]` be the byte decoded from that printed token. Form the directed graph `i -> T[i]`, exhaustively for each of its **256** possible input states.

| Conditional table decoding | Eventual attractor(s) | Start seeds by attractor | Maximum strictly pre-cycle transitions | Max visited states before repeat |
| --- | --- | ---: | ---: | ---: |
| Base60, first-published conventional byte encoding | An **11-cycle** `0,203,68,199,47,76,114,197,115,247,192`; a **2-cycle** `249,158` | **252** and **4** | **24** | **35** |
| Base59, deleting the never-printed lowercase `f` | A single **fixed point 189** | **256** | **38** | **39** |

The base60 graph is already source-published as noted above. The **base59 all-256 basin collapse to 189** is the added alternate-codec result. In **either** hypothesis, every starting state, without fitting an initial seed or key, satisfies the exact invariant

```text
T^(n+22)(seed) = T^n(seed), for all seed=0,...,255, n>=40.
```

For base59, the stronger `T^(n+1)(seed)=T^n(seed)` holds after step40. The period22 is `lcm(11,2)`; it is an *upper bound* on recurrent state variety, not evidence that 22 is an authored key length.

## All-secret original-language obstruction

Assume an intact native-GP plaintext word of length L produces exactly L GP29 ciphertext runes, deterministically from its spelling and **only one hidden state: the current table cell address**. At every word or rune, the state advances by the fixed source successor law `s_next=T[s]`, independent of the plaintext value or output ciphertext. The secret GP29 substitution, nonlinear mixing, within-word feedback or complete per-state secret word function may be **arbitrary**. The initial address may be **any of all 256 seeds**. To grant real printed reset candidates, test either one global stream or independent fresh seeds at each of eight authentic illustrated source sections. Physical-page resets are diagnosed separately.

After at most40 steps from a reset, there are only 22 possible recurrent clock phases under base60 (one under base59). Therefore:

> If the *same native-GP plaintext word* of length≥4 appears twice at the *same surviving table state*, **the ciphertext word must also be the same**, regardless of every secret key or the details of the deterministic emitter.

But the original [12,956-rune, 2,896-complete-word GP29 corpus](../resources/liber-primus/lp2-corpus.json), respecting all 32 cross-page word joins, contains **zero repeated ciphertext spellings** of length≥4. This fact is not surprising under random ciphertext; its use here is as an exact **witness condition against recurring hidden states** with ordinary repeated prose words.

To obtain *independent plaintext candidate words* without fitting against source ciphertext, freeze two genuinely sourced English donor corpora, [Shakespeare](../resources/control/shakespeare_first300k.txt) and [Gibran, *The Prophet*](../resources/control/gibran_prophet_58585.txt). Convert their word tokens to published GP29 spelling (including TH, NG, F, GP transliteration, period-character rules), then draw **64 deterministic samples per donor** in which each of the **2,896 original word positions** receives an independently sampled genuine donor word of exactly the **original GP29 rune length**. Preserve all authentic word and chapter boundaries. This is a *frequency-matched word-sampled native-English null*, not 128 contiguous prose manuscripts; the inference applies to the sampled English registers, not all conceivable English.

Each original ciphertext word with length≥4 has a unique value, so one donor repeated-word/identical-state collision is sufficient to disqualify **every possible hidden key** under that specific fixed state update.

| Donor and 64 length-matched whole-book samples | Base60: word clock, one global seed | Base60: word clock, eight independent chapter seeds | Base60: rune clock, one global seed | Base60: rune clock, eight independent chapter seeds |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, minimum forced distinct-word conflicts | **84** | **7** | **79** | **9** |
| Gibran, minimum forced distinct-word conflicts | **121** | **13** | **115** | **20** |
| Samples with at least one contradiction, each donor | **64/64** | **64/64** | **64/64** | **64/64** |

Under the radix59 fixed-point, all corresponding recurrent word-state groups collapse after40 steps to the same address, yielding even stronger contradictions: Shakespeare minimum **673 global and 189 chapter-reset** under per-word updates, **681/218** under per-rune updates; Gibran minimum **755 global and 236 chapter-reset** per-word, **763/267** per-rune. For each of these eight radix59 donor/model cells, all **64/64** samples also contradict the original.

**Physical-page reset boundary matters:** when granting a brand-new seed for each of 55 rune-bearing *physical pages*, and resetting the **per-word** clock at each page, only **5/64** Shakespeare samples and **2/64** Gibran samples have a contradiction, with zero as the minimum. This scope is *not excluded* by the collision test, although cross-page words and page breaks make it a source-weak hypothesis. More rapidly changing keyed state or a genuinely plaintext-dependent state update can also escape this bound.

## Exact reproducibility, positive and negative controls

The [standalone, read-only Windows Node22 CJS SFT](../sims/lp2_p50_successor_wordclock_allsecret_original_sft.cjs) reads exact original tokens, checks the published base60 256-byte SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, reconstructs all 2,896 complete original words/12,956 runes and the 8 published section starts. It follows **all 256** starting addresses and all necessary 22-phase equalities for both original candidate numeral radices. Donor samples use fixed seeds `0x330112` and `0x330161`; the scripts log the first exact same-plaintext/state/different-original-cipher word witness for each donor.

Crucially, it constructs **genuine fully deterministic forward and inverse encryption of all 12,956 donor GP runes under the actual printed base60 table**, once with the state advancing after each word, once after each rune, and proves that these generated positives produce **zero** all-secret contradiction witnesses. Corrupting a single planted ciphertext rune at an independently determined repeated-plaintext/same-state position creates a contradiction. All source, synthetic positive and negative assertions pass in [Windows Actions run 45021432768](https://github.com/FlareZ123/liber-primus/actions/runs/45021432768) (Node22; execution reached PASS). Earlier frozen per-word base60 and base59 programs also passed [45021067399](https://github.com/FlareZ123/liber-primus/actions/runs/45021067399) and [45021204712](https://github.com/FlareZ123/liber-primus/actions/runs/45021204712).

## Research decision: navigation, not an autonomous recurring word cipher

The original bytes permit an exact source-led finite-state fact: **as a sole global or chapter-reset successor pointer**, p50 has at most 22 recurrent states after 40 steps (radix59 ultimately only one), irrespective of unknown initial addresses or arbitrary secret output maps. For all 128 length-matched, donor-sourced GP-English registries, original ciphertext word uniqueness produces repeated-plaintext/state incompatibilities under **both** candidate radices, **both** natural update clocks, and both global and chapter-reinitialized models.

This is a *necessary-condition language-register exclusion*, not a proof of how Cicada enciphered LP2. No original ciphertext has decrypted to new language; a missing key, a source-authored instruction, an independently authenticated external payload, plaintext-dependent state transitions, altered word boundaries, per-page private keys or additional hidden state remain serious alternatives. The graph's previously observed signed-2016 navigation coincidences may still direct a human solver to a separate payload. **Do not propose the 256-cell pointer alone as a sufficient evolving cipher key stream** or fit its unknown per-state maps to rescue this architecture. The next productive experiment needs an author-supplied recipient or additional state-update rule with a withheld original-cipher prediction.
