# Forward finite-boundary tridiagonal GP29 sender: exact native-window repeat gate (#3181)

**Decision:** reject this unclocked forward three-tap sender as an explanation of the unusually low adjacent-repeat count on p40–53 in the tested native register. This is a complete finite necessary-condition comparison, not an English-language theorem or a recovered plaintext.

For the sender C_i=a P_(i-1)+b P_i+c P_(i+1)+d modulo29 with a,c nonzero and arbitrary known endpoints L,R, solve the second-order recurrence with two starting sequences z_0=L,z_1=0 and q_0=0,q_1=1:

    z_(i+1)=(C_i-d-a*z_(i-1)-b*z_i)/c
    q_(i+1)=(-a*q_(i-1)-b*q_i)/c

P=z+tq, t=(R-z_(n+1))/q_(n+1). Unique decoding iff q_(n+1)!=0. If zero, an inconsistent endpoint gives no solution and a consistent endpoint gives 29 solutions. For the repeat gate we grant all keys including singular ones, and both endpoints arbitrary.

A scalar multiplication of C and constant translation preserve adjacent equality; normalize a=1, b in GF29, c in GF29*. This exhausts all 812 normalized repeat patterns even for arbitrary d. For four consecutive plaintext runes x0,x1,x2,x3, the two *interior* ciphertext runes are equal iff

    (x1-x0)+b*(x2-x1)+c*(x3-x2)=0 (mod29).

For each native length-3008 window, exactly 3005 interior comparisons satisfy this form. The remaining two comparisons can only add to the count, irrespective of chosen endpoints. The canonical original p40–53 length is 3008 with **18** adjacent equalities. Therefore any candidate donor window/key with more than 18 interior equalities is impossible regardless of endpoint, d, scale, singularity, or printed group treatment.

## Exhaustive actual comparison

The repository's source-calibrated greedy GP encoding is used (ING, IO, QU->CW, etc.; see orthography helper). All contiguous windows, every start, no resegmentation assumptions. Scan every normalized key using rolling counts; all minima below include only interior comparisons, not full encrypted windows.

| Source | Rune length | Windows | Minimum interior repeats | Maximum | Key/window pairs <=18 |
|---|---:|---:|---:|---:|---:|
| Gibran | 62492 | 59485 | 45 | 233 | 0 |
| Shakespeare | 217106 | 214099 | 48 | 226 | 0 |
| Emerson | 321327 | 318320 | 47 | 226 | 0 |

Total 591904 windows x812 keys =480626048 comparisons of window-level counts. Minimum witnesses (b,c,zero-based window start): Gibran (24,19,47875), Shakespeare (12,9,127646), Emerson (24,19,307171). No keys survive in any donor. Exact local randomized checks (seed3181, 200 trials) confirm the interior equality formula by explicit forward encryption; when the recurrence is nonsingular it recovers the original tape. Nonsingular normalized pairs: 784/812 at n=308, 672/812 at n=729, 784/812 at n=3008, by direct homogeneous recurrence. These controls are implementation checks, not evidence for a historical key.

Reproducer: node sims/lp2_forward_tridiagonal_repeat_gate.cjs, core actually executed in connected V8 on the listed source blobs; standalone wrapper not separately executed. Input blobs: lp2-corpus.json 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

## Distinction and decision

The [sparse cyclic filter](lp2-sparse-cyclic-filter-gate.md) is a wrapped inverse filter at offsets 8/13; [two-ended triangular prime-clock sender](lp2-two-ended-prime-triangular-gate.md) is a two-pass integration with a prime clock; [three-tap ciphertext-state gate](lp2-crosspage-three-tap-allsecret-gate.md) is a short causal inverse; the unclocked bidirectional containment result similarly bounds a three-tap inverse. Here the finite-boundary tridiagonal operator acts on plaintext in the *forward* direction, so its inverse is generally dense. The repeat bound directly tests this different direction without refitting any existing inverse filter. Nonsingular cases of a two-sided linear sender are not ruled out by the rank-one nonlinear collision proof in #3184.

The Director's repeat gate fails even for the most permissive normalized key set and complete contiguous windows in all three literary donors. No original coefficient/endpoint language fitting was performed; it would not address this obstruction. This is finite reference evidence, not a proof no English text could have 18 repeats. A new independently evidenced clock, source register, or nonstationary architecture is required to justify another branch. No unknown plaintext or key recovered.
