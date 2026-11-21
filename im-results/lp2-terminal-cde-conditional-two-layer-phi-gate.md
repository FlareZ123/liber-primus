# Terminal 1C/1D/1E navigation: conditional two-layer prime-totient cipher exclusion

**Status:** Original-source, reproducible, finite model rejection. No unknown LP2 plaintext, key or destination recovered.

## Clue and narrowly defined hypothesis

The original January 2016 PGP-signed instruction refers to Liber Primus's words, meanings and numbers as its map, road and direction. Literal GP29 zero-based rune values give **DIRECTION = 98**. The unchanged 32×8 original LP2 table has **cell 98 = `1C` = 72** under its source-attested base60 alphabet, pointing to original `72.jpg`, physical **p55**. An optional IO→IA spelling gives **112**, where cell112 is **`1D` = 73**, the genuinely solved p56. Independently, p57 PARABLE's third-clause GP-prime sum 1229 has ordinary prime ordinal **201**, where cell201 is **`1E` = 74**, the clear p57. These navigation equalities were reported by [Agent22](lp2-red15-direction-parable-pagewayfinding-conditional.md); the two distinct numeric conventions and optional IO spelling remain explicit assumptions.

The consecutive terminal labels `1C`, `1D`, `1E` suggest one bounded cipher-depth interpretation: the p55 object might carry **two layers**, solved p56 **one layer**, and clear p57 **zero layers** of the single historically demonstrated GP29 prime-totient operation. This is a **new candidate chosen for testing, not a first-party statement**. It supplies an exact historical reversible operator, a fixed starting prime, and an executable whole-page prediction. Unlike a free key search, it has no fitted parameters.

## Exact source-original test

The authentic solved-p56 encoder uses prime sequence 2,3,5,... and the per-key GP29 additive offset `phi(prime) mod 29`, with **plaintext F (GP zero) emitted literally** and consuming no prime. A ciphertext F can also be produced by an encrypted non-F rune; both legal inverse histories must be retained.

The candidate applies this identical encoder **twice** with two separate prime clocks, **each starting at prime 2**, to 76 original p55 runes. For exact inversion, each state records how many primes its inner and outer layers have consumed. At each original ciphertext rune, the algorithm retains every lawful plaintext-F bypass and every non-F key-consuming branch, merging histories with identical clock counts. No dictionary, fitted key, beam cutoff or guessed unknown plaintext enters the test.

**Results:**

- **Authentic original positive:** the original 85-rune p56 plaintext re-encrypts to the unchanged original p56 ciphertext exactly, including its F-bypass rule.
- **Two-layer native positive:** encrypting the first 76 clear original p57 GP runes twice yields a 76-rune plant whose exact inverse survives to the end, with 33 possible final clock-count states.
- **Original p55 target:** all possible inverse states are eliminated at **zero-based rune offset 39 (the 40th rune)**. The preceding 39-rune prefix has exactly one surviving clock-count state. Consequently, **no legal 76-rune p55 plaintext exists under this complete two-layer mode**.

The source table-cell assertions, original p56 positive, native GP double plant and original p55 failure are all implemented in [the read-only CommonJS SFT](../sims/lp2_terminal_cde_double_phi_sft.cjs). A first native Windows Node22 run of the cipher gate passed ([44958550193](https://github.com/FlareZ123/liber-primus/actions/runs/44958550193)); the source-cell assertions were added immediately afterward and are separately checkable.

## Cryptanalytic decision

The literal **two-fold p56-prime cipher**, with both clocks starting at the authentic first prime and respecting all legal F skips, cannot explain p55. This excludes that **particular** 2/1/0 terminal-depth interpretation. The CDE tokens are not an author-specified cipher-layer rule; their navigational reading itself joins two source-derived conventions. Other cipher layers, keys, clock starts and geometries remain logically possible, but a new source-selected operation is required before varying them. The demonstrated p55 tree navigation should remain a possible image-level clue rather than a recovered decoder.

The stronger outstanding requirement is still the same: an authentic source operation must recover a complete p55 inverse while accounting for its 43 strict interior and 33 exterior runes, and must predict plaintext beyond a fitted local fragment.
