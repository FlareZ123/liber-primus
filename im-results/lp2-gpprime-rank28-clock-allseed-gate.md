# Running ciphertext-prime clock in the GP28 predecessor-exclusion register

**Decision (Agent21, 13 November 2026):** A reversible, source-constrained 28-state clock built from the original GP prime weights fails to recover native GP-English from all 12,956 unsolved LP2 runes. The result is **invariant under all 28 independent initial clock states on every physical page and under arbitrary fixed bijections of the 28 nonmarker output symbols per page**. Both clock signs were checked. No plaintext, original key, intended cipher or destination was recovered.

## Original-clue route and its missing premise

The 29-symbol Gematria Primus table includes 29 prime weights. The original red number triangle contains **15**, a primitive root modulo 29; hence every nonzero GP29 difference has a unique exponent in a cyclic **28-symbol** register. The independently authenticated 2016 Cicada message describes the manuscript's words as a map and their numbers as a direction. The unknown pages have only **86** same-rune neighbor events among **12,901 within-page comparisons**, making a predecessor-exclusion code worth testing. These are source facts. **No authenticated source specifies a running accumulator of ciphertext rune primes**, nor reserves a repeated rune for plaintext EA. Those are the precise conjectural components tested.

For each physical page, transport its first ciphertext GP index as a page IV. For each subsequent rune:

    delta[i] = (C[i] - C[i-1]) mod 29
    q[i] = (seed + sum_{t=0}^{i-1} GPprime[C[t]]) mod 28

For nonzero delta, set e[i]=log_base15(delta[i]) mod28, and decode the content rank r[i]=(e[i]-sign*q[i]) mod28, where sign is +1 or −1. For delta=0, decode reserved EA (GP index28). The inverse emits the prior ciphertext rune for EA, or its predecessor plus 15^((r+sign*q) mod28) modulo29 for a content rune. Update the state after emitting each cipher rune.

The prime weights, root15, source runes, and 29-to-28 predecessor register are fixed by public artifacts. The principal unsupported premise is the running-prime clock.

## Original result, invariant to all secret initial states

The source has **55 rune-bearing unsolved physical pages, 12,956 runes**, and **86 within-page repeated pairs**. Remove each page's first transmitted rune and its zero-difference events, leaving **12,815 nonmarker rank observations**. Score them by the pooled within-page equality collision probability:

    sum_pages sum_rank count(page,rank)*(count(page,rank)-1)
    ------------------------------------------------------
         sum_pages length(page)*(length(page)-1)

Changing the unknown initial state adds the same constant to every nonmarker recovered rank on that page. The collision score is therefore unchanged by any page seed or page-static rank permutation. Book, chapter and page resets alter only the constant within a page. The standalone reproducer explicitly checks **every seed 0–27 on every page**, for both signs.

| Original decoder | Within-page equal-rank ordered pairs | Eligible ordered pairs | Coincidence probability |
| --- | ---: | ---: | ---: |
| Subtract prime clock (sign +1) | **111,854** | 3,130,300 | **0.03573267738** |
| Add prime clock (sign −1) | **111,130** | 3,130,300 | **0.03550138964** |
| Uniform 28-symbol reference | | | **0.03571428571** |

Both decoded original streams are close to the uniform-content baseline. The 86 EA symbols follow from the hypothesis itself and cannot authenticate its 12,815 recovered ranks. Original source pages re-encrypt exactly, which is a necessary correctness test for a reversible model but does not establish the historical cipher.

## Original-shape native controls and a full positive inversion

The committed Shakespeare control encodes as **218,800 GP runes**, under the conventional QU→CW, K/Q→C, V→U, Z→S normalization and greedy runic digraphs. Since the candidate model reserves EA for a repeat, native-source EA is folded to E solely for the 28-way nonmarker control. Across **1,036 overlapping source windows at GP stride199**, insert 12,815 contiguous native rune ranks at the source's exact 55 page lengths and same 86 reserved doublet positions. The within-page collision probabilities are:

- **Minimum 0.06007283647**, source offset 172931.
- **Median 0.06245791138**.
- **Maximum 0.06463469955**.

Every matched genuine GP-native control exceeds either original result. Overlapping windows are finite comparison coverage, not independent hypothesis-test trials.

A direct planted example begins from GP-control offset45000, encodes English GP ranks under the exact declared predecessor-exclusion algorithm with sign +1 and independent unknown per-page seeds seed=(17×physicalPage+5) mod28, while preserving the manuscript's 86 repeated-rune positions. The recovered native content has **197,900/3,130,300 = 0.06322077756** collisions. Decoding under the correct hidden seeds recovers every declared symbol, and decoding under seed zero has exactly the same collision count. All **12,956** synthetic ciphertext runes roundtrip correctly. This positive confirms the detector can distinguish genuine source-native prose even with unknown initial states and artificially reserved EA positions.

## Scope and executable record

The tested direct operation cannot recover GP-native prose from the original source under any initial page clock states or fixed per-page 28-rank alphabet relabeling. It does not exclude independent keystreams, nonlinear per-symbol substitutions, nonprime clocks, changed word order, compressed data, missing historical inputs or an entirely different cipher. A freely changing key alters the equality invariant and must be specified by an independent original clue.

**Standalone CommonJS reproducer:** [sims/lp2_gpprime_rank28_clock_allseed_sft.cjs](../sims/lp2_gpprime_rank28_clock_allseed_sft.cjs). Computations were performed on the canonical connected GitHub corpus and matching control file during this invocation. The committed source pins all original counts, both signs, all source page seeds, the complete native positive and the 1,036-window comparison without adding a CI workflow.

**Original source references:** [canonical runic corpus](../resources/liber-primus/lp2-corpus.json); [red triangle](red-span-triangle.md); [authenticated 2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc).
