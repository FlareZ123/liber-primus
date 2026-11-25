# Fibonacci self-indexed plaintext keys with latent F holds

**Result: exact rejection of all 32 sign/initial-phase combinations on the first 988 black-body runes of p15–22.** No new LP plaintext or authenticated key.

## Source and new mechanism
The p15 spiral reconstructs the distinct Fibonacci indices `0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`. The earlier source-directed extraction from the body (beginning at local rune 20 of p15) found a 16-rune ciphertext pickup whose GP prime sum is 708; it did not demonstrate a key. The ordinary whole-book self-index study also did not test latent F holds. Here the unknown plaintext itself supplies the key:
```
K_j = P[F_j]
C_i = 0                           if P_i = 0 (F; no tick)
C_i = (P_i + s K_t) mod 29         otherwise (consume)
t = (initial_phase + consumed_count) mod 16
```
The first 988 of the 1,883 body runes contain every required anchor, so the entire remaining 895-rune continuation is untouched. The Fibonacci indices, receiver and transparent F convention are fixed before the attack. The self-indexed key premise is conjectural.

## Exact inverse
Use 16 five-bit variables constrained to 0..28. Let four-bit h count held F runes modulo 16; it increases by either 0 or 1 at each ciphertext zero and nowhere else. At a consuming position i, the clock is `t=(phase+i-h) mod16`, and `K_t != s*C_i mod29` is required because plaintext F cannot consume. At a selected anchor, additionally enforce `K_j != 0` and `K_j+s*K_t=C_i mod29`; a held anchor forces `K_j=0`. A six-bit sum/difference is sufficient to represent the modular relation without overflow. This is an exact finite QF_BV constraint system, not a heuristic score or guessed skip mask.

All 32 sign/phase domains return UNSAT on the 988-rune prefix (39 visible zeros). Independent exact enumeration of all latent masks on the first 234 runes was performed using affine constraint-graph components: each connected component has at most 29 candidate root values, and every consuming position supplies a unary exclusion. At phase zero, sign - already contradicts the first rune, whereas sign + has a feasible prefix of 149 runes and no feasible 150-rune prefix (5 zeros; every 32 possible masks tested). Other phases can survive the 234-rune test, hence the all-phase bit-vector result materially extends the early exclusion.

## Controls and limitations
Four 988-rune synthetic messages made from repeats of the actual solved p57 plaintext were encrypted with their own Fibonacci-selected keys at (sign, phase, shift) = (+,0,0), (-,0,0), (+,7,4), (-,12,19). The full constraint system is SAT in all four cases, also when fixed to the independently derived correct key. Free solver models all re-encrypt exactly and obey the self-index relation; they are not unique and none of the first four free models recovered the true key. This is a feasibility attack and no general key-recovery rate is claimed.

The original is rejected before the untouched continuation, without a language prior. Retire this particular Fibonacci-position, fixed 16-slot additive self-key with transparent F, both signs and every initial phase. Other independently motivated state/key mechanisms remain untested.

## Reproduce
- [Python SFT](../sims/lp2_p15_fibonacci_selfindexed_fhold_gate.py), standard Z3 bit-vector solver, Python z3-solver or system libz3.
- Canonical source: `resources/liber-primus/lp2-corpus.json` blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- [Execution record](lp2-p15-fibonacci-selfindexed-fhold-gate.json).
Executed locally with system libz3, including all 32 original domains, four positive controls and independent explicit mask enumeration. No CI execution is claimed.
