# LP2: shared physical-page-reset additive GP29 pad, held-out original gate

**18 November 2026, Agent38. Director Issue #1519. Classification: completed bounded original-cipher negative with an exact planted positive and untouched original holdout.** No unknown LP2 plaintext or authentic key is recovered.

## Frozen family and source motivation

Physical page boundaries are first-party and visually obvious. Solved p56 also has a page-local cipher start, so a human-solvable possibility is one additive pad reused from local rune offset zero on every rune-bearing unsolved physical page:

C[p,j] = P[p,j] + k[j] mod 29.

There is one unrestricted shared key symbol k[j] for each local page offset up to the maximum original page length, 277 runes. The test adds no phase scan, page-specific IV, alternating sign, bypass, transposition, page-specific key, nonlinear state, or 256-period wrap.

This is distinct from [the earlier cyclic-256 page-offset test](lp2-cyclic256-pageoffset-sync-original-gate.md), which forced a 256-symbol cyclic key and allowed an arbitrary starting phase per page. Issue #1519 instead fixes the human-visible reset point at every physical page start and allows a nonperiodic shared key through all 277 possible page offsets.

## Exact attack

The canonical 55 rune-bearing p0-p55 physical pages contain 12,956 ciphertext runes. The attack uses only a fixed GP29 first-order language objective trained from the 3,568 source-encoded solved LP1 runes in resources/liber-primus/lp1-plaintext-reference.txt. Unigram pseudocount 0.5 and bigram pseudocount 0.25 are frozen before original fitting.

Because every page shares the same key symbol at the same local offset, the complete maximum-likelihood key under this fixed first-order model is available by exact Viterbi dynamic programming with only 29 key states per page offset. This avoids heuristic key search.

The original pages are predeclared into three disjoint groups:

- **train A:** even-numbered physical pages p0-p38, 20 pages;
- **train B:** odd-numbered physical pages p1-p39, 20 pages;
- **untouched holdout:** all rune-bearing p40-p55 pages, 15 pages and 3,316 runes.

Keys are fit independently on A, B, and A+B. The holdout is never used in key selection. The two independently fitted training keys provide the issue's stability test.

## Positive control

A deterministic seed generates an unrestricted random 277-symbol GP29 pad and source-shaped plaintext pages from the frozen LP1 bigram model, preserving every original page length and the same A/B/holdout split.

The exact attack recovers:

- **200/200** first key symbols from train A;
- **200/200** from train B;
- **200/200** from A+B;
- **200/200** agreement between the two disjoint fitted training keys.

The untouched planted holdout has model score **-2.533121354 nats/rune**, perplexity **12.59275**. Decoding it with the recovered A+B key gives **-2.533457679 nats/rune**, perplexity **12.59699**, effectively identical to the true planted plaintext.

For a real solved-text scale check, the genuine 95-rune p57 plaintext, which is not used to train the model, scores **-2.582917098 nats/rune**, perplexity **13.23569**.

Thus the attack has high power on exactly the frozen page-reset family.

## Original LP2 result

The independently fitted original keys fail the stability gate:

- agreement on first 150 symbols: **2/150**;
- agreement on first 200 symbols: **3/200**.

Chance expectation for two unrelated 29-way keys is about 150/29 = 5.17 and 200/29 = 6.90 matches respectively, so the observed agreement is compatible with unrelated fitted keys.

On the untouched 3,316-rune p40-p55 holdout:

| Key fitted from | held-out nats/rune | perplexity |
| --- | ---: | ---: |
| train A | **-4.327925101** | **75.7869** |
| train B | **-4.294674062** | **73.3083** |
| A+B | **-4.344357631** | **77.0425** |
| planted true/recovered key | **-2.5331 / -2.5335** | **12.5928 / 12.5970** |
| genuine solved p57 | **-2.5829** | **13.2357** |

One hundred fixed-seed random wrong keys on the original holdout span **-4.36945 to -4.27996 nats/rune**, median **-4.32458**. The three original fitted keys sit inside this wrong-key band. They do not transfer to withheld pages better than unrelated keys.

The first 150 p40 runes under the A+B fitted key are visibly nonlinguistic GP transliteration, beginning:

F-H-N-D-A-IA-F-G-F-N-Y-N-X-P-T-F-H-IA-D-G-T-C-N-D-M-T-U-C-Y-N-TH-O-D-S-W-EO-F-T-D-J-P-IA-L-E-I-I-A-J-EA-E-J-S-M-U-D-EA-J-T-R-A-NG-Y-N-B-EO-R-X-OE-M-AE-OE-H-X-W-AE-IA-U-C-EA-R-J-H-Y-TH-T-J-C-I-T-TH-I-U-D-F-D-N-W-D-L-M-EA...

No contiguous coherent unknown plaintext appears, let alone the issue's 150-rune success threshold.

## Decision

The exact #1519 family is rejected as a direct receiver for ordinary native-GP plaintext: **one shared additive GP29 pad restarted at physical page offset zero does not produce a stable key across disjoint training pages and does not decode untouched p40-p55 material above wrong-key behavior.**

This does not reject page boundaries as meaningful in another cipher. It does not cover page-specific IVs, different keys per page, feedback/stateful transforms, transpositions, nonlinear alphabets, inserted or omitted symbols, or an intermediate that is not ordinary native GP29 prose. Those are separate mechanisms and should require independent source evidence.

## Reproduction

The read-only Node22 CommonJS SFT is [sims/lp2_shared_page_reset_additive_pad_sft.cjs](../sims/lp2_shared_page_reset_additive_pad_sft.cjs). It reads only canonical repository sources, constructs the fixed LP1 model, executes the exact Viterbi fits, generates the planted positive, scores the untouched original holdout, and asserts the decision gates.

Windows Node22 execution passed in [GitHub Actions run 44389994894](https://github.com/FlareZ123/liber-primus/actions/runs/44389994894) on the shared manual read-only CommonJS workflow. The run checked out a main-branch commit containing the SFT and logged the exact figures above.
