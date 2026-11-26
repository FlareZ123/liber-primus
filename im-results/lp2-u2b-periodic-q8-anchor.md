# Periodic q8 word-ordinal jump: ranking-free original key inference

**Agent 3, 26 November 2026. Exact conditional original negative.** No new plaintext or authentic key.

## Model and distinct contribution

The external [U2b receiver](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round47/X1-redteam/x1_c10_beam_attack.py) jumps by cyclic GP-chart primes according to *true* word ordinal. Agent2 owns #2887's fixed-key ranking-free lattice. This independent branch uses an entirely unknown **period-eight key** (historical WELCOME q8 and terminal eight-rune rubric motivate the period, but do not select U2b). Freeze ordinary addition:

\[
C_{p+i}=P_i+K_{(p+i+J_k)\bmod8}\pmod{29},\qquad J_k=\sum_{j=0}^{k}\mathrm{prime}[j\bmod29].
\]

No literal-F holds, no unknown jump law, no key ranking, no assumption about printed true starts. This is an exploratory combination, not a first-party selected cipher. The independent count inventory premise is conditional; H-decoy with unconserved lengths escapes.

## Exact inference

The corrected terminal black body is p54 after its nine red runes plus p55: 299 runes, 64 complete groups including the 11-rune cross-page carry. The lengths include 10,10,11,13, so <=3 arbitrary OOV words imply at least one dictionary anchor of length >=10 regardless of its order. The 33,394-form GP29 register contains both greedy NG/ING and IA/IO spelling conventions, TextBlob forms, exact native solved words and all singleton runes. Donor words are included; controls assess key inference, not unseen lexicon robustness.

For any in-register anchor at position p, the repeated-phase differences C[p+i]-C[p+i-8] must equal P[i]-P[i-8] (mod29). Hash these signatures by length. Every compatible anchor fixes all eight key digits; enumerate each feasible phase. No rank or sample truncation. For each length l, remove one l from the count inventory and compute all possible prefix cardinalities k and sums p by 0/1 subset-sum DP. This gives necessary and sufficient individual-edge feasibility in some ordering. It restricts the anchor phases and each edge in the relaxed ordinal/offset lattice; the relaxed path may splice incompatible subsets, so it is an admissible lower bound on true OOV cost. Dynamic programming merges by (k,p) keeping minimum cost. Only surviving keys need exact remaining-count search with admissible suffix bound. The capped 3,000,000-node exact stage cannot certify a negative if capped; **no original key reaches this stage**.

## Executed results

| Input | Anchor matches | Candidate keys | Relaxed survivors | Exact key | Recovered runes |
|---|---:|---:|---:|---|---:|
| Native LOSS OF DIVINITY, 48 words | 1 | 4 | 1 | yes | 212/212 |
| Native KOAN, 48 words | 1 | 7 | 1 | yes | 190/191 |
| Original-shaped synthetic inventory, three long OOV | 1,248 | 8,340 | 1 | yes | 298/299 |
| Original p54–55, <=3 OOV | 1,099 | 7,641 | 0 | none | none |

All three controls recover the exact complete hidden key; two have alternate lexical segmentations, so exact key recovery does not imply unique plaintext. They recover 48/48, 46/48 and 62/64 words at corresponding ordinal positions; the selected witness need not be the planted one. The stress control replaces three long words by arbitrary nonregister rune strings and preserves the original 299/64 length inventory, testing the single surviving long-anchor guarantee. All found witnesses replay exactly with the same length inventory.

Original phase joins 7,660, 7,641 unique keys, 4,959,337 active-state visits. Every candidate is eliminated by the relaxed OOV path gate; no exact-count cap is relevant. Thus **every ordinary periodic q8 U2b key** fails the original 299-rune body if the true word-length multiset is the printed one and at most three true words are OOV in the named register. This does not reject arbitrary word lengths, other periods, other jump laws or transparent-F semantics. No candidate original plaintext.

## Reproduction and next decision

`node sims/lp2_u2b_periodic_q8_anchor_sft.cjs all` ([script](../sims/lp2_u2b_periodic_q8_anchor_sft.cjs)). V8 executed the same core for [controls](lp2-u2b-periodic-q8-anchor-controls.json) and [original](lp2-u2b-periodic-q8-anchor-original.json); standalone Node wrapper not separately CI-run. Inputs: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, corrected groups 8960e113af36ee46186965e394ec6be18d69b74f, TextBlob 140e1d22b5f8c45deddd2e8b25549d9d6307d938, native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f.

Do not extend ordinary q8 key sweeps. The original historical cipher permits literal plaintext-F holds; that distinct model needs a phase-history-aware anchor and path proof. Other key families need independent source support. #2887 remains Agent2's issue; this is a complementary key-inference result, not its closure.
