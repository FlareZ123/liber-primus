# p50 H·G quotient with the signed-2013 DH affine cycle: original-cipher gate

**Agent14, 17 November 2026. Classification: source-constrained combined candidate, rejected on the original ciphertext.** No unknown LP2 plaintext, authentic key, or destination recovered.

## Candidate human path

Three independent source structures motivate this bounded composition:

1. The authenticated 2013 Cicada TCP challenge gives a worked DH exchange with modulus 23, generator 5, server public share 8, client public share 19, and shared value 2. Anchoring an affine map at the server public share gives
   `T(x)=8-2(x-8)=24-2x (mod 29)`.
   It fixes GP index 8 (H) and cycles the other 28 symbols with order 28. See [the signed-DH source bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md) and [the raw-grid T-cycle gate](lp2-2013-dh-t28-grid-exponent-original.md).
2. The original p50 table, read in printed row-major order as conventional base-60 bytes and reduced modulo 29, is divisible by the source-motivated degree-four product `D(X)=12X⁴+17X³+11X²+21X+23`. Its factors combine the signed 2013 BASE29 3301 polynomial and the p39 red triad. Long division yields 252 formal quotient coefficients `Q[0..251]`; see [the original grid/radix analysis](lp2-grid-numeric-codec-ambiguity.md).
3. The original book has nine visually marked chapters, and 252 = 9 × 28.

The tested key schedule assigns chapter `s`, local rune phase `i` the exponent `k=Q[28s+(i mod 28)] mod 28`, restarting the 28-slot block at each chapter. The direct candidate is `C=T^k(P)`, decoded by `T^-k`; both exponent signs were tested.

**Weakest premise:** no Cicada-authored instruction says to divide the p50 polynomial by H·G, use the quotient as exponents, repeat each 28-slot block, or apply the signed-DH affine map to LP2. This is a plausible composition of separate clues, not an authenticated cipher instruction. The experiment is deliberately limited to these exact constructions.

## Direct original-cipher result

The original 256-byte p50 stream has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Division by descending coefficients `[12,17,11,21,23]` gives 252 quotient residues and zero remainder. The nine source chapter lengths are `[729,1145,1729,1903,1021,1433,1680,3008,308]`, covering all 12,956 unknown runes.

| Candidate inverse | Full-book GP29 IoC |
|---|---:|
| Apply `T^-k` | **0.03447243998599** |
| Apply `T^+k` | **0.03447035472851** |
| Original ciphertext | 0.03447839786451 |
| Uniform 29-symbol reference | 0.03448275862069 |

Both outputs remain at the uniform GP29 baseline and their initial transliterations are incoherent. Neither direction exposes a language-bearing interval. Forward re-encryption reproduces all **12,956/12,956** original runes. A positive control built by repeating the independently solved 95-rune p57 text to the original length round-trips under the same quotient schedule and T-cycle; this validates the implementation, not the original hypothesis.

## Solved-p56 literal-F bypass

The solved p56 plaintext-F convention emits a literal F (GP index 0) as ciphertext F without consuming the key. At ciphertext F, an ordinary transformed non-F plaintext may also be possible. Exact set-valued phase propagation therefore retains both branches and rejects a normal branch if its inverse is F. For each chapter, it grants **all 28 possible starting phases independently**.

**Every phase path dies before the chapter ends in all nine chapters:**

| Chapter | First impossible rune, phase 0 (1-based) | First impossible rune, any starting phase (1-based) |
|---:|---:|---:|
| 1 | 35 | 342 |
| 2 | 6 | 160 |
| 3 | 45 | 155 |
| 4 | 64 | 180 |
| 5 | 5 | 163 |
| 6 | 2 | 184 |
| 7 | 40 | 124 |
| 8 | 62 | 104 |
| 9 | 38 | 158 |

A chapter-specific positive control encrypts repeated p57 plaintext with the same T-cycle and literal-F bypass. Its exact known-F inverse recovers every planted rune, and the set-valued phase test retains the true ending phase in all nine chapters. The original-cipher failure is therefore not an inability to model the documented F rule.

## Lag-six recurrence variant

The signed-DH source bridge also motivates the observed within-word relation `C[i]=T(C[i-6])` (80 matches among 1,290 eligible pairs). A natural combined test is to let the p50 quotient select the affine-cycle exponent on the lagged ciphertext rune: `C[i]=T^{q_i}(C[i-6])`, testing both signs. This was checked with both plausible phase clocks: continuous chapter-local phase and a phase reset at each word (the key row remains chapter-specific). The transcription parser and 1,290 eligible word-internal positions are identical to the existing lag-six analysis.

| Phase clock | `T^{+q_i}` matches | `T^{-q_i}` matches | Existing `T^1` matches occurring at `q_i=1` |
|---|---:|---:|---:|
| Chapter-local | 37 | 43 | 2 of 80 |
| Word-local | 47 | 46 | 1 of 80 |

The uniform 29-symbol reference is 1,290/29 = **44.48** matches. The quotient-exponent recurrences are at or near that baseline, and the 80 fixed-`T` lag-six matches overwhelmingly occur where `q_i
e1`. The quotient schedule therefore does not select or explain the observed lag-six echo. Eight words cross a visual chapter boundary; the reproducer changes the key row at the boundary while preserving the word-local lag and, in the word-clock test, the word-local phase.

No new conditioned permutation run was warranted: neither pre-specified quotient schedule produced an excess to investigate. This test rejects the specific Q-powered lag-six recurrence; it does not reject the independently observed fixed-`T` lag-six relation.

## Decision

Retire the specific **p50 H·G quotient → nine 28-phase chapter keys → signed-2013 affine T-cycle** as a direct LP2 rune decoder, both without F bypass and with the solved-p56 literal-F bypass. Also retire the natural Q-powered lag-six recurrence under both chapter-local and word-local phase clocks. The F-bypass direct model fails a language-independent necessary condition even when every chapter receives an arbitrary starting phase.

This does not refute the H·G factorization, the signed-DH affine map, the independent fixed-`T` lag-six observation, other uses of the quotient, or a different cipher with an independently specified evolving state. Do not repeat phase/sign sweeps for these schedules. This bounded negative does not warrant changing `results/README.md`.

**Reproduction:** run `node sims/lp2_hg_q252_dh_t28_affine_original_sft.cjs` from the repository root (Node 22; built-in modules only). The script asserts the original byte fingerprint, polynomial division, chapter lengths, original inverses, F-bypass exclusion, lag-six counts, and positive controls.
