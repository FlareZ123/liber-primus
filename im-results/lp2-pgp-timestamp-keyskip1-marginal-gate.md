# LP2 timestamp-derived MT19937: keyskip1 count and language-independent marginal gate (#2665)

## Decision

Retire the bounded **433 source-ranked timestamps, CPython 2.7 integer MT19937, random29 reducer, continuous offset-zero additive keyskip1 soft rejection** conjunction. Also tested 112 additional low32 word interpretations of timestamp integers >2^32-1. None of 545 representations produces coherent original text or clears the frozen marginal gate. This does not exclude other seeds, generators, ciphers, layers or offsets. No unknown LP2 plaintext or key recovered.

## Source and scope

- Exact original corpus `resources/liber-primus/lp2-corpus.json`, blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`: p0–55 continuous 12,956 GP29 runes, 86 adjacent repeats.
- [Pinned L8 list](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round18/L8-provenance/TIMESTAMP-SEED-CANDIDATES.json), blob `49d32c4b5edb4355d97ce8025279e9e0bb63825f`: 433 distinct timestamp integers, 112 >2^32-1. Literal CPython integer seeding splits into low/high 32-bit words; separately labeled low32 matches earlier S2 frozen word convention. No seed neighbourhood, offset, sign or reducer expansion. Exact ordered list in [feasibility output](lp2-r18-skipcount-feasibility-output.json). Rank 1 seed 1325734783 derives from three verified PGP packets.
- [Pinned L2](https://github.com/Dukotah/cicada3301/blob/0335ecf3f0d47c0dc6ecd953bcc729bce6ccad46/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md): 362–374 versus approximately 298 skips are **counts on a best English quadgram beam path**, thus the count inference depends on language scoring. Soft repeated-rejection model; S2 finite beam supports at most three skips per rune.
- [MT reproducer](../sims/lp2_r18_skipcount_feasibility_sft.cjs) implements init_by_array and random29 = int(random()*29), two MT words per rune. Seed 12345 vector `12,0,23,8,10,5,16,4,3,12,16,5,16,10,27,2` independently agrees with local CPython integer random().random() output. Source round19/G3/gen_py27.py inspected; no Python3 randrange used.
- GP29 literary controls are Shakespeare slices (not genuine solved manuscript plaintext), same GP converter and Gibran/Emerson trigram model as Agent50. Slices shifted by 1000 overlap: 16 distinct keys/coin streams, not independent prose samples. Gibran blob `df260a07d56bf5998d40a6360b6132c35c252d10`, Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`, Shakespeare `94c677ad9dd50771c6670e0c4e4dad9052b46d85`. 500 xorshift32-selected wrong keys exclude all candidate low32 words.

## Feasibility is not identification

At emitted index i and next key index j, one-skip legal iff K[j+1]-K[j] = C[i]-C[i-1] mod29. No-skip always legal. Greedily taking every legal one-skip opportunity yields G; stopping after any t<=G then using no-skip constructs a legal t-skip path. All 433 literal and 433 low32 streams G>=395, 500 wrong keys G>=391. **Every key permits a legal 374-skip path**, even in the single-skip subset. This does not reproduce the English-optimal count. [Raw feasibility](lp2-r18-skipcount-feasibility-output.json).

## Language-independent candidate likelihood

Let s=.81288 be the independent probability of rejecting a collision, P_i iid uniform GP29. Given C_i, C_{i-1}, key and k rejected draws, the accepted draw pins one plaintext rune. For k>=1 all skipped key values must equal each other and the accepted-minus-rejected key difference must equal delta C. The final acceptance weight w=1-s if C_i=C_{i-1}, otherwise 1, is common to all k for the unlimited soft loop. Each path's probability is 29^(-n) product(w_i) s^(total skips); common factors cancel in comparison to the iid-key mixture.

Maintain D[d], sum of s^(total skips) over paths of drift d. At i the accepted key index is i+d. No-skip term D[d]; add s^k D[d-k] for k=1..3 if exact constraints hold. Update descending d, cap d at 800. First emission no skip. For any fixed skip vector, the required k equalities at each emission have probability 29^(-k) under iid uniform keys, independent across disjoint key groups. Summing over all unlimited k yields 1/(1-s/29) per emission. Thus LR = D_total*(1-s/29)^(n-1); finite truncation removes nonnegative mass, E_K[LR]<=1 for every fixed C. Markov+union bound => familywise probability <=.05 at log(545/.05)=9.296518068217235 nats under iid uniform key null. Not an exact probabilistic guarantee for deterministic historically selected MT seeds. 500 matched MT nulls empirically check. 500 nulls alone cannot calibrate a distribution-free .05/545 tail.

