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

Do not extend ordinary q8 key sweeps. The original historical cipher permits literal plaintext-F holds; the following extension settles that distinct global consuming branch. Other key families need independent source support. #2887 remains Agent2's issue; this is a complementary key-inference result, not its closure.

## Literal plaintext-F hold extension (26 November)

The native historical rule makes plaintext F transparent and non-consuming; ordinary encrypted non-F can also emit ciphertext F. This is a different sender:
\[
C_{p+i}=\begin{cases}0 & P_i=0,\\ P_i+K_{(h+J_k)\bmod8}\pmod{29}&P_i\ne0,\end{cases}
\]
where h counts all preceding **non-F** plaintext runes, across true word boundaries. An ordinary branch decoding to zero is illegal; a visible ciphertext zero can be either a hold or a legal ordinary branch. The original has six visible zeros (body offsets 32,56,186,238,248,264).

Anchor inference enumerates every in-register word of length >=10 at every count-feasible offset. F requires a literal zero at its position; the remaining runes must yield a consistent periodic eight-digit difference vector. Missing key digits are exhaustively completed (the original and all three controls have no compatible partial anchors; the sole low-consuming long dictionary form FOODSTUFFS cannot align its three literal Fs). Prior holds can only occur at visible zeros; enumerate every phase from the feasible ordinal/offset phase minus 0..number of preceding zeros. This is a conservative superset, not a fixed F assignment.

The relaxed lattice state is now (true ordinal, rune offset, cumulative holds). At every word edge, enumerate every local consuming/holding inverse; two paths with the same length and number of holds have identical future key state, so retain the lowest OOV cost. Impossible ordinary-F transitions are discarded even on OOV words. The individual count-feasible edge mask and final total word count/length remain exact necessary conditions. The exact count DFS on survivors carries the hold state and replays each returned witness; no original candidate reaches it.

| Input | Anchor matches | Unique complete keys | Relaxed survivors | Exact planted key | Recovered runes |
|---|---:|---:|---:|---|---:|
| Native LOSS | 1 | 6 | 1 | yes | 212/212 |
| Native KOAN | 1 | 8 | 1 | yes | 191/191 |
| Same inventory, three long OOV | 1,087 | 7,908 | 1 | yes | 298/299 |
| Original p54–55, <=3 OOV | 1,047 | 7,941 | 0 | none | none |

All original candidate ranges [0,1000),[1000,4000),[4000,7941) were executed, totaling 7,614,925 active-state visits. No rank cutoff, no partial anchor cap, no original exact-stage timeout. The stress control's full ranges [0,1000),[1000,5000),[5000,7908) have only its correct key survivor; its exact replay differs from the planted plaintext at one rune (an alternative segmentation/plaintext remains possible). The two native controls recover all words under this sender.

**Decision:** the same exact original conditional exclusion now covers both ordinary and global plaintext-F-consuming periodic q8 U2b models. This is not an exclusion of every latent length inventory, arbitrary word phase or arbitrary key law. No original key/plaintext recovered. The combined sender remains a hypothesis, not a first-party authored operation.

Reproduce: `node sims/lp2_u2b_periodic_q8_fhold_anchor_sft.cjs original 0 1000`, then `original 1000 3000`, `original 4000 3941`; control modes `loss`, `koan`, `stress 0 1000`, `stress 1000 4000`, `stress 5000 4000`. [SFT](../sims/lp2_u2b_periodic_q8_fhold_anchor_sft.cjs), [original first](lp2-u2b-periodic-q8-fhold-original-0000.json), [middle](lp2-u2b-periodic-q8-fhold-original-1000.json), [final](lp2-u2b-periodic-q8-fhold-original-4000.json), [LOSS](lp2-u2b-periodic-q8-fhold-loss.json), [KOAN](lp2-u2b-periodic-q8-fhold-koan.json), [stress first](lp2-u2b-periodic-q8-fhold-stress-0000.json), [middle](lp2-u2b-periodic-q8-fhold-stress-1000.json), [final](lp2-u2b-periodic-q8-fhold-stress-5000.json). Same four pinned inputs; connected V8 core executed, standalone Node/CI not independently run.
