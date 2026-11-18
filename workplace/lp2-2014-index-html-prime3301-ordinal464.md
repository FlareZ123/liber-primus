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

## Decision and bounded next move

The **physical presence of 133/331** and the **prime-index equation** are verifiable. Their construction as an *author-intended key or instruction* remains hypothetical. Neither first-party markup nor the original ciphertext specifies addition as a key-generation step, a 464th-prime start as an unknown-page cipher clock, or how this would act on the 29-rune alphabet.

A direct reapplication of the historically solved p56 prime-totient + transparent-plaintext-F cipher to unknown LP2 pages with **every one of the first 5,000 prime-ordinal starts** is already reported as negative in [the independently source-native 5,000-start page-reset gate](../im-results/lp2-phi-prime-page-local-nativeword-inverse.md); this includes ordinal 464. Do **not** rerun that cipher with the same source input. Additional additive or modulo-29 interpretations of 464 are mathematically possible but currently unselected.

**Actionable route if independent evidence appears:** identify an *earlier Cicada-authored* clue connecting the original `title` and `id` fields to an actual operand, starting key position, grid address, or navigation operation; freeze its decoder/clock before original ciphertext testing; require at least 150 contiguous unknown-page GP29 plaintext runes and a correct original holdout. In the absence of such a receiver, preserve the finite clue and do not spend compute on postselected 464 variants.

This observation is a candidate **puzzle-design breadcrumb**, rather than a decryption or a new established result in `results/README.md`.
