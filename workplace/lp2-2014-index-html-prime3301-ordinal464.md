# Candidate original delivery-page clue: 133 + 331 = the prime ordinal of 3301

**18 November 2026, Agent15. Status: source-observed arithmetic; cipher significance unresolved.** No unknown LP2 plaintext, authentic key, original-cipher inverse or destination is claimed here.

## Historical input and one preselected reading

The archived May 2014 Stage11 Liber Primus distribution page contains two separate, unusually terse numerical HTML attributes:

```html
<html>
<head><title>133</title></head>
<body>
<div id="331">
```

Original archive: [`stage11/ky2khlqdf7qdznac.onion/index.html`](https://github.com/micheloosterhof/cicada-2014/blob/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/index.html). The local [2014 source comparison](../im-results/lp2-2014-html133-red119-crosslink.md) already identifies the title and ID, the original static ordering of all 58 image references, and the absence of a documented consuming script or link. This note adds **one distinct numeric relationship** between those independently printed source fields and the recurring first-party puzzle number 3301.

Take the two *literal source values* and add them:

```text
133 + 331 = 464
prime(464) = 3301            (one-based prime ordinal)
primepi(3301) = 464
464 = 16 × 29
```

The 29-symbol GP alphabet gives the last factorization an obvious thematic association, though it supplies no operation. The more specific fact is that 3301, the Cicada identifier and a known prime, is exactly the **464th prime**. Thus the pair of different reversed three-digit values appearing in the 2014 delivery-page markup encodes the index of 3301 using a two-number addition.

Among properly three-digit digit-reversal pairs `n, reverse3(n)` whose sum is 464, the only possibilities are `133 + 331`, `331 + 133`, and the trivial palindrome `232 + 232`. To see this, let `n=100h+10t+u` with `h,u≥1`; then `n+reverse3(n)=101(h+u)+20t=464`. The only decimal `t` with a divisible remainder is `t=3`, forcing `h+u=4`. This describes the exact arithmetic rather than evidence that the author selected it intentionally.

## Independent physical p0 crosslink, with a clear caveat

The **actual two initial red words on original LP2 p0** contain 8 and 5 runes, with independently inventoried GP-prime sums **347** and **315** ([original-image and source arithmetic](../im-results/p0-dh23-red-heading-exchange.md)). Their arithmetic mean is precisely **331**:

```text
(347 + 315) / 2 = 331       (the archived delivery-page container ID)
347 - 315 = 32             (the number of rows in the p49–51 numeric table)
```

This second, physically printed two-word source route reaches the delivery-page `id="331"` without using the `title` value. The table's independently visible **32 rows** supplies a further geometric correspondence. Because this red pair and table shape were known independently before the HTML-prime-index observation, they make 331 a candidate *cross-artifact signpost* worth communicating, but the **mean** and **difference** operations were selected retrospectively; they are not proof of author intent, a decrypting key or a causal direction for reading the table. The earlier full [p0 red-pair/table arithmetic gate](../im-results/p0-dh23-red-heading-exchange.md) and the [row27 direct DES receiver test](../sims/lp2_p0_row27_des8_source_sft.cjs) produced no plaintext and must not be repeated as if new.

## Frozen original-input consumer: prime-field exponentiation fails as a byte decoder

For a human who encounters the `133` (HTML title) and `331` (HTML ID) separately, a concrete historically familiar reading would be field exponentiation modulo the prime **331** by **133**. Since `gcd(133,330)=1`, the inverse exponent is **67**: `133·67≡1 (mod 330)`. The p49–51 original 32×8 numerical table is a naturally available **256-byte typed receiver** if its two-character tokens are read in conventional base60. Freeze this one recipient and test both exact inverse directions on the unchanged 256 source bytes.

- `x → x^133 mod 331`: **49/256** results exceed 255, and only **83/256** fall within printable ASCII.
- `x → x^67 mod 331`: **56/256** results exceed 255, and only **78/256** fall within printable ASCII.
- Both field directions **exactly reconstruct all 256 input values** when reversed with the complementary exponent. This checks mathematical implementation only; no plaintext or original byte payload is recovered. Reducing outputs modulo256 would destroy the proven inverse and is not supplied by any source.

The [read-only single-file original-input CommonJS SFT](../sims/lp2_html133331_mod331_original_sft.cjs) uses the original registered table and planted field positives; it passed [Windows Node22 manual CI run 44250316122](https://github.com/FlareZ123/liber-primus/actions/runs/44250316122). The result **rejects only this literal 133/331 prime-field-to-byte consumer**, leaving the candidate historical ordinal breadcrumb and any independently selected alternative cipher semantics unproven.

## Fixed four-source-value 2×2 Hill receiver: exact original inverse, no English

The newly observed crosslink provides a second concrete typed GP29 operation. Arrange the original p0 first two red-word prime sums as the first row and the two archived HTML values in printed `title`, `id` order as the second row:

```text
M = [[347,315],[133,331]] mod29 = [[28,25],[17,12]]
det(M) = 27 mod29
M^(-1) = [[23,27],[23,15]] mod29
```

This has four literal source operands and an invertible determinant without searching or guessing secret letters. The **Hill2 choice and arrangement are hypotheses**, as the puzzle does not direct a matrix layout. I froze both ordinary encipher/decipher orientations and applied the resulting full inverse to the untouched original ciphertext, discarding the initial red rubric where appropriate, with exact forward reconstruction:

| Original source region | Ciphertext GP29 runes | Source IoC | Hill inverse IoC | Opposite-direction IoC |
| --- | ---: | ---: | ---: | ---: |
| p0–2 after 13-rune heading | 716 | 0.034102 | **0.034309** | 0.034668 |
| p40–53 after 8-rune rubric | 3,000 | 0.034544 | **0.034472** | 0.034740 |
| p55 terminal complete | 76 | 0.037895 | **0.040351** | 0.039649 |

The independently authentic **94-rune clear p57 positive** has GP29 IoC **0.060856** and round-trips losslessly after encryption with the same matrix. The original candidate decodes are uniformly nonlinguistic; the p0–2 first 40 GP letters begin `AHULWLWFFCYPJIFDEMXDCPEOIADEACRHORONIBOEBYMAE`. No plaintext, key beyond the explicitly source-constructed trial matrix, or unexplained new language signal follows.

[Standalone reproducible Windows CommonJS test](../sims/lp2_html133331_redword_hill2_original_sft.cjs) · [Windows Node22 PASS run 44251007204](https://github.com/FlareZ123/liber-primus/actions/runs/44251007204).

This eliminates this *specific* source-paired Hill2 cipher receiver over intact GP29 rune tape, while retaining the independently printed numbers and prime-index arithmetic as unselected clues.

## Newly identified prime-count table-pointer convergence (Agent28, 18 November 2026)

A literal, *conditional* graph walk now connects the two archived source numbers to **one of the two original printed `00` table cells**. This is a narrower, new navigation hypothesis than the earlier direct additive, Hill2, or prime-totient cipher trials. The historical markup names two numbers and the source already calls primes sacred, but **neither the markup nor the original page explicitly instructs `primepi` or iterative byte-as-address lookup**. These operations are investigator-selected. No unknown plaintext, source-authenticated key, decoder or final destination follows.

Treat the physical LP2 p49–51 table as the 256 row-major, zero-indexed cells in its existing **provisional radix-60 byte interpretation**, `g[i]`. The original 2014 distributor's title and ID provide two independent inputs:

```text
archived title 133 → primepi(133) = 32   (the original table has 32 rows)
archived id    331 → primepi(331) = 67
                          g[67] = 192   (literal cell 67: "3C")
                         g[192] =   0   (literal cell 192: "00", row24 col0)
title count 32 → g[32] = 115 → g[115] = 247 → g[247] = 192 → 0
```

Thus **both prime-count starts reach the same perimeter zero at cell192**, the original `00` nearest the table's outer edge. The other original `00` is cell229 (row28 col5, interior); it has not been selected by this rule. The two `00` addresses were independently identified previously in [the original moth/table source alignment](lp2-moth-pair-256-table-56word-map.md). The `3C` glyph at index67 is visibly present in original 2400×3600 `66.jpg` (p49, printed ninth row, fourth column) and agrees with the registered numeral data. The title/ID also satisfy `133+331=464=primepi(3301)=16×29` as established above; the original p0 first two red-word GP-prime sums 347/315 center on331 and differ by32. This makes the **prime-count-to-32-row mapping** a coherent additional source arithmetic relationship, though it cannot establish authorship.

The table's byte-to-address map contains an 11-node cycle
`192→0→203→68→199→47→76→114→197→115→247→192`,
with **252 of 256** starting cell addresses eventually reaching this cycle; only the four-address component `9,158,227,249` does not. Consequently *eventual* convergence to 192 is intrinsically weak evidence. The more specific short routes above deserve preserving as a candidate operational selector, but they were noticed after inspecting original graph structure: the exact joint event is postselected and cannot carry an unadjusted authorship probability. Under the competing **base-59** numeric reading, `3C = 3×59+12 = 189`, so even the shortest pointer link to192 disappears. The source does not resolve that radix ambiguity.

**Research decision:** keep this as a *single source-anchored potential choice of outer `00`*, not as an established cipher fact. The existing 180/76 moth/register and zero-anchor GP29 direct consumers failed; rerunning them with a retroactively preferred outer start would duplicate that work. A genuine advance needs an independent 2014/2016 clue that commands **prime counting followed by a table lookup** or provides a reversible, word-aware cipher consumer that produces original-page plaintext. The [read-only source-gate reproducer](../sims/lp2_2014_html133331_p50_primepointer_sft.cjs) asserts all exact pointers, original red-word arithmetic, graph components and the radix qualification.

## Decision and bounded next move

The **physical presence of 133/331** and the **prime-index equation** are verifiable. Their construction as an *author-intended key or instruction* remains hypothetical. Neither first-party markup nor the original ciphertext specifies addition as a key-generation step, a 464th-prime start as an unknown-page cipher clock, or how this would act on the 29-rune alphabet.

A direct reapplication of the historically solved p56 prime-totient + transparent-plaintext-F cipher to unknown LP2 pages with **every one of the first 5,000 prime-ordinal starts** is already reported as negative in [the independently source-native 5,000-start page-reset gate](../im-results/lp2-phi-prime-page-local-nativeword-inverse.md); this includes ordinal 464. Do **not** rerun that cipher with the same source input. Additional additive or modulo-29 interpretations of 464 remain unselected. The newly observed 133/331 prime-count table-pointer routes converge on original outer 00 cell192 under radix60, but prime-count lookup and table-as-address dereferencing remain equally unselected. Neither supplies a plaintext receiver.

**Actionable route if independent evidence appears:** identify an *earlier Cicada-authored* clue connecting the original `title` and `id` fields to an actual operand, starting key position, grid address, or navigation operation; freeze its decoder/clock before original ciphertext testing; require at least 150 contiguous unknown-page GP29 plaintext runes and a correct original holdout. In the absence of such a receiver, preserve the finite clue and do not spend compute on postselected 464 variants.

This observation is a candidate **puzzle-design breadcrumb**, rather than a decryption or a new established result in `results/README.md`.
