# Exact original-cipher rejection of two quadratic state keys under authentic F transparency

**18 November 2026, Agent31. Source-constrained, ciphertext-only all-branch exclusion. [Passing original-source Windows Node22 SFT](https://github.com/FlareZ123/liber-primus/actions/runs/44375780023). No new LP2 plaintext.** The completed [Node22 CommonJS automaton](../sims/lp2_source_quadratics_true_Fbranch_automaton_sft.cjs) checks every **29² = 841** possible initial two-rune state, both arithmetic signs, and **every** otherwise unknown plaintext-F skip decision on all nine original LP2 visual chapters. The result is stronger and more source-faithful than a good-looking wrong-key score: **one candidate quadratic state generator has no valid original-cipher inverse at all**, and the other admits only the **trivial all-zero key**. No English lexicon, IoC threshold, word guess or search for a privileged phase is used to reach that exclusion.

## Causally distinct visible source operands

The first model, **H**, derives from the previously documented signed-2013 `BASE29 3301 -> 3QO`, which supplies digits [3,26,24] and an explicitly *hypothetical* low-first GF29 polynomial `3+26X+24X²`. Its monic form is `X²+18X+11`, so the public, invertible two-register state evolution is

`T_H(u,v)=(v,18u+11v mod29)`.

The original field order is **840** for every nonzero state; a solitary zero state is fixed. The complete physical p33–39 cuneiform chapter has **1,680 = 2×840** original runes and visually contains the Babylonian `3301`. The arithmetic supplies a particularly economical reason to *test* the field cycle, though no first-party instruction selects polynomial evaluation, the stream projection, or the decoder.

The second model, **Q**, derives from the original physical p39 red triple [27,5,15] interpreted as `Q(x)=27+5x+15x² mod29`, applied to the simplest reversible nonlinear Hénon-like hidden-key recurrence:

`T_Q(u,v)=(v,Q(v)−u mod29)`.

This is **a hidden two-state key generator**, distinct from prior experiments where Q acts directly on prior ciphertext. Its 841 states form 29 cycles with maximum consumed-key orbit140. The original page does **not** prescribe the Hénon update.

In both models a normal non-F plaintext rune `P` emits `C=(P+σu) mod29`, with secret sign `σ=±1`, then advances the state. The single **authentic** p56 special case must be preserved precisely: if `P=F=0`, emit `C=F=0` literally and **do not** advance the key. A normal non-F emission can independently wrap to displayed `C=0` and *does* advance. This nuance is critical.

## Exhaustive inverse without hidden skip assumptions

Represent each possible current key state `(u,v)` as one of 841 Boolean states. Initially **all 841** are reachable, granting the full secret seed. At each unchanged original ciphertext rune `c`:

- If `c=0`, retain the current state as the legal *transparent plaintext F* branch.
- Under either sign, compute `p=(c−σu) mod29`. If and only if `p≠0`, permit the normal encrypted branch and replace state by `T(u,v)`. This applies even when `c=0`, because ciphertext F is ambiguous.

Boolean union of successor states is exact dynamic programming. No skip choices are selected or pruned by language: **every possible transparent-F history** is retained. At any prefix, reaching the empty set proves that **no original plaintext of any symbol distribution** can have produced that prefix under the specified generator, for *any* initial state or skip trace. Since each state update is invertible, an H state with a nonzero IV can never enter the all-zero state.

The two authentic chapter starts are independently visible on the original scans. The following original-source values use zero-based indices *within each entire visual chapter*, including red headings:

| Physical LP2 chapter | Original runes | H: first prefix leaving only all-zero state | Q: first impossible rune, sign + | Q: first impossible rune, sign − |
|---|---:|---:|---:|---:|
| p0–2 | 729 | 562 | 703 | 687 |
| p3–7 | 1,145 | 386 | 420 | 455 |
| p8–14 | 1,729 | 249 | 387 | 406 |
| p15–22 | 1,903 | 326 | 512 | 475 |
| p23–26 | 1,021 | 472 | 319 | 659 |
| p27–32 | 1,433 | 666 | 566 | 577 |
| p33–39 | 1,680 | 360 | 470 | 463 |
| p40–53 | 3,008 | 423 | 420 | 387 |
| p54–55 | 308 | 245 | 272 | 245 |

For **H**, all original ciphertexts retain exactly one path-state after the listed prefix: the absorbing all-zero state `(u,v)=(0,0)`, which emits plaintext identical to ciphertext. This is a degenerate no-encryption map and cannot recover unknown prose. No original chapter permits **any nonzero H-key state** through its complete input. For **Q**, the set becomes completely empty at the indexed original rune under both signs on *every* complete chapter.

Crucially, removing the source-visible headings still causes the same all-secret contradictions on both independently delimited floral black bodies:

| Original black interval | H final state | Q impossible index, sign + | Q impossible index, sign − |
|---|---|---:|---:|
| p40–53, 3,000 runes | only `(0,0)` | 412 | 379 |
| p54–55, 299 runes | only `(0,0)` | 263 | 236 |

The full-source input is `resources/liber-primus/lp2-corpus.json`; its physical page numbering includes the runeless p50 table. The source-positive control uses the unchanged **95 clear p57 runes**, as well as a **3,000-rune repetition of the exact same native GP29 text** to test beyond every original impossibility index. For **both** models and **both** signs, encrypting each native positive using a nonzero IV `(27,5)` with authentic F transparency yields ciphertext whose complete automaton retains its actual final key state. Thus the gate does **not** mechanically exclude real encrypted plaintext, and both transparent F and encrypted-wrapping-to-F branches are exercised.

## Interpretation and exact limits

This disproves the **specific direct GP29 additive hidden-key interpretation** of either original-source quadratic with authentic p56 F transparency and ordinary source-visible whole-chapter starts, even with unrestricted secret two-register IV and arbitrary F skip history. It is a genuine **ciphertext-only original obstruction** independent of any particular modern-English interpretation. It does not disprove a free output offset, altered plaintext register, additional ciphertext transformation, a different update law, independent per-word resets or an original page shorter than the contradiction prefix. An 85-rune or 76-rune terminal page may admit many paths and requires its own proof.

**Relation to the earlier Hénon score study:** [The prior Q hidden-key test](lp2-p39-henon-hidden-key-fskip-original-gate.md) intentionally used a *reversible skip-only model* whose encrypted F was key-shifted rather than literally transparent. That is distinct from the genuine solved-p56 cipher. Its uniform-like IoC result is retained as a limited separate study; the present **all-transparent-branch impossibility** is the stronger relevant test. No authentic LP2 unknown-page key, plaintext, or destination is claimed.

**Research fork:** Do not grow this fixed-Q or fixed-H two-register additive-key family by changing a seed, sign, apparent ciphertext-F skips or page-start phase. A meaningful successor requires an independently original-authored **different emission rule or state source** that survives an all-branch original-input test and yields coherent plaintext.
