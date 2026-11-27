# Nonlinear-center nearest-neighbor GP29 sender: fixed-endpoint obstruction and cubic original inverse

**27 November 2026 — Agent1. Decision:** any nonaffine center with nonzero linear neighbors is noninjective on unrestricted fixed-endpoint frames of length ≥64, covering all 55 rune-bearing unresolved physical pages. This includes position-dependent nonaffine centers and nonzero outer coefficients. In the cubic special case, the entire fixed-endpoint cubic-center sender with nonzero outer and cubic coefficients is noninjective for every frame of length ≥2, regardless of key or endpoint values. It is a lossless receiver only with additional initial-state information or a justified restricted plaintext domain. Retire the exact unclocked symmetric cubic-center receiver tested on p54–55. Three independent source-native held plants recover the full key and all 924 runes, but the original fit/continuation is nonprose. A separate exact necessary condition excludes the broader normalized cubic-center sender against every contiguous length-3008 window in the three pinned literary registers. No authentic unknown plaintext, key, or new source-selected operation.

## General fixed-endpoint obstruction (all nonaffine center maps)

**Theorem.** On GF(29), a stationary sender with fixed external endpoints and
`C_i=a P_(i-1)+f(P_i)+c P_(i+1)+d`, where a,c are nonzero and f is any
nonaffine function, is noninjective on the unrestricted n-rune message domain
for every n≥64. The conclusion also holds for position-dependent coefficients
and center maps provided the two outer coefficients stay nonzero and each
center map is nonaffine. This is a bound on global losslessness, not a claim
that every individual ciphertext has multiple preimages.

**Proof.** For a difference h, let S_h={f(x+h)-f(x): x in GF(29)}.
S_0={0}. For h≠0, |S_h|≥3: a singleton makes f affine because h
generates the additive group. Exactly two values u,v occurring m and
29-m times would give m(u-v)=0 by telescoping, impossible for 1≤m≤28.
The same argument works independently at each position. A collision
difference path satisfies a h_(i-1)+s_i+c h_(i+1)=0 with s_i in S_(h_i).
Every such path can be realized by choosing a secant witness independently
at each plaintext position. The external differences must both be zero.

Track reachable pairs (x,y)=(h_(i-1),h_i) from the 28 states (0,h≠0).
The zero pair is unreachable; the other 840 pairs are the ambient state
space. Each transition is (x,y)->(y,-(a x+s)/c), s in S_y.
Choosing just one s per y gives a bijection of the nonzero pair space,
so the reachable cardinality never decreases. After step 1 it is at least 84.

For a reachable set of size m, write X_y for its column of first coordinates
with second coordinate y. Each nonempty nonzero column maps to a disjoint
output row of size at least min(29,|X_y|+2), by the Cauchy–Davenport
sumset inequality. The zero column preserves size and has at most 28
members. While m≤420, there are three exhaustive cases:

1. All nonzero columns have size ≤26. There are at least
   ceil((m-28)/26) nonempty nonzero columns, each gaining ≥2.
2. Some nonzero column has size ≥27 and none is empty. If p columns
   are partial, then m≥29(28-p)+p, so p≥14. Each partial column
   gains at least one.
3. Some nonzero column has size ≥27 and another is empty. The next
   reachable set has one full row and one empty row. Its 28 nonzero
   columns are all nonempty and partial; the following step gains
   ≥28. The first step never decreases the size.

Consequently the one- or two-step progress dominates the benchmark
B_1=84, B_(t+1)=B_t+min(14,2 ceil((B_t-28)/26)), as long as the
actual set has not already exceeded 420. The increment is monotone and
at most 14. The two-step case can skip one benchmark time but gains at
least 28. The last benchmark values at times 27..31 are
378,392,406,420,434. Allowing a final two-step overshoot, the actual
reachable set exceeds 420 by time 32. It remains above 420 thereafter.

Run the same difference walk backward from the right boundary;
the nonzero outer coefficients interchange and the same proof applies.
For n≥64, both the first 32 positions and remaining n-32 positions
give >420 reachable states. After reversing the coordinate order of the
backward states, the two sets must intersect within the 840-state
ambient space. Concatenate the difference paths at that common pair
and independently realize the secants. The resulting two plaintexts
differ at the first rune yet have identical ciphertext for any fixed
endpoint values and additive constants. QED.

The canonical corpus has 55 rune-bearing unresolved physical pages;
their shortest is p49 with 66 runes. Thus the theorem applies to every
such whole-page frame as well as longer chapter frames. It does not
exclude short frames, affine centers, zero outer coefficients,
authenticated extra initial-state information, or a restricted
plaintext domain with separately demonstrated injectivity.

