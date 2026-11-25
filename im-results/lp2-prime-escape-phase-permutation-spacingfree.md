# Global periodic rank maps with an arbitrary moving escape: spacing-free original inversion

**Agent 2, 25 November 2026. Decision:** retire the continuous global q8/q13 predecessor-exclusion receiver with independent secret 28-way rank permutations at every phase, canonical GP29 order, and all three specified prime-shift compositions. This is a finite native-register exclusion even when every escape choice is independently free. It does not identify a key or unknown plaintext, or exclude chapter-private periodic maps.

## Causal candidate and scope

The original 12,956-rune tape has 86 continuous adjacent equalities. Historical solved sections use WELCOME (q8), KOAN (q13), and the p56 consecutive prime-minus-one clock with a literal plaintext-F hold. The earlier [moving-escape rank test](lp2-moving-escape-arbitrary-rank-original-gate.md) grants arbitrary private rank permutations per page/section but not simultaneously periodic phase maps and a nonperiodic prime shift. The [prime-clock shared-map test](lp2-primeclock-rank28-moving-escape-original-gate.md) uses a shared arbitrary permutation and a public prime clock. This extension grants independent arbitrary rank permutations at each phase, testing the loophole without using any printed word boundary. The source does not authenticate the proposed combination or select the escape rule.

Let d=(C_i-C_(i-1)) mod29, with initial predecessor0, z=log_15(d) for d!=0, t the continuous consumption clock from zero, k=(prime[t]-1) mod28, and phi=t mod q. The two clocks advance on every rune or hold on d=0. Each S_phi is an arbitrary permutation of 0..27. The three candidate rank receivers are:

* none: r=S_phi[z];
* before: r=S_phi[(z-k) mod28];
* after: r=(S_phi[z]-k) mod28.

For fixed known escape E_i, decode d=0 as E_i; otherwise P=r+[r>=E_i]. Forward encryption removes E_i from the ordered GP chart, applies the inverse rank map and shift in the opposite order, and adds 15^z to the preceding ciphertext modulo29. This is lossless if E_i is a known causal function. The arbitrary-escape relaxation gives independent E_i at every position, including zeros, so it can only make the original compatible with more plaintexts. It is an envelope, not a fully specified decoder.

## 1. Constructive original inversion with source-inspired prime escape

Fix E_i=prime[t] mod29, evaluate q8/q13, both clocks, and no shift or before shift. A smoothed native unigram objective from 2,979 externally transcribed solved-Cicada runes yields the exact maximum-weight bipartite assignment independently at each phase (up to floating arithmetic). Fit the first 9,717 original runes only, freeze the full map, and decode the remaining 3,239. Also fit all original runes for an optimistic global objective and solve an exact integer E-count maximization.

| q | Hold on zero | Before shift | All-key E cap | Full best unigram, nats/rune | Frozen suffix unigram |
|---:|:---:|:---:|---:|---:|---:|
|8|no|no|619|-3.872724|-4.155222|
|8|no|yes|625|-3.870119|-4.186717|
|8|yes|no|641|-3.861033|-4.074299|
|8|yes|yes|615|-3.872488|-4.144446|
|13|no|no|662|-3.796983|-4.163823|
|13|no|yes|668|-3.824835|-4.156334|
|13|yes|no|675|-3.800286|-4.163563|
|13|yes|yes|685|-3.793872|-4.158075|

The fitted full and prefix-frozen maps replay the original exactly, but every output is nonprose. Two disjoint 12,956-rune native-rendered Gibran donor blocks have E counts 1,520 and 1,446 and unigram scores -2.968832 and -2.982159. Across 16 constructed plants, the hidden map always decodes/replays exactly, and the all-key optimum is at least the true score; the blind unigram assignment itself recovers only 67.30–77.03% of withheld runes, not full hidden keys. Plants have 435–488 adjacent equalities rather than the original 86. These are correctly disclosed partial-recovery controls, not evidence that the historical cipher has been found. The exact E cap does not depend on this incomplete key recovery.

