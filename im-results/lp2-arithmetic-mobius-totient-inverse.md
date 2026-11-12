# Literal arithmetic Möbius and totient inverses on original LP2 (Agent 10, 12 November 2026)

## Decision

Two directly executable number-theoretic inverses yield **no unknown Liber Primus plaintext** from either the original 256-number table or the complete 12,956-rune unsolved book. This is a closed, finite candidate test. The original clue does **not** explicitly prescribe these inverses.

Original LP2 has a repeatedly drawn Möbius-like/infinity mark on pp0–2 and p15; the **solved earlier book** explicitly says the totient function is sacred. The marks may instead denote geometric Möbius transformations or mere decoration. Here we deliberately test the distinct arithmetic interpretation of Möbius inversion, and the literal totient-weighted Dirichlet convolution. A human might try these familiar reversible arithmetic operations on a numbered 256-cell table or the rune sequence. Neither source independently authorizes applying divisor arithmetic to the table, choosing GF(29), or using a book-continuous position index.

## Frozen source inputs and algorithms

- Original LP2 pp49–51: the printed **32×8 numeric table**, parsed as 256 row-major conventional base60 bytes (the base60 hypothesis is explicitly conditional), then reduced modulo 29, indexed from 1 to 256.
- Original unknown LP2 pp0–55: the **entire 12,956-rune** source-ordered GP29 cipher stream, including physical page transitions, indexed from 1 to 12,956, without page/paragraph/key resets.
- Kernel `1` (arithmetic Möbius inversion): given `B(n) = Σ[d|n] A(d)`, solve uniquely for `A(n) = B(n) − Σ[d|n,d<n] A(d) (mod 29)`.
- Kernel `φ` (literal totient Dirichlet inversion): given `B(n) = Σ[d|n] φ(n/d) A(d)`, solve for `A(n) = B(n) − Σ[d|n,d<n] φ(n/d) A(d) (mod 29)`.

Both are unique triangular inverses since their coefficient at 1 is 1. The [exact CJS reproducer](../sims/lp2_arithmetic_mobius_totient_inverse_sft.cjs) executes both forward and inverse on complete source registers, asserts re-encryption of every original symbol and round-trips an **85-rune native GP plaintext control (85/85 for both kernels)**. No rotations, seed searches, symbol relabeling, F exception, choice of read direction or case-specific exception were introduced.

## Original-input observations

| Source register | IoC as printed | Doublets as printed | Möbius-inverse IoC | Möbius-inverse doublets | φ-inverse IoC | φ-inverse doublets |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Original pp49–51 table, 256 bytes mod29 | 0.037163 | 13 | 0.034099 | 5 | 0.034406 | 11 |
| Unknown pp0–55, 12,956 original runes | 0.034478 | 86 | 0.034479 | 477 | 0.034471 | 451 |

The initial 200 GP transliteration characters of both original-stream inverses are nonlinguistic. For example the Möbius result starts `SOEOALHEOYYIAOWMJTHGIPAEUTHIATLEONTHIAFEOYRFEOLDLGDETHDEONNXYAER`, and the φ result starts `SOEBNRSAOWMPAEABENBYTHEONGOLONGEAHEAUIAYWEUOEABNLFYAGEOPTEPJ`. The numerical-grid inverses also remain ciphertext-like (first 80 GP characters: Möbius `FEAOEPIPIYEOHJUSAGFCJSOEOJUPEOIDHCHAEHADOYAEHNROEREAIGLAEEJTLOEE`; totient `FEAOEPIXIIAMJJASFBECUSEOHLUTJNGOLCTAEBENIAEAEAEPJOEYEAIAFEO`).

The original long-stream adjacent-repeat count 86 rises to 477 or 451 after the inverses, near the naive 1-in-29 collision scale, while the unigram index of coincidence remains random-like. **The doublet change alone is not a positive cipher signal**: a broad invertible mixing transform can erase an input adjacency anomaly without recovering language.

## Result and next decision

Reject **these two exact unkeyed, source-order arithmetic inverse models** as direct plaintext recovery routes for the original LP2 grid or complete unknown rune stream. The test does not exclude arithmetic Möbius transforms on other source-selected registers or nontrivial keyed, reset, geometric, or steganographic schemes. Revisit only with an independent original clue fixing a different input, transform, or reading order. No key, plaintext, instruction or destination was recovered.
