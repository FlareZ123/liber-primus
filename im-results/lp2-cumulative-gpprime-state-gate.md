# Cumulative plaintext Gematria-prime state: exact original inverse (#2774)

## Decision
The frozen all-consuming, chapter-local recurrence `C_i=(P_i+s_i) mod29; s_(i+1)=(s_i+GPprime(P_i)) mod29` does not recover ordinary native-GP prose on p40–53. All 29 initial states coalesce after exactly 36 original runes. Therefore offsets 36..3007 (2,972 runes, including the entire 1,145-rune withheld interval) are forced, irrespective of initial state. The forced suffix is nonlinguistic, with IoC .0344997153. Do not seek a different IV for this equation. No unknown LP2 plaintext, authentic key or authored cipher selector was recovered.

## Equation-level comparison and proof
Let q be the canonical GP prime table, in particular A=97, NG=79, OE=83, D=89. For known ciphertext c, the transition is T_c(s)=s+q((c-s) mod29) mod29. Put p=c-s; then T_c(s)=c-(p-q(p)) mod29. The mapping p-q(p) has only 20 distinct residues, hence T_c always has image size 20. Deterministic transition composition cannot increase the number of reachable states. This is a finite exact synchrony test, not a score-based pruning technique. Once the state sets merge, all subsequent plaintexts must agree, and perfect re-encryption is automatic for all 29 initial states.

The equivalent differential equation C_i-C_(i-1)=P_i+q(P_(i-1))-P_(i-1) mod29 shows the distinction from #2611: that issue uses raw ciphertext, previous consuming plaintext prime-minus-one and literal F holds. #2766's previous-C row permutations are not this architecture: our shift depends on previous plaintext through the retained state, even for fixed previous ciphertext. Neither cited negative subsumes this exact all-consuming law. #841 found no authenticated previous-word numeric key handoff; the canonical prime chart motivates testing the public function but does not select the recurrence.

## Original and controls
Pinned inputs: canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and solved native transcriptions `1b064ef6d85819b7d96adaff31a82d1ec551598f`. Physical p40–53 = 3,008 runes, p50 empty, development p40–46 = 1,863, withheld p47–53 = 1,145. No separator or page reset, no F bypass in proposed recurrence. Native controls are nine externally transcribed solved records; rune extraction discards separators and checks all rune codepoints against the chart. The authentic p56 prime-minus-one schedule with literal F hold independently reproduces 85/85 symbols consuming 84 primes; p57 directly matches 95/95.

The score is a spacing-free interpolated native trigram model: add-one unigram, bigram and trigram backoffs with strength 10, per-rune mean natural log. Train original scorer on all nine native sections; planted controls leave the entire donor section out of training. Initial state chosen on development only. Nine native sections × initial states 0,7,19 = 27 plants, each enumerating all 29 candidates and replaying each. All 27 true states selected and all 3,417 withheld runes correct; native heldout scores range -3.255029 to -1.985453. These finite controls are shorter than original and from related solved prose; no claim of universal language discrimination.

Original reachable-state counts after offsets consumed: 0:29, 1:20, 2:15, 3:12, 4:11, 5:8, 6:6, 8:5, 11:4, 19:3, 22:2, 36:1. Development winner IV16 has mean -5.010098, holdout -4.948923; all 29 states replay original exactly. Since holdout is identical for all IVs, it is not independent evidence for IV16. Forced suffix mean -4.987520, IoC .0344997153, counts range 84–123 across 29 labels, adjacent equals 89. Native section IoC range .05250694–.07002801. Reordering or resegmenting this suffix cannot change its unigram distribution. That does not exclude an additional alphabet-changing layer or radically different register.

Two descriptive negative ensembles use fixed xorshift32 seed 0x2774cafe, 100 independent uniform GP29 ciphertexts and 100 Fisher–Yates permutations of the original ciphertext, all 3,008 symbols, same prefix-only selection and heldout score. Uniform median -5.066614, max -4.929323 (2/100 at least original); permuted median -5.058938, max -4.935884 (1/100 at least original). These are finite diagnostic comparisons, not evidence for the recurrence or proof of independent ciphertext. The complete forced suffix and every score are preserved in raw data. No coherent withheld reading.

## Reproduction
- [SFT](../sims/lp2_cumulative_gpprime_state_sft.cjs) — from repository root `node sims/lp2_cumulative_gpprime_state_sft.cjs`
- [Raw results](lp2-cumulative-gpprime-state-raw.json) — exact forced rune string, state history, all initial-state scores, 27 plants, 200 negative scores and source blob IDs.
- Executed the exact experiment function in connected JavaScript; Node wrapper uses only built-in modules. No CI execution claimed.
- The exact equation is retired; arbitrary state updates, extra encipherment layers, non-native registers and different original generation order are not established or excluded by this test. The central result is state synchrony on original input, independent of language scoring. A new branch requires independent source evidence.

## Literal-F-held extension (#3056, Agent8, 26 November)

**Decision: exact impossibility on original p40–53.** The 27 all-consuming controls above do not cover authentic p56-style literal F semantics. The fixed extension allows F plaintext to emit ciphertext F and retain the state, while every non-F plaintext consumes:

    P=0: C=0, s'=s
    P!=0: C=(P+s) mod29, s'=(s+q(P)) mod29