[Code](../sims/lp2_prime_escape_phase_permutation_spacingfree_sft.cjs) · [raw results with all fitted keys](lp2-prime-escape-phase-permutation-spacingfree-output.json).

## 2. All-secret arbitrary-escape envelope

For a nonzero step, regardless of the independently chosen escape, P belongs to {r,r+1}. For any fixed integer weight w(P), a candidate rank can contribute no more than max(w(r),w(r+1)); for a zero step grant max(w) freely. This bound is attainable for each fixed map under the unconstrained per-site escape relaxation: choose E_i above r to emit r, or E_i at or below r to emit r+1. For E-count alone w(P)=1 iff P=18. Each phase chooses a perfect matching between 28 input symbols and 28 output ranks; summing exact assignment maxima gives a rigorous bound over all (28!)^q maps. For no/before shift, the E cap reduces exactly to the two largest nonzero-step bins in each phase plus all zero steps; the SFT checks this identity. For after shift, the time-varying k changes which two assigned ranks can contribute E, requiring the full integer assignment.

All 531,665 overlapping, full-manuscript-length windows of three native-rendered literary bodies are scored: Gibran 33,879 (minimum E 1,416), Emerson 293,635 (minimum 1,491), Shakespeare 204,151 (minimum 1,408). GP transliteration is explicit in code (ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S). Gibran and Emerson boilerplate is excluded; Shakespeare uses the repository's pretrimmed first-300k-character donor. They are finite literary comparisons, not a universal English theorem.

| q | Max E, none/before (all clocks) | Max E, after | Max after-shift top21 | Min native top21 |
|---:|---:|---:|---:|---:|
|8|1,255|1,753|12,255|12,574|
|13|1,313|1,999|12,413|12,574|

The single-E bound already rejects q8/q13 none/before across every literary window. The after-shift E cap alone is inconclusive. A joint common-rune objective closes it: the 21 most frequent runes in the independent 2,979-rune solved reference form a fixed set, and maximum occupancy over every original map/escape is at least 319 (q8) or 161 (q13) below the weakest literary window. Both ordinary and hold clocks separately fail. A second, pre-defined integer objective rounds the smoothed solved-native log-frequency to millinats. All four after-shift domains are below the weakest donor by 751,051 / 675,067 / 110,646 / 46,404 integer units (q8 ordinary/hold, q13 ordinary/hold). Neither score assumes plaintext word order; any permutation of a tested native tape has the same counts.

The separate E-only scan also considers q28, q29 and q256 and nine independent chapter keys/clock resets: they are not generally excluded by the pooled E minimum, so do not claim these domains have passed a full lexical or cipher gate. The after-shift joint objective is tested only at global q8/q13.

[Arbitrary-E integer SFT](../sims/lp2_arbitrary_escape_periodic_rank_envelope_sft.cjs) · [raw](lp2-arbitrary-escape-periodic-rank-envelope-output.json) · [weighted SFT](../sims/lp2_arbitrary_escape_periodic_weighted_envelope_sft.cjs) · [raw](lp2-arbitrary-escape-periodic-weighted-envelope-output.json).

## 3. Research decision

Do not optimize secret global q8/q13 rank permutations in these three receivers; the exact common-rune occupancy bound fails before any language-order assumptions or heuristic key search. A new source-selected varying phase/state rule, a different plaintext register or additional layer could evade the bound. Chapter-private periodic maps and q28/q29/q256 are not resolved by the strongest pooled test; prioritize an independently selected receiver over merely enlarging the key. A fixed map with an unrecoverable arbitrary escape sequence is not a complete decoder. No authentic LP2 plaintext, key or destination is recovered.

All three computational cores executed in the connected V8 runtime on the pinned repository blobs recorded in the raw JSON. Standalone CommonJS wrappers have not been separately executed in Node/CI. An initial Gibran body anchor did not match the source and was corrected to its actual literal |Almustafa; an initial oversized multi-weight experiment timed out before persistence and the successful weighted run restricts itself to the four genuinely unresolved global after-shift domains. No new workflow.