**Constructive checks.** The connected V8 runtime built and replayed
all 784 normalized nonzero coefficient pairs at length 64 for each
of two nonaffine centers: f(x)=x+[x=0] (nonpermutation), and identity
with 0 and 1 exchanged (permutation). All 1,568 witnesses replayed;
both forward and backward sets reached all 840 states. Another 12
witnesses replayed at lengths 66,76,308,3008 with three coefficient
pairs. These checks illustrate the theorem; the proof is independent
of the finite sample. The consolidated standalone Node wrapper has
not been separately executed.

## Mechanism and reason for testing

The original repeated half-turn art and historical GP29 arithmetic motivate exploring two-neighbor mechanisms; the p15 recurrence and conditional cube/DH reading make a cubic center a finite nonlinear alternative. **Neither cue actually selects the law or coefficients.** The prior [rank-one product obstruction](lp2-two-sided-rankone-noninjectivity.md) relies on zero factors; this additive outer-neighbor construction avoids that specific defect. It is not the [linear tridiagonal law](lp2-forward-tridiagonal-repeat-gate.md) or a polynomial of previous ciphertext alone.

Fix a symmetric neighbor pair:

    C_i = P_(i-1) + b*P_i^3 + P_(i+1) + d mod29, b in GF29*, d in GF29.
    P_(i+1) = C_i - P_(i-1) - b*P_i^3 - d mod29.

Given both initial runes L=P_(-1) and P_0, the recurrence uniquely gives the plaintext and terminal R=P_n. The state update (prev,cur)->(cur,C_i-d-prev-b*cur^3) is a permutation of the 841 pair states for each C_i. This proves reversibility of the augmented-state transformation, not of every fixed-endpoint finite-frame sender: if only L,R are supplied, 29 candidate P_0 values must be checked; multiple may survive. Three actual native plants have respectively 3,1,2 such paths under their true key and both known boundaries. No original source specifies either seed, so the search grants both freely. No F-bypass, printed-word semantics, or resets.

## Stronger constructive result: fixed endpoints never suffice for n≥2

The prior rank-one obstruction relied on zero factors; this additive outer-neighbor family has a different, universal ambiguity. For any normalized nonzero b,c, fixed d,L,R, let two plaintexts differ by h_i, with h_(-1)=h_n=0. Define

    S_h = { (x+h)^3 - x^3 : x in GF29 }.
    h_(i-1) + b*s_i + c*h_(i+1) = 0, s_i in S_(h_i).

This difference equation is necessary and sufficient for a collision: each x=P_i can be chosen independently as a witness to s_i in S_(h_i). The ciphertext constant and fixed endpoint values cancel exactly.

For h≠0, completing the square gives

    (x+h)^3 - x^3 = 3*h*(x+h/2)^2 + h^3/4.

Thus S_h has exactly 15 elements. It excludes zero because x³ permutes GF29 (gcd(3,28)=1). Moreover S_h = h³*S_1; for every nonzero s, precisely 15 nonzero h admit s in S_h. S_0={0}.

Track pair states (h_(i-1),h_i) and let R_t be the states reachable after t difference-equation steps from any (0,h_0), h_0≠0.

- R_1 consists of (h_0,h_1) with h_0,h_1 nonzero and -c*h_1/b in S_(h_0). For each fixed h_1≠0, its predecessor set contains exactly 15 choices of h_0.
- **R_2 is exactly all 812 pairs (u,v) with u≠0.** Fix u≠0 and any v. The second equation permits the 15 values h_0=-c*v-b*s, s in S_u. The first equation permits 15 values of h_0. Two sets of size15 in a 29-element field intersect. Conversely the first difference step never has h_1=0.
- **R_3 is exactly all 840 nonzero pairs.** If the desired first coordinate u≠0, its allowed predecessor coordinate set has size15, so at least one predecessor is nonzero and belongs to R_2. If u=0 and v≠0, the predecessor must be -c*v≠0, also in R_2. The all-nonzero-pair set is invariant thereafter: every such state has a predecessor there, and the zero pair cannot be reached from a nonzero pair (S_0={0}).

Therefore (1,0) is reachable for **every n≥2**, giving h_(n-1)=1,h_n=0. Backtrack with these exact reachability sets, choose a secant witness per position and construct two different messages with identical ciphertext for ANY given endpoints. Nonzero a in the unnormalized sender is removed by scaling. For n=1 the cube permutation is injective; the bound is sharp. The proof generalizes to any odd prime q>3 with q≡2 mod3 using (q+1)/2-sized sets.

Example with n=2, b=c=1, d=0, L=7,R=11:

    P  = [1,28]
    P' = [0,0]
    C  = [7,11]

This is a global unrestricted-input theorem, not a claim that both members of each collision are natural English. A genuine source restriction or authenticated seed could still make the receiver usable; no such operand has been selected. Executed the exact 841-state reachability calculation for all 784 normalized keys: all reach a terminal pair at step2 and saturate to 840 states at step3. The constructive backtracker independently built and replayed **3,920/3,920** collisions (784 keys each at lengths 2,3,76,308,3008), with varying fixed endpoints and additive constants. These include the physical p55, p54–55 and p40–53 lengths; the proof covers every other length without further tests.

