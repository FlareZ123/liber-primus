# P15 red 3299, its prime twin 3301, and the 4|5 heading

**Agent31, 22 November 2026. Source-motivated plaintext hypothesis and completed narrow key-source rejection. This is not a decrypted LP2 heading.**

## A human-visible lead not requiring a secret key

Physical p15's original scan (the repository's `resources/liber-primus/32.jpg`) visibly singles out **3299 in red** within the sixteen-cell square. The historical puzzle's own name is **3301**. Both integers are prime, and their difference is **2**: **3299 and 3301 are twin primes**. This fact is independent of any unknown LP2 ciphertext. Existing original-source research already proves the entire numeral grid is the clockwise spiral `abs(3301-prime(F_n+1))`, using the first sixteen distinct Fibonacci numbers. This numerical decipherment is **prior established work**, not a new result here.

The red text **above** the grid contains two complete GP29 words of lengths **4|5**. One immediately understandable candidate reading, selected by the distinctive red prime together with 3301, is **TWIN PRIME**, which contracts to exactly nine GP29 rune values. It is a hypothesis for a human-designed rubric, not an independently authenticated plaintext. **NEXT PRIME**, which also has shape 4|5, is a competing original-numeral interpretation. The authenticated 2016 signed message supplies two further exact-shape candidates, **LIES EMPTY** and **THEIR MEANING**. Word length alone does not choose between them.

The physically separate red heading **below** the table has **4|2|5** runes, which exactly fits the 2016 signed phrase **WILL BE FOUND**. That is a possible later hint, though the signed message was released after the manuscript. The same shape-match method gives multiple false readings for the genuinely solved p56 heading, so it cannot prove an original plaintext. These upper and lower phrases must not be concatenated as if the printed grid were an invisible word separator.

## Frozen title ciphertext and implied key

The unchanged p15 upper ciphertext under the canonical GP29 order is:

```
C = [0,1,20,19,24,28,26,22,24]
P(TWIN PRIME) = [16,7,10,9,13,4,10,19,18]
K = C-P mod29 = [13,23,10,10,11,24,16,3,6]
```

The candidate's original GP0 index sum is 106, against the actual upper-heading ciphertext index sum164, a difference of **58=2×29**; consequently this nine-symbol *conditional* additive key sums to **116=4×29**, zero modulo29. As an independently original-visible comparison, the first nine Fibonacci ordinates used by the source grid sum to **87=3×29**, also zero modulo29. These are arithmetic observations **noticed after proposing the candidate**; no original source specifies a zero-sum key or a Fibonacci permutation, and they should not be elevated to an authorship probability.

## Discriminating original-input result: direct source keys fail

Five actual page-derived sixteen-term series were tested: Fibonacci ordinates, one-based prime ranks, the selected primes, their Euler totients, and the printed absolute complements. For **each of four independently motivated 4|5 candidate phrases**, search all eight nine-element consecutive spans of each series, both readings, both arithmetic signs, and all 29 global additive offsets. This is **928 tests per source per phrase**, 18,560 original target comparisons. Every candidate plaintext is held fixed throughout; no original ciphertext symbol is used to choose a phrase, and English scoring is absent.

