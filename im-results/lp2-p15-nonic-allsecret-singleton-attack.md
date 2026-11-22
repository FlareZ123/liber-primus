# All-secret p15–22 original GP29 source-factor key recovery from single-rune words

**Agent 12, 13 November 2026. Decision:** Under a word-boundary-preserving conventional GP-English plaintext assumption, **all 72 complete source-factor LFSR stream / reversible nonzero-step escape models fail** on the unchanged p15–22 ciphertext, with **every secret initial key state allowed**. The finite test examines **205,137 complete seed candidates** compatible with the first d one-rune words. No previously unknown LP2 plaintext, historical key or creator-selected mechanism is recovered.

## Human-facing source leads

The original physical LP2 p15 begins a chapter with exactly **nine red runes**. The original pp49–51 numerical table contains **256 base60 entries** in a 32×8 rectangle. Interpreting the authentic 256-byte table as a GF29 polynomial gives independently established small monic factors:

\[
L(X)=X+5,\quad
Q(X)=X^2+18X+11,\quad
U(X)=X^3+14X^2+16X+24,
\]
\[
N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11.
\]

The factorization is exactly \(28L^2QUNR_{238}\) over GF29, with the remaining factor irreducible of degree238. A nine-state recurrence could therefore be selected by the nine-rune red heading and a polynomial extracted directly from another LP2 page. The source supplies 12 distinct monic divisors of total degree 1–9 from the four factors above: N; U; Q; QU; L; LU; LQ; LQU; L²; L²U; L²Q; and L²QU. The program confirms that **each exact factor divides the unmodified original grid polynomial**. No original Cicada instruction explicitly prescribes using this polynomial, combining the two pages or treating the nine red runes as a linear-state clue. This remains a source-motivated test of a possible cipher architecture.

The original p15–22 chapter contains **1,903 GP29 runes**. Leave its first nine red runes untouched. The remaining **1,894 runes** include **18 complete printed one-rune words**, with original word boundaries restored across page wraps. Their zero-based positions within the body are

    126,171,269,394,530,536,564,605,621,746,862,1021,1087,1139,1182,1641,1707,1724.

For conventional GP-runified English, a full one-rune word is **A, I, or O** (indices 24,10,3); the vocative/archaic O is deliberately allowed. This assumption excludes independent abbreviations, authorial nonsense one-rune terms, ciphertext-inserted word boundaries, changed punctuation, an outer transposition or a non-English plaintext register. Those are genuine scope limits.

## An exhaustive unknown-key method

Fix a monic degree-d source factor. It defines one GF29 recurrence, with arbitrary d-rune initial state. Its monic reciprocal defines the opposite source-natural sequence direction. For each of the two, the program expresses the hidden key at all 18 actual one-rune-word positions as a linear form in the d entirely unknown starting runes. It selects the lexicographically first **d linearly independent original word positions**, avoiding a rank-deficient initial prefix that occurs in one five-state/skip-repeat model. All 18 observed word rows have full rank for every model.

For a direct additive cipher, \(C_i=P_i+K_i\bmod29\), each of these first d cribs admits only three possible hidden values. Every one of the **3^d assignments** gives precisely one seed by invertible modular Gaussian elimination. Then the remaining **18−d original singleton words are fully held out** and must also be A/I/O. This tests every one of the \(29^d\) possible unknown states that could possibly meet the first d plaintext constraints. The arbitrary initial state absorbs phase and additive sign freedom for an invertible recurrence.

The second tested cipher is a **fully reversible nonzero-step alphabet**, which can structurally explain the original suppression of adjacent equal ciphertext runes. Let g=15, a primitive root modulo29. For plaintext \(P_i\) in 0–27, emit

\[
C_i=C_{i-1}+15^{(P_i+K_t)\bmod28}\pmod{29}.
\]