The canonical prime table is independently motivated by LP1 Wisdom (for example GPprime(SHADOWS)=341, the printed square value), but neither the square nor the solved p56 cipher selects this running-state law. #2754 resets the key at clause boundaries to the preceding clause sum; #841 sought a preceding-word key handoff; #2746 uses an occurrence-count clock. None is this continuous intra-word cumulative recurrence. #2774 (above) is the exact all-consuming counterpart, while #2611 uses a prime-minus-one previous-plaintext law. The literal F semantics distinguish them: at state1, plaintext F emits1 and advances to3 under #2774, but emits0 and retains1 here. At C=0,s=1 both a literal hold and consuming plaintext28 are legal, so the hidden branches cannot be discarded by reindexing.

For successive *consuming* symbols (x,u) and (y,v), eliminate s to obtain v−u=y−x+q(x) mod29. Any interposed literal F holds must have C=0, and cannot be inferred from C=0 alone.

### Exhaustive inverse

At known ciphertext c and reachable state s, include the following and only these edges:

- if c=0, plaintext0 and next state s;
- let p=(c−s) mod29; if p!=0, plaintext p and next state (s+q(p)) mod29.

In particular a nonzero c=s admits no edge. The Boolean union starts from all 29 possible initial states and advances by the exact edge union. Induction proves necessity and sufficiency: every legal sender has exactly one of these emission branches, and every included edge satisfies the forward law. Exact BigInt path counts and backtracking witnesses independently verify branching and full replay. A complete three-symbol sender enumeration at IVs 0,1,7 checks all 66,983 distinct positive ciphertext cases against the inverse path multiplicities.

### Controls and original contradiction

27 plants from all nine pinned solved-native sections, each at IV0,7,19, preserve the exact true state at every one of 8,937 positions, including 144 literal holds and 311 consuming ciphertext zeros. Every selected witness replays; only two arbitrary witnesses exactly equal the native donor, demonstrating why arbitrary path selection does not authenticate plaintext. The actual p56 prime-minus-one control independently replays 85/85 original symbols with 84 consuming steps. The wrong all-consuming clock remains legal on 2/27 adversarial native plants under the F-held receiver; actual p56 also happens to be legal under this wrong recurrence. Legality alone is therefore deliberately not treated as evidence of decipherment.

On the 3,008 original p40–53 runes with a continuous chapter clock and no page resets:

- IVs 0,9,17,20 die at zero-based offset9.
- IVs 3,10 die at offset16.
- All remaining 23 IVs die at offset102.
- At consumed offset102, the **union of every possible initial state and every F path is exactly {9}**. The next original ciphertext rune is 9 (N). Its consuming inverse would be F=0, which is forbidden; literal F cannot emit 9. Hence the union is empty after the 103rd rune. No later suffix can restore a legal path.

No lexical score, IV tuning, alternate prime function, or boundary changes are necessary or permitted for this fixed family. This is an exact original-input contradiction, stronger than a negative language fit. No unknown LP2 plaintext, authored key or historical mechanism recovered.

[Exact F-hold SFT](../sims/lp2_cumulative_gpprime_fhold_exact_sft.cjs) · [raw all-IV certificate and native controls](lp2-cumulative-gpprime-fhold-exact-output.json). The experiment core executed in connected V8, not a separate Node/CI run. Inputs are the pinned canonical corpus and solved-native transcription blobs recorded above.

## Unreduced integer Euler-totient extension (#3064, Agent20, 26 November)

**Decision: exact contradiction at original offset 83 (84th rune).** The nonlinear state is different from the modulo-29 recurrence above and Agent43's [modulo-3301 recurrence](lp2-running-gpprime-totient3301.md). Freeze S=1 at physical p40, including its heading, and retain the integer sum without any modulus: for P=0 emit C=0 and hold S; for P!=0 emit C=(P+phi(S)) mod29, then add GPprime(P) to S. This is a speculative composition of authentic operations, not an authenticated cipher. The p40–53 framing follows #3056 (3008 runes, p50 contributes none); a body-only origin, other IV, sign, reset or extra layer is outside the test.

For each known ciphertext c and reachable S, the complete inverse edges are the held F branch (only if c=0) and the consuming branch p=(c-phi(S)) mod29 (only if p!=0), with next state S+GPprime(p). Induction gives necessity and sufficiency, including all hidden F choices. Integer state is bounded by 327873; phi is calculated by exact integer sieve. Map state merging preserves all BigInt path multiplicities. No scoring, pruning or beam.

The original state set never exceeds two states. At consumed offset 83 only S=4420 (one path) survives. phi(4420)=1536=28 mod29; C[83]=28. The consuming inverse would be forbidden P=0; literal F cannot emit 28. Zero states after this rune, so the remaining ciphertext cannot rescue the recurrence.

Controls: all 24389 three-rune input sequences produce 22046 distinct ciphertexts; exact inverse path counts equal brute sender multiplicities on every positive case. All nine native solved plaintext plants preserve all 2979 true state steps and one selected witness per plant replays; only 3/9 arbitrary witnesses are fully correct (ambiguity is expected). Wrong all-consuming sender legal on 1/9 controls. Independent authentic p56 replay 85/85 with 84 consuming shifts; the proposed wrong receiver dies on authentic p56 at offset30. WISDOM SHADOWS prime sum=341. These validate code and framing, not the historical relevance of the proposed law.

[Exact SFT](../sims/lp2_cumulative_gpprime_integer_totient_sft.cjs) · [raw certificate](lp2-cumulative-gpprime-integer-totient-output.json). Experiment core executed in connected V8 against pinned source blobs; standalone Node wrapper not separately executed. Retire the precise #3064 family, with no IV/phi/sign sweep and no unknown plaintext or authentic key recovered.
