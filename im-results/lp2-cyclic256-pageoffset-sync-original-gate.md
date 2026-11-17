# LP2 cyclic-256 page-offset many-time-pad attack

**17 November 2026, Agent38. Source-original cryptanalytic test.** No unknown LP2 plaintext, source-selected key or complete cipher recovered.

## Decipherment premise

The original physical p49–51 numeric display holds **256 cells** (32 rows × 8). Its possible interpretation as a reusable 256-rune key tape motivates a lossless, directly exploitable cipher model with entirely unrestricted secret pad values and page offsets:

    C[p,j] = (P[p,j] + K[(j + offset[p]) mod 256]) mod 29.

K has 256 unknown GP29 symbols, offset[p] is any of 256 page-local starts, and native GP29 prose is the proposed plaintext. This premise is not author-selected. The method allows different starts at all 55 rune-bearing unsolved physical pages, unlike the earlier same-start reused page-pad exclusion and the separately tested 66 word-pointer direction rules.

## Genuine key-free attack

At aligned offsets in two ciphertext pages, subtracting corresponding ciphertext runes **cancels the unknown key**. The difference distribution of two native GP29 plaintext runes is the source-trained GP29 unigram law convolved with its own reversal. Source reference is 3,568 GP29 letters encoded by the exact declared greedy token/ING→NG converter from the preserved LP1 solved reference, plus 95 clear LP2 p57 runes, with 0.5 pseudocount per rune. Divergence of the resulting difference law from uniform is 0.022701219984236028 nats per aligned pair.

The complete original test scans all 256 relative offsets for each of the 1,485 page pairs and performs coordinate optimization over all 256 possible starts at each of the 55 pages. It includes all original 12,956 ciphertext runes and period-256 phase wrap on source pages longer than 256 runes. A planted native-GP29 unigram positive uses one independently sampled random 256-symbol key, 55 independently random phase offsets and the exact original page lengths. A negative control independently permutes each original page's rune order while preserving that page's exact length and rune multiset. The latter disrupts original anti-adjacency, so it is a convenient local null rather than a full manuscript-generating model.

## Numerical decision

| Input | Optimized joint log-likelihood ratio |
| --- | ---: |
| Fully planted repeating pad with arbitrary page offsets | **+7579.6677** |
| Entire untouched original LP2 ciphertext | **−3659.8838** |
| Per-page shuffled no-reuse control | **−3606.7764** |

The positive recovers **55/55 relative page starts**, modulo one global rotation. Original evidence is close to the no-reuse control and separated from the planted key-reuse case by more than eleven thousand natural-log score units.

This is an executable *negative* original-cipher decision: no original plaintext or key arises through the tested repeated-additive-tape route. The fitted phase search is coordinate ascent with eight seeded restarts and 20 passes on original and control, versus ten restarts and 24 passes for the planted case; it does not furnish a global-optimum certificate over all 256^55 assignments. Further value-changing layers, hidden anti-repeat repair, native-plaintext distribution shifts, independent page tapes and nonadditive systems remain outside this specific test.

## Reproduction and relationship to prior work

Single-file read-only Node22 CommonJS SFT: [lp2_cyclic256_pageoffset_sync_sft.cjs](../sims/lp2_cyclic256_pageoffset_sync_sft.cjs). Runs under the existing manual CommonJS SFT GitHub workflow, reads canonical committed corpus and solved source, checks the planted positive and native original, and writes no output files. Separate earlier scopes: [same-start repeated additive pad](lp2-reused-pagepad-manytime-original-gate.md); [word-directed cyclic256 all-secret capacity](lp2-pdir-cyclic256-allsecret-capacity-original-gate.md). A 256-entry source clue without its own authentic decoding instruction cannot be promoted to a key.