For the twenty-ninth GP symbol EA (index28), emit \(C_i=C_{i-1}\). The effective exponent uses the GF29 stream value modulo28, but a zero exponent key may arise from **either original secret-state value 0 or 28**. All such aliases are exhaustively included in the seed candidates. The cipher is lossless, with the exact inverse given by the discrete log of each nonzero step. Two clocks are tested: advance the stream every rune, or skip the stream advance when the source gives an adjacent repeat/EA escape. The 1,894 unchanged original runes have exactly **10 escape positions** under this proposed reading, none coinciding with any of the 18 original one-rune words. The treatment of repeats as EA is **hypothetical**; the ciphertext observations themselves are real.

Thus each polynomial direction has exactly three fully specified cipher/clock variants: additive, exponent-every, exponent-skip. There are **12 source-derived factors × two polynomial directions × three models = 72 direct original-cipher tests**. Every original-compatible secret state in each is covered, with no language model search or optimized phase.

## Original-cipher outcomes

**Across all 72 models:** **zero** allowed secret states satisfy all 18 printed original one-rune words. There are **205,137** distinct per-model source-compatible secret-state candidates tested in aggregate. Rejected models include the full degree-nine N and all of its lower-degree source alternatives, including product factors and repeated-root choices. The full inventory with the selected independent word positions and smallest held-out error is printed by the [single-file all-factor reproducer](../sims/lp2_p15_allsmallfactor_allsecret_crib_sft.cjs).

The nine-state N examples are especially pertinent to the nine red original glyphs:

| Source-nonic cipher and clock | All source-compatible secret states | Full 18-word survivors | Minimum held-out errors |
| --- | ---: | ---: | ---: |
| GF29 additive, forward N | 19,683 | **0** | 4 |
| GF29 additive, reciprocal N | 19,683 | **0** | 3 |
| GP28 exponent/EA, forward N, every rune | 34,992 | **0** | 3 |
| GP28 exponent/EA, forward N, skip repeat | 34,992 | **0** | 3 |
| GP28 exponent/EA, reciprocal N, every rune | 34,992 | **0** | 2 |
| GP28 exponent/EA, reciprocal N, skip repeat | 34,992 | **0** | 3 |

The **strongest model** according to residual word errors still fails two of the nine unseen original singletons. A GP-language fitness model is unnecessary for these six direct exclusions. The other 66 source-factor models likewise have no full source-compatible key; the test does not claim a universal cryptanalytic impossibility beyond the specified families.

## Planted key and plaintext recovery

An independent GP-native synthetic control is constructed for **every one of the 72 source-factor and cipher/clock models**, using the genuinely solved p57 GP text as 1,894-rune material and inserting A/I/O at the 18 original printed-singleton positions. The exponent/escape controls deliberately retain exactly the ten source-position escape events and eliminate unintended additional EA occurrences, so both clocks use their authentic source-shaped branches. Each plant is encrypted under a preselected unknown d-rune initial state. The same exhaustive singleton-only attack must recover that exact hidden state; the independently defined inverse then recovers the full **1,894/1,894** runes, and the forward encoder reconstitutes every ciphertext symbol.

**All 72 original-source negatives and all 72 positive seed/plaintext recoveries passed** in the manually dispatched [GitHub Actions run 43345379151](https://github.com/FlareZ123/liber-primus/actions/runs/43345379151), Node.js22. The prior [narrow nine-state SFT](../sims/lp2_p15_nonic_singleton_allseed_sft.cjs) independently passed in [run 43344146586](https://github.com/FlareZ123/liber-primus/actions/runs/43344146586). Both scripts use unchanged original corpus GP indices and word breaks, verify the printed table SHA256 and factor, and use no network calls or generated input files.

## Research decision

Do not invest additional secret-seed, sign, phase or recurrence-direction searches in these **72 explicit source-factor models**. Their incompatibility with the 18 manuscript singleton positions is exact under the declared ordinary-word premise. The key-recovery method itself remains useful: if independent source evidence later selects a different d-state **linear** reversible cipher, original short words can recover its entire hidden state directly without brute forcing \(29^d\) keys.

There is still no original instruction selecting a general LP2 cipher, no recovered unknown-page GP plaintext, and no resolved deep-web continuation. Investigate a genuinely different author-selected operation, independently sourced key material or representation of printed word boundaries. Evidence from other 2014 stages would be needed to justify reopening this source-factor family.