**Result: zero exact nine-symbol key matches.** For the key implied by TWIN PRIME, the best nine-position agreements by source in the sequence above are **3,3,2,2,3**. All other proposed phrases likewise have zero exact matches. Five planted source-derived exact-key controls recover their inserted nine-symbol target correctly under the same scan. The original p15 heading, its 9|11 red-span boundaries and the full 16-cell spiral are asserted before testing. [Runnable Windows Node22 CommonJS SFT](../sims/lp2_p15_twinprime_source_crib_sft.cjs) · [Successful original-input Actions run 44976691013](https://github.com/FlareZ123/liber-primus/actions/runs/44976691013).

## Fixed historical-pad test of both red headings (Agent48, 22 November 2026)

The p15 upper-heading BASE29 integer divided by3301 selects byte offset **8,952,964** in the authentic historical DATA/560.13 file (118,818,811 bytes; pinned SHA-256 unchanged). At that exact offset, a new source-fixed SFT tested the upper candidate **TWIN PRIME** (9 symbols) and the independent lower candidate **WILL BE FOUND** (11 symbols) against the same 11-byte window. It tested byte mod29 and floor(29×byte/256) under both signs and directions, plus raw GP-index XOR, raw prime-weight XOR, and raw additive-key equality. No offset or phase search was performed.

**Result:** TWIN PRIME has a best agreement of **0/9**; WILL BE FOUND has **1/11** (one isolated symbol under scaled29/minus). Neither is an exact key match. The script asserts the original p15 red-span lengths, the quotient/remainder, full file length and SHA-256. Successful original-file run: [44978211888](https://github.com/FlareZ123/liber-primus/actions/runs/44978211888). Reproducer: [lp2_p15_56013_twinprime_willbefound_crib_sft.cjs](../sims/lp2_p15_56013_twinprime_willbefound_crib_sft.cjs).

This rejects the direct 560.13 quotient-offset key-carrier hypothesis for these two source-motivated red-heading candidates under the tested transfers. It does **not** prove either phrase false under every possible cipher; neither is authenticated plaintext. Do not tune offsets, phases, signs, byte mappings, or concatenate the physically separate headings to rescue them.

## Exact crib-derived continuous key decision (Agent44, 24 November)

The historical LP1 crib method motivates an independent next receiver: infer key digits from the four previously frozen, shape-correct upper candidates, and test the remainder of the original chapter without a dictionary or scoring. The historical periods eight and thirteen and the 16-cell source square motivate an exhaustive bounded period-1–16 gate; none is established as the author's chosen period. This is distinct from the earlier direct numeric-pad transfers and the shape-invalid FIBONACCI title experiment.

For the standard authentic literal-plaintext-F hold, every non-F plaintext consumes one GP29 key digit and gives C=(P+K) mod29; F emits 0 and does not advance. All four proposed nine-rune upper titles are F-free, so the observed upper heading fixes the first nine consuming shifts. For any period q, represent each phase by its exact set of possible key values. For a nonzero ciphertext symbol c, consumption excludes key value c (which would decode to a forbidden nontransparent F); for ciphertext 0, branch between a literal hold and consumption excluding key value 0. Merge equal phase/domain states. Each state represents a Cartesian product of all compatible keys for that particular F history; no key digit, F interpretation, native dictionary, singleton constraint, or statistical threshold is omitted. The q16 case grants all 29^7 possible completions of the nine known digits. Also test the natural nine-consuming-rune plaintext and ciphertext autokey alternatives, whose queues after the crib are fixed.

All 32 period-1–8/crib combinations contradict the crib itself. The following are zero-based first impossible rune offsets in the continuous original p15–22 1,903-rune tape (positions 0–8 are the crib). All 32 additional periodic combinations and all eight autokey combinations fail; the largest symbolic state count is 472, with no cap. No original page after p17 is needed.

| Upper crib | q9 | q10 | q11 | q12 | q13 | q14 | q15 | q16 | Plain autokey q9 | Cipher autokey q9 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| TWIN PRIME | 22 | 72 | 17 | 160 | 160 | 145 | 238 | 230 | 12 | 10 |
| NEXT PRIME | 9 | 132 | 17 | 284 | 371 | 127 | 587 | 591 | 170 | 10 |
| LIES EMPTY | 181 | 253 | 16 | 12 | 43 | 249 | 115 | 16 | 9 | 10 |
| THEIR MEANING | 13 | 42 | 63 | 156 | 189 | 63 | 205 | 608 | 57 | 10 |

An independently executed direct enumeration of all 707,281 completions per q13 crib gives identical maximum failure offsets 160,371,43,189. Counts surviving the 159-rune p15 prefix are 202654,142859,0,221012; none survives p15–16 (426 runes). The symbolic solver avoids that enumeration and generalizes to q16. Four synthetic source-native KOAN plants (120 continuation runes each, independent q8/9/13/16 deterministic keys) retain the planted true key and terminal phase in the exact state union; two autokey plants using clear p57 retain legal full paths. This calibrates reachability, not unique key or language recovery.

**Separate exact lower-crib obstruction:** the 4|2|5 hypothesis WILL BE FOUND has a native F at lower-heading position6, global p15 rune15. Original p15 rune15 is GP0=17 (B), not F. Therefore this exact lower-crib alignment is impossible for *any* cipher honoring the authentic literal-F rule, regardless of period, key, phase, or other consuming-state mechanism. This does not exclude nontransparent-F systems.

Reproduce: [single-file CommonJS SFT](../sims/lp2_p15_twinprime_symbolic_fhold_crib_sft.cjs). The complete original and native-control experiment was executed in connected JS against the canonical repository corpus; no hosted CI run claimed.

**Research fork:** Retire the four title hypotheses specifically under continuous period≤16 additive F-hold and the fixed nine-consuming-symbol F-hold autokey receivers. Retire WILL BE FOUND under the literal-F rule at this alignment. The original numerical spiral remains solved; the proposed title readings themselves remain unauthenticated under other mechanisms. Do not tune a longer period or independent body key merely to preserve these cribs. A genuinely source-selected alternative operation remains necessary. No unknown LP2 plaintext or key was recovered.

This working note does not change the authoritative conclusion that **no unknown LP2 rune passage has been reproducibly decrypted**.
