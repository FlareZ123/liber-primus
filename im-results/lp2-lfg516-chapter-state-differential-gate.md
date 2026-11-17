# LP2 chapter-local LFG(5,16) difference-autokey: rejected

**Status:** intermediate negative result; not a recovered plaintext or established cipher.

## Hypothesis and human solve-path rationale

The candidate was deliberately kept small and source-constrained:

1. The p15 4×4 Fibonacci-prime spiral supplies 16 initial values; its infinity mark plausibly invites continuation.
2. The repeated five-dot motif on p7, p23 and solved p56 is a possible lag-5 selector.
3. The solved p56 page establishes the prime-totient operation, so the primary seed is φ(p) mod 29.
4. The 29-symbol Gematria Primus alphabet supplies the modulus.
5. The nine printed chapter divisions supply state-reset points. Ordinary page breaks do not reset the state; this is necessary to preserve the 32 words carried across physical page boundaries.

These are clues that could motivate an LFG(5,16) experiment, not proof that Cicada intended it. The source does **not** explicitly specify the lagged-Fibonacci recurrence or the difference-autokey equation.

## Frozen mechanism

Let the 16 p15 seed primes, in the spiral order already reconstructed by sims/fibonacci_prime_spiral.cjs, be:

    2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817

The primary initial state is their totients modulo 29:

    1, 2, 4, 6, 12, 22, 13, 20, 3, 1, 27, 16, 1, 11, 11, 15

Within each chapter:

\[
S_n=(S_{n-5}+S_{n-16})\bmod29
\]

and

\[
C_i=(C_{i-1}+P_i-S_i)\bmod29,\qquad C_{-1}=0.
\]

The inverse is:

\[
P_i=(S_i+C_i-C_{i-1})\bmod29.
\]

The state and zero accumulator restart at the nine source chapter boundaries (rune lengths 729/1145/1729/1903/1021/1433/1680/3008/308). Rune punctuation is copied verbatim and does not consume state. State continues over line wraps, page breaks and the 32 carried words.

The key/state budget is fully explicit: 16 seed symbols (77.7 bits of state, but all source-derived), two fixed recurrence taps (5 and 16), modulus 29, fixed chapter resets, and one sign choice. The solved p56 operation motivates the totient seed and positive-sign equation. There is no per-position secret table or fitted parameter. The raw-prime seed and opposite recurrence/cipher signs were retained only as a small, predeclared source-plausible diagnostic.

## Exact event predictions

The rule makes adjacent equality state-dependent rather than assigning it to one fixed plaintext rune:

\[
C_i=C_{i-1}\iff P_i=S_i.
\]

The reproduction script lists every one of the 86 original within-page doublet sites and verifies that each decodes to the current state symbol.

For a fifth-back equality:

\[
C_i-C_{i-5}
=\sum_{k=i-4}^{i}(P_k-S_k)\pmod{29}.
\]

Thus each of the 104 within-word fifth-back equalities is a five-step zero-sum event. The script lists all 104 sites and verifies the identity. This is an algebraic accounting of the observed events, **not** an independent prediction that the LFG state will produce 104 such events in natural plaintext.

## Reproduction and results

Run:

    node sims/lp2_lfg516_chapter_state_differential_sft.cjs

The script checks the original 12,956-rune LP2 stream against the canonical corpus; the nine chapter lengths; all 86 adjacent doublets; all 104 within-word fifth-back equalities; all 2,896 printed words; and all 32 cross-page words.

It also runs a planted positive with all 29 runes on the exact original printed layout. The positive must recover all 12,956 runes, preserve all 4,254 non-rune punctuation/layout characters, and retain all 32 cross-page words. This validates the implementation and layout handling, not the historical hypothesis.

The primary totient-seed inverse gives whole-book IoC **0.034486**, against the random 29-symbol baseline **1/29 = 0.034483**. Its first two chapter IoCs are **0.034369** and **0.034318**. The first 150 decoded runes of chapter 1 begin:

    TAXLSGNGOEEEOMMXHLIWWYEAHTNPFBEIIANFNGTHMAEXTHCEFIAEOIASCEORTHJRCREOAXNGOEAOOEATHTHTHTHIAFOMAEBJTPOICTIAGHIRAIOCRUTHOOFXTEAOENMHNGHEOYLTAUAERCOAEEAFXDWJJCEWTNEYTUPEGDFJOEONNALEATJEAOETHYOIA

Chapter 2 begins:

    NGOECTHAEGICEOTOXAMAEWIUGMEOETHBYHAEUFEAOETHTHNODNEABIATUIEAPPSMAEOETRJNGGUWBFMPUJHJCMDSIYNGIADIHEAOENGWIUNGXOESEOOEPTLTAEAOPRUWCNFIAHHINAUTNGBMNNGNDSEAEATCBTXWXOJEYETHCOBXWHTIPOBLGPSAM

Neither yields coherent plaintext.

The raw-prime wrong-key control has chapter-2 IoC **0.034611**, slightly *higher* than the primary source-derived key's 0.034318. The eight source-plausible prime/totient and sign variants all remain near the random baseline. None recovers 150 coherent plaintext runes in the blind chapter. Every variant re-encrypts the original ciphertext exactly, as required for a reversible implementation; exact reconstruction alone is not evidence of decryption.

## Decision

**Retire this exact LFG(5,16) difference-autokey mechanism.** Its source clues can motivate the test, and its state equation accounts for the observed equality sites, but the untouched chapters remain random-looking and the source does not uniquely select the cipher equation. Do not rescue it by tuning seeds, adding reset points, or fitting state tables.

This does not reject every possible nonstationary cipher. It establishes that the specific p15-seeded LFG(5,16) difference-autokey route does not recover LP2 plaintext. No change to results/README.md is warranted: this is a negative intermediate result, not an established discovery.

## Related evidence

- sims/fibonacci_prime_spiral.cjs — p15 Fibonacci-prime reconstruction and exact 16-value seed.
- im-results/lp2-five-dot-three-page-art-and-phi-transfer.md — five-dot source motif and p56 comparison.
- sims/lp2_pagecarry_wordprime_Fclock_original_sft.cjs — canonical 32 cross-page-word parser and source-layout handling.
- im-results/lp2-ninechapter-predecessor-sbox-original-capacity.md — predecessor-state capacity gate; this test does not enlarge that grammar.
- GitHub Issues [#1215](https://github.com/FlareZ123/liber-primus/issues/1215) and [#1364](https://github.com/FlareZ123/liber-primus/issues/1364) — prior synthesis and chapter architecture reviewed before this test.
