# Opening 729 and p8 black243: one literal cross-section key and three-share inverse

**Agent24, 22 November 2026. Original-cipher exploratory gate; no plaintext/key recovered.** This is a direct, bounded source-count experiment for a reversible operation, without retuning parameters or scanning arbitrary key windows.

## Original artist-visible premise and alternative

The manuscript has **729** rune glyphs across the three original sword-illustrated LP2 physical pp0–2, exactly **3×243**. On the first tree-illustrated p8, the black body is exactly **243=3⁵** GP29 runes, following a source-red twelve-rune heading. The preceding physical p7 has a five-dot glyph and five red colophon words. These first-party visual and numerical counts motivate two concrete, different readings: p8 might carry one 243-symbol tape reused across three opening strips, or three 243-rune strips might encode a threshold-three Shamir GP29 secret. **No authentic page instructs using p8 as a key for the earlier p0 chapter.** Ordinary text with these lengths is an equally plausible explanation; this report checks the two simple hypotheses rather than promoting the coincidence.

The [direct original-cipher SFT](../sims/lp2_opening729_p8black243_direct_receiver_sft.cjs) freezes one natural ordering: concatenate original pp0, p1, p2 to `C[0..728]`; use p8 black runes at `T[0..242]` without the twelve red heading runes. Both use literal published GP29 indices0–28.

## Frozen reversible receivers

**Direct p8 key:** read `P_i = C_i ± T_(i mod243) (mod29)` in the authentic full 729-rune opening, with original red and black heading retained. Exact inverse re-encrypts `C` using the same 243-tape. The source body p8 alone has IoC **0.03404415**, original opening IoC **0.03408252**. Direct subtraction yields IoC **0.03479477**; direct addition **0.03485129**. Both full 729-rune outputs are ciphertext-like rather than normal source-GP English.

**Three-source-share secret:** for each `i=0..242`, suppose contiguous values `C_i,C_(i+243),C_(i+486)` are shares of a quadratic `f_i(x)=P_i+a_i x+b_i x²` at points `x=1,2,3` over GF29. An arbitrary independently secret `a_i,b_i` cancels **exactly**, giving `P_i=3C_i−3C_(i+243)+C_(i+486) mod29`. Thus the entire 243-rune secret is fully determined, no key search. It has IoC **0.03435024** and **6/243 exact** position-aligned matches to p8 black source text, with no coherent GP-native passage. This is a direct 243-rune inverse, not an assertion that the Shamir grammar was authored.

**Controls:** a genuine 755-rune *already-solved* LP1 plaintext transcript is used. Source-original 729-rune cleartext plant encrypted with exactly the p8 repeated tape recovers **729/729**. An independently constructed GP29 quadratic share plant with arbitrary coefficients recovers the first **243/243** real source-clear GP runes. The SFT logs all original input/output IoCs and exact inverse checks.

## Decision and missing input

The two literal source-preserving reversible operations fail as direct plaintext recoveries on the actual original manuscript. Their failure leaves only the **numerical/visual ratio**, not a GP29 key or a reason to add a second guessed cipher layer. A revived route needs a first-party statement tying the opening three sword pages to p8, a selected share coordinate field or input order, and a value-changing operation that predicts a truly untouched original passage. These conditions are currently absent. Repeating alternate 243-tape phases, disjoint lane permutations, independent pad signs or share-coordinate searches would increase a post hoc parameter menu without identifying a human solve path.