[Preregistered gate](lp2-keyskip1-rejection-marginal-prereg.md) frozen before repeated-redraw run, following exploratory single forced-redraw [output](lp2-keyskip1-uniform-marginal-output.json) (different model, not independent confirmation). Required >=12/16 literary controls pass and negligible cap-edge mass. [Marginal SFT](../sims/lp2_keyskip1_rejection_marginal_sft.cjs). Independent exhaustive toy recursion agreed in 128 length-nine tests to 8.89e-16.

| Population | n | Min log LR | Mean log LR | Max log LR | Crossings |
|---|---:|---:|---:|---:|---:|
| Correct literary controls | 16 | 1.203746 | 17.596067 | 28.268685 | 14 |
| Correct uniform controls | 16 | 8.892969 | 19.886377 | 35.570718 | 15 |
| Wrong MT keys, original C | 500 | -27.736247 | -13.887727 | -1.369017 | 0 |
| Same wrong keys, first literary plant | 500 | -25.077372 | -13.449040 | 2.739825 | 0 |
| Original timestamp candidates + extras | 545 | -24.502226 | -13.929476 | 0.944645 | 0 |

Endpoint masses in upper 50 drift positions round to zero; not a formal bound on omitted mass for arbitrary fixed keys. All plants true per-position max skips <=3. Two correct literary keys fail threshold: calibrated negative, not all-language theorem. [Full output](lp2-keyskip1-rejection-marginal-output.json), [first partition](lp2-keyskip1-rejection-marginal-output-part1.json). Highest score literal rank421 integer 20170404232328; rank1 gives -12.6883096324. Original posterior mean drift 277.157–405.857. Top10 plus rank1 [direct decodes](lp2-keyskip1-rejection-marginal-top-decodes.json) nonprose.

## Independent count reproduction, full outputs preserved

Spacing-free GP29 trigram beam, exact keyskip1 relation max_skip=3, width64, hold512 from frozen winning prefix state. Same algorithm controls and originals, no per-seed tuning. Exact equivalent-state merge by accepted index and previous two plaintext indices; beam itself heuristic. Independent analogue of L2 English quadgram width400, not bitwise replay. [Beam](../sims/lp2_keyskip1_trigram_beam_sft.cjs), [batch runner + lossless full-output recovery](../sims/lp2_pgp_keyskip1_count_sft.cjs). Packed paths store every nonzero skip position/count; reconstruct all 12,956 output indices and check original C under exact relation, not unknown suppression coins.

Sixteen literary plants recover exact skip counts 16/16 (335–407), full recovery 12,940–12,954/12,956 and 8,189/8,192 withheld runes, scores -2.499547 to -2.434100. [Native controls](lp2-pgp-keyskip1-count-native-controls.json).

| Population | n | Count mean ± population SD | Range | Count >=374 | Mean score |
|---|---:|---:|---:|---:|---:|
| Original candidates | 545 | 299.3211 ±31.0085 | 208–391 | 3 | -5.799542 |
| Wrong keys | 500 | 295.8660 ±31.9791 | 213–385 | 5 | -5.798549 |

Rough external wrong-key mean ~298 reproduced, with larger variance. Gaussian approximate one-sided 0.05/545 threshold near416; zero candidates and zero of 16 correct literary controls reach it. Descriptive only; preregistered LR supplies actual family-wise decision under explicit null. Largest original count391 (rank5, 1325930871) score -5.811524, holdout -6.031065; best original full score -5.762375 worse than best wrong-key -5.750177, far below worst plant -2.499547. No coherent original passage.

Full packed paths and scores, half-open row ranges:
- Candidate [0–100](lp2-pgp-keyskip1-count-candidates-000-100.json), [100–200](lp2-pgp-keyskip1-count-candidates-100-200.json), [200–300](lp2-pgp-keyskip1-count-candidates-200-300.json), [300–425](lp2-pgp-keyskip1-count-candidates-300-425.json), [425–545](lp2-pgp-keyskip1-count-candidates-425-545.json).
- Wrong [0–125](lp2-pgp-keyskip1-count-null-000-125.json), [125–250](lp2-pgp-keyskip1-count-null-125-250.json), [250–375](lp2-pgp-keyskip1-count-null-250-375.json), [375–500](lp2-pgp-keyskip1-count-null-375-500.json).

## Consequence

Use repeated-rejection marginal as a language-independent candidate ranking instrument for future source-selected full-length keys. Not a blind key recovery algorithm or proof LP2 uses the model. Raw feasible counts and English-optimal counts do not authenticate keys. Require original heldout coherent plaintext and exact forward replay. No 2^32 repeat. Core executed on fetched pinned sources in V8; CommonJS filesystem wrappers not separately executed in disconnected local shell. No CI dispatched.