## Exact original-cipher inverse

Train a fixed conditional trigram on the full 62,492-rune source-calibrated Gibran control (smoothing 0.5). Use the existing calibrated orthography (ING, IO, QU→CW, etc.). Three controls are 308-rune excerpts from solved reference sections 3,6,10–13 with zero-based starts 40,120,70 respectively. For each, and the original complete p54+p55, exhaust all 28×29³=682,892 possible (b,d,L,P_0) states. Fit ONLY plaintext offsets 0..231, generated from ciphertext offsets 0..230; score 230 conditional trigrams. Freeze the winner before using C_231 and the p55 ciphertext to decode the remaining 76 runes. The true keys never enter model selection; truth is used solely for ranks and accuracy. The held score includes context from the last two fit runes.

| Input | True / best (b,d,L,P0) | Fit log-score/rune | Held log-score/rune | Recovered |
|---|---|---:|---:|---:|
| Native p3 excerpt | 7,19,4,4 | -2.346200502 | -2.393664456 | 308/308; held76/76 |
| Native p6 excerpt | 23,3,16,24 | -2.205524458 | -2.181647842 | 308/308; held76/76 |
| Native p10–13 excerpt | 11,9,22,23 | -2.582295400 | -2.456483035 | 308/308; held76/76 |
| Original p54–55 | 28,9,3,1 (fit only) | -3.631353394 | -3.823449560 | nonprose |

Each search has one best key; all plants rank the true key first. Replay all 308 ciphertext glyphs exactly using terminal R=13,25,6,14 respectively. Exact replay is automatic for this inverse with freely inferred R; it is not key evidence. The original winner is not an authentic key. Its complete 76-rune continuation, rendered in chart tokens, is:

    S L Y NG X A EO U D AE G L T U W I IA F B L R W E L S I M I AE D EO M W R J R IA IA F T AE J NG W TH R F EA H I S TH M E I TH W EA A X T TH IA EO O J P EO X TH EA J F I OE R

Original p54/p55 repeat count 3; plant counts 8,5,8. The plants are native-length and content controls, not repeat-matched controls. Held scores well below native controls under this exact fit law. No claim that all possible ordinary English must exceed the chosen trigram scores.

## Broader exact necessary condition

Grant nonsymmetric neighbor coefficients, all nonzero center coefficients, arbitrary additive constant and arbitrary endpoints:

    C_i = a*P_(i-1) + b0*P_i^3 + c0*P_(i+1) + d, a,b0,c0 nonzero.

Scale all ciphertext by a^-1, preserving equality; write b=b0/a, c=c0/a. For four consecutive interior plaintext runes x0,x1,x2,x3, two interior ciphertext runes are equal iff

    (x1-x0) + b*(x2^3-x1^3) + c*(x3-x2) = 0 mod29.

Each length-3008 donor window has exactly 3005 such interior comparisons. The two boundary comparisons can only add repeats, whatever the endpoints; original p40–53 has just 18 adjacent equalities. Rolling counts exhaust all 784 normalized keys and every contiguous start in the three native-GP corpora. No word assumptions are needed.

| Reference | Runes | Windows | Minimum interior repeats (all b,c) | Symmetric c=1 minimum | Key/window pairs ≤18 |
|---|---:|---:|---:|---:|---:|
| Gibran | 62,492 | 59,485 | 34 | 63 | 0 |
| Shakespeare | 217,106 | 214,099 | 50 | 53 | 0 |
| Emerson | 321,327 | 318,320 | 34 | 63 | 0 |

Exact minimum witnesses (b,c,start): (27,28,50802), (18,15,203200), (27,28,310111). Thus 591,904 windows ×784 normalized coefficient pairs, zero survivors. This excludes the full named forward family under the finite contiguous donor envelope, even if its finite-frame boundary map is nonunique. It does not exclude longer history, nonstationary clocks, F-holds, more general cubic polynomials, novel plaintext, or arbitrary pre-encryption transposition. No further parameter tuning on the negative p55 score is justified without an independently selected source operand.

## Reproduction

[SFT](../sims/lp2_cubic_center_neighbor_sft.cjs) prints complete controls, keys, fit/held scores, replay and all repeat minima. All three computation cores (key inference, repeat gate, constructive collision certificates) were executed in the connected V8 runtime using exact current source file contents; the Node wrapper uses the existing source-native encoder and was not separately executed. Inputs: canonical LP2 blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, solved reference blob 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d, Gibran blob df260a07d56bf5998d40a6360b6132c35c252d10, repository-pinned Shakespeare and Emerson control files. The report and SFT are intentionally in intermediate results rather than authoritative plaintext.
