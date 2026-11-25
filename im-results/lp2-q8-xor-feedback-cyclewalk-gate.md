# Exact q8 binary-XOR ciphertext-feedback cycle-walk inverse

Agent9, 2026-11-25; Director [#2818](https://github.com/FlareZ123/liber-primus/issues/2818).

## Frozen receiver and original scope
Let F_m(x)=x XOR m if that result is in 0..28, otherwise x (a second XOR returns to the valid starting point). For every 5-bit mask m, F_m is an involution on canonical GP29. Freeze C_i=F_(K[i mod8] XOR C_(i−1))(P_i), with unknown eight GP digits K in 0..28, ordinary consuming phase, start predecessor 0, no arbitrary binary relabeling. Body-only chapter begins immediately after p54's red9 heading. This is distinct from static phase permutations and additive feedback: known ciphertext changes the involution per position. Historical XOR is motivation, not evidence of this feedback state or clock.

Original corrected transcript exactly matches the 12,956-rune canonical corpus. Terminal black body has 299 runes and 64 complete groups, including the carried p54→55 word. Fit 47 complete p54 body groups (213 runes) only, withholding the seam group and all later groups (17 groups/86 runes). Allow two arbitrary OOV fit groups, floor(5%×47), with the same frozen 35,944-form broad GP register as #2710, including all singleton runes. No fitting on p55.

## Exact key domain and adjacent-repeat implication
Given previous ciphertext v, current c, and proposed p≠c, the unique candidate digit is k=p XOR c XOR v, accepted only in 0..28. If p=c, candidates are k=v (zero mask) or k=c XOR z XOR v for z in {29,30,31}, again restricted to 0..28. Equivalently precompute all 29^3 inverse relations. A word determines an intersection of per-phase bit masks, retaining all fixed-point cases. There are 87 invalid-code-return cases among 29×32 (x,mask) pairs; every involution round-trips.

An exact consequence is C_i=C_(i−1) iff P_i=K_phase: when c=v, applying inverse yields k directly, because k is itself a valid code. Conversely P_i=k emits v. This was checked on all 24,389 legal (v,c,k) triples. Thus the model can suppress repeats if the key digits are rare plaintext letters at their phases; it does not enforce no-repeat universally.

## Complete finite inverse under OOV budget
Choose the three longest complete fit anchors (body offsets 51 and 201, length10; offset0, length8). Every anchor spans all eight phases, and a two-OOV fit requires at least one of these three to be in the lexicon. For every same-length dictionary form of every anchor, intersect all exact masks and enumerate their Cartesian product; deduplicate keys across anchors. Then check all fit words, longest first, rejecting only upon the third OOV. Consequently no feasible key can escape the nomination pool; no score, beam, key cap, guessed plaintext, or phase rotation.

### Blind calibration
Three independent seeded hidden keys; sample words of the original group lengths from held-out last-20% Gibran, Shakespeare and Emerson donor tails, requiring lexicon membership. One length-matching fallback from the dictionary for Gibran; none for the other two. These are sampled native-register word sequences, not natural continuous prose. The fit algorithm receives ciphertext and original group lengths, not true key or withheld plaintext.

| Donor | Nominated keys | Surviving keys | Full correct | Withheld correct | Invalid-code return events |
|---|---:|---:|---:|---:|---:|
| Gibran | 4822 | 1 (true) | 299/299 | 86/86 | 23 |
| Shakespeare | 6189 | 1 (true) | 299/299 | 86/86 | 31 |
| Emerson | 6677 | 1 (true) | 299/299 | 86/86 | 39 |

All controls replay exactly. A matched independent uniform-GP pad control nominates 7169 keys, zero survivors.

### Original
The two 10-rune anchors nominate 5 and 1 assignments respectively; first 8-rune anchor nominates 2558. Deduplicated total **2564 keys**. Every nominated key reaches the third OOV by the fourth longest-word check; **zero** keys satisfy the 45/47 coverage requirement. No original key is eligible to freeze or predict p55. This is an all-key exclusion within the exact model and finite vocabulary/OOV allowance, not an exclusion of all XOR feedback, altered segmentation, keys using invalid 29–31 codes, or unbounded OOV. Retire this receiver; no new plaintext.

[Read-only SFT](../sims/lp2_q8_xor_feedback_cyclewalk_sft.cjs) · [Executed output and pinned source blobs](lp2-q8-xor-feedback-cyclewalk-output.json). Executed in connected V8; no separate Node CI run.