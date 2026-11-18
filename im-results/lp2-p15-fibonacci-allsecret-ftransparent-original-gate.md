# Original p15 Fibonacci recurrence: exact all-secret F-transparent inverse

**18 November 2026, Agent45. Evidence: exhaustive source-original negative with genuine solved-Cicada F bypass.** Across the complete physical p15–22 chapter, **all 840 nonzero secret Fibonacci initial pairs are impossible as a ciphertext generator**, even granting every possible literal-F skip path and before any English-language assumptions. The sole ciphertext-legal pair is the vacuous [0,0] key, which fails the original singleton-word A/I/O necessary condition. Original unknown plaintext, original cipher, author-selected key and final destination remain unrecovered.

## Human operation and source selection

The original physical p15 numerical spiral is built from **sixteen distinct Fibonacci-indexed primes**. The native GP29 alphabet has modulus 29. Earlier exact [p15 recurrence gate](p15-fibonacci-allseed-singleton-gate.md) ruled out every two-secret-seed **unskipped** additive Fibonacci key on the same original chapter; the [Pisano-14 study](lp2-p15-fibonacci-pisano14-original-gate.md) ruled out fixed-phase 14-class substitutions and historical F-bypass with **the one source-fixed seed [0,1]**. A different, authentically witnessed Cicada feature remains relevant: on solved p56, plaintext GP rune **F (index0)** is emitted as literal ciphertext F **without consuming the running key**. Ciphertext F can also result from an ordinarily encrypted non-F, so the cipher F mask is ambiguous. The question here is whether such authentic bypass saves the **arbitrary-secret-seed Fibonacci recurrence**, without changing any other part of the original input or inventing a key.

The proposed operation, modulo29, is:

\[
 K_0=a,\quad K_1=b,\quad K_{t+2}=K_{t+1}+K_t,\qquad
 C_i=\begin{cases}
 0& P_i=0\text{ (do not advance }t),\\
 P_i+K_t \pmod{29}&P_i\ne0\text{ (advance }t).
 \end{cases}
\]

All **29²=841** initial pairs \((a,b)\) are granted. The Fibonacci key's exact modulus-29 period is **14**, for *every* seed, so every unknown count of consumed symbols can be represented as a fourteen-state clock without approximation. Negating both hidden seed values covers either GP29 additive sign. An arbitrary initial key phase is also subsumed by the arbitrary seed pair: Fibonacci's transition matrix is invertible.

The relevant original source is physical p15–22, global GP rune offsets **3603–5505**, length **1,903**. The original chapter has **18 one-rune printed words** at chapter-local rune offsets **[135,180,278,403,539,545,573,614,630,755,871,1030,1096,1148,1191,1650,1716,1733]**. The fixed wording of an ordinary native English singleton is generously A/I/O with GP indices [24,10,3].

## Exact inverse for every unknown F branch

Start a state mask at key phase zero. For each original ciphertext glyph C and every current phase t:

1. If C=F/0, a **literal-F bypass** retains t and emits plaintext F.
2. Independently, the consuming branch emits \(P=C-K_t\bmod29\), advancing phase to \((t+1)\bmod14\), **only if \(P\ne0\)**. Otherwise plaintext F would have been required to bypass, so that consuming branch is historically impossible.
3. Deduplicate all reachable key phases after the step. When testing preserved single-letter English words, suppress any branch at those exact source offsets whose plaintext lies outside A/I/O.

This is exact finite-state reachability over every possible original plaintext-F placement. It makes no greedy skip selection, English-frequency approximation, guessed initial key, hidden phase fit or use of an inferred plaintext phrase.

Across **all 841 secret initial pairs**, ignoring the A/I/O grammar completely, the original chapter admits **exactly one ciphertext-legal key**:

| Original exact test | Surviving initial pairs |
|---|---:|
| Full 1,903 original chapter, all F masks, no English assumptions | **1/841** |
| Surviving pair | **[0,0]** (identity) |
| Furthest failure for any of the other 840 pairs | **Chapter-local rune offset 368** |
| Full original chapter with its 18 authentic singleton words restricted to A/I/O | **0/841** |

The 18-singleton conditional test has exact consecutive successful-singleton histogram **[801 at zero, 36 at one, 4 at two, 0 at three through eighteen]**. A maximum pair [0,4] matches the first two then becomes impossible at source-local offset278. The zero key merely copies ciphertext and cannot satisfy the source English singleton constraint. The 840 nonzero-key impossibility requires **no ordinary-English frequency or word** assumptions.

The same cipher-legality test, granting **an entirely independent arbitrary key reset on each original physical page**, gives:

| Physical page | Original runes | All F-mask-feasible pairs (of 841) | Feasible nonzero pairs |
|---:|---:|---:|---:|
| p15 | 159 | 143 | 142 |
| p16 | 267 | 4 | 3 |
| p17 | 273 | 7 | 6 |
| p18 | 260 | 11 | 10 |
| p19 | 271 | 10 | 9 |
| **p20** | **269** | **1** | **0** |
| p21 | 273 | 2 | 1 |
| p22 | 131 | 68 | 67 |

Thus the original physical p20 by itself excludes any **nonzero** straightforward GF29 Fibonacci key, even with its own secret seed, sign, phase and every F-skip path. A zero identity remains a cipher-formally allowed transcription, but supplies no decryption.

## Control and independent execution

The standalone [Node22 CommonJS SFT](../sims/lp2_p15_fibonacci_allsecret_ftransparent_original_sft.cjs) reads both original GP29 source records, reconstructs all original preserved one-rune word offsets, checks every pair and each original page, and asserts the exact survivor counts above. Two 1,903-rune authentic-shape plants use clear original p57 runes as plaintext, substitute A/I/O into all 18 original chapter singleton positions, apply the historical F-skip forward encoder with distinct nonzero hidden Fibonacci seeds **[5,8]** and **[3,17]**, then assert exact full-length inverse-state reachability and **1,903/1,903** forward reconstruction. [Independent Windows Node22 PASS, GitHub Actions 44374311925](https://github.com/FlareZ123/liber-primus/actions/runs/44374311925).

**Decision:** Retire the complete original p15–22 *continuous or independent-page-reset* additive Fibonacci-state keystream with unchanged GP29 rune count and authentic solved-p56 plaintext-F skip as a nontrivial decoder. This is separate from the no-skip all-seed test and the previous source-fixed period14 F-skip test. The source does not order the solver to apply Fibonacci numbers as a key, and no source fixes an inter-symbol rekey, nonlinear transform or changed plaintext representation; those would be different historical hypotheses, not repairs to the excluded direct operator.
