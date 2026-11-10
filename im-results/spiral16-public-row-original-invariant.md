# A source-square 16-phase public-state cipher cannot reproduce native-GP collision structure

**Agent 25, 10 November 2026. Evidence class:** executed original-input, exact label-invariant necessary-condition test with 600 byte-for-byte reversible GP-English positive controls. This supplies a substantial *conditional exclusion* of a previously open, source-suggested stateless cipher family. It recovers **no unknown plaintext, authentic key or destination**.

## Original-source hypothesis

The original LP2 physical page 15 (scan 32.jpg) displays a 4×4 Fibonacci-indexed prime square, a central red 3299 and an infinity symbol. A 16-phase repeating mechanism is a concrete, image-selected possibility. The published unsolved manuscript additionally has only 86 identical adjacent ciphertext runes in 12,901 within-page transitions, compatible in absolute frequency with a GP-EA plaintext escape marker.

Test an extremely permissive but *fully invertible* cipher model:

    C[page,0] = P[page,0]                   (published seed)
    C[page,i] = S[phase16(i), C[page,i-1]][P[page,i]]

Every one of the 16 × 29 substitution rows S is **an independent, arbitrary 29-way bijection**. The row maps plaintext GP EA (index28) onto the previous ciphertext rune, and permutes the remaining 28 source runes across the 28 outputs other than the previous ciphertext rune. The 16-phase counter either resets on each physical rune-bearing page or runs continuously across all 12,956 unsolved runes. This allows 464 independent *secret* output permutations, much more flexible than any additive 16-prime key sequence.

The source corpus is [the original 55-page normalized LP2 rune sequence](../resources/liber-primus/lp2-corpus.json), omitting runeless physical page50 and solved p56–57. The existing source text parser supplies **2,896 exact ciphertext word lengths**. The broader fixed predecessor-row model and its own limits are documented [here](previous-cipher-sbox-invariant.md). The new **16-phase × predecessor** state is a different family: its 464 secret rows change within individual physical pages.

## A key-independent equality invariant

Group each original transition by the completely published state (current position modulo16, immediately previous published ciphertext rune). In one fixed state, a bijection necessarily preserves the *equality pattern* of whichever unobserved plaintext runes generated that state's observations. For state s, let n[s,r] count ciphertext outputs with visible rune r, and N[s] the row total. Then

    R = sum_s sum_r n[s,r] × (n[s,r] − 1)
        / sum_s N[s] × (N[s] − 1).

R is the rate of matching output-rune pairs among all pairs occupying the same public state. It is **identical** to the within-state plaintext collision rate, independent of every one of the hidden 29! substitutions and independent of any choice of source keys. The exact equality property is mathematical; the separate assumption that plaintext resembles author-native GP English is empirical.

### Original LP2, two reset policies

| Counter | Matching pairs | Eligible pairs | Exact observed R |
| --- | ---: | ---: | ---: |
| Phase modulo16 restarted at physical pages | **6,365** | 179,922 | **0.0353764409** |
| Phase modulo16 continuous across the manuscript | **6,432** | 179,506 | **0.0358316714** |

All **464** public states occur under both policies; all **12,901** within-page transitions are scored. This is close to the flat 1/28 residual alphabet collision scale rather than to native text.

A **150-draw conditional null** retains all 55 original page lengths and the **86 exact repeat-event positions**, then samples all other successor outputs uniformly from the other 28 choices. The page-clock mean null R is **0.03529696** and the global-clock mean **0.03523814**. Original is within the null range under both clocks. The global observed value exceeds 139/150 nulls, an exploratory, postselection-sensitive deviation; it does not produce readable plaintext or rescue the native GP prediction.

### Genuine reversible author-native controls

Two independently sourced GP plaintext registers supply the controls:

* **Solved Cicada reference:** 796 author-native GP words, with editorial note lines and long hexadecimal targets removed, normalized to 3,224 GP runes.
* **Shakespeare reference:** 55,407 source words, 217,644 GP runes.

For each of **150 independent draws per source and clock**, resample *whole* reference GP words within the **exact original printed word-length buckets**, preserving **all 2,896 original word lengths** and **all 55 original physical page lengths**. Generate all 464 completely independent secret substitution rows by Fisher–Yates, with **GP EA exactly mapped to ciphertext repetition**. Encrypt every rune, decrypt every rune with the recovered secret tables and **assert full equality**; then re-encrypt and **assert the exact ciphertext**. This certifies 600 complete manuscript-sized reversible cases, **7,773,600** source-rune encrypt/decrypt roundtrips, with no original-input plaintext baked into the plants.

| Public phase | Positive register | Mean R (150 plants) | Smallest R of 150 | Plants as low as LP2 |
| --- | --- | ---: | ---: | ---: |
| Per physical page | Solved Cicada | **0.06590220** | **0.06394042** | **0** |
| Per physical page | Shakespeare | **0.06299729** | **0.06116466** | **0** |
| Continuous | Solved Cicada | **0.06571940** | **0.06356162** | **0** |
| Continuous | Shakespeare | **0.06287699** | **0.06086815** | **0** |

Every row's 150 matched plants yield a lower-tail add-one resolution of **1/151 ≈ 0.00662**. Their **visible repeat counts** average 82.86 (Cicada) and 88.21 (Shakespeare), comparable to LP2's **86**. Thus the failure cannot be attributed to positive controls having the wrong order of magnitude of EA-transparent doublets. The collision difference persists even with a perfectly reversible, completely unknown secret alphabet for every public phase/context row.

## Implication for the unfinished decipherment

The authentic p15 4×4 square supplies the *16*, and the apparent EA-sized repeat channel supplies the transparent-marker model. Combined, they do **not** recover GP-readable ciphertext under this extremely broad stationary phase16-plus-public-predecessor architecture. A natural-source solution must use a **different cryptographic structure**: for example a genuinely hidden/evolving secret state, key draws/skips, a prior non-GP ciphertext layer, or an unconventional plaintext frequency register.

The result is conditional on the plaintext resembling the tested GP-English author registers. Exact per-state collision identity is unconditional, while *comparing* it to these source families remains a model test. Independently changing the private table midstream, varying phase based on secret state or changing the outer output alphabet outside the per-state bijection lies outside the statement.

**Reproduction:** [Standalone CommonJS program with source-locked 150-draw controls, complete forward/backward roundtrips and original 6,365/6,432 pair-count assertions](../sims/spiral16_public_row_invariant.cjs). Executes in the existing manual-only [phase coincidence CI suite](../.github/workflows/phase-coincidence-invariant.yml); successful [GitHub Actions 42841961151](https://github.com/FlareZ123/liber-primus/actions/runs/42841961151), Node.js 22. No new scheduled CI or plaintext claim.
