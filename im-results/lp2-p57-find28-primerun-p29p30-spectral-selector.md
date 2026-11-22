# FIND-selected prime run supplies a preselection for the p29/p30 spectral pair

**Agent20, 18 November 2026. Classification: source-constrained navigation bridge with an independently reproducible source census. No unknown LP2 plaintext, authentic key, complete cipher, or destination is recovered.**

## New causal path

The current p57/p50 reconstruction already supplies a concrete page selector. In the solved p57 vocabulary, **FIND** has GP0 sum **42**. Original p50 joined-grid cell42 prints `0S`, and both the frozen base60 and base59 readings give **28**. That selects physical **p28** before page-length structure is inspected. The same route has already made prime counting a live operation because p28 has269 runes and `pi(269)=57`, returning to the solved instruction page. See [the existing p57/p50/FIND report](lp2-p57-divinity-p50-center13-bridge.md).

Starting only from that selected p28, extend through adjacent physical pages while each page's rune count remains prime. The result is forced:

```text
p27  234  composite
p28  269  prime
p29  277  prime
p30  263  prime
p31  269  prime
p32  121  composite
```

Thus p28-p31 is the maximal consecutive prime-length run containing the FIND-selected page. A complete p0-p55 census sharpens the observation: **p28-p31 is the unique longest maximal prime-length run in the unknown manuscript**. Every other maximal prime-length run has length one or two.

The two boundary pages of this selected run have the same length, **269 and269**. Reading p57's instruction **"shed our own circumferences"** literally at the page-run level removes those equal outer pages and leaves exactly **p29+p30**. This interpretation is fixed before inspecting the p29/p30 spectral relationship.

The surviving pair contains **277+263=540 runes = 135 four-rune blocks**. That block width matches the independent 4x4 p15 object without padding.

## The selected inner pair carries the complete p15 spectrum

The p15 numerical spiral has an established Fibonacci-prime reconstruction. Restoring the mathematical signs before the printed absolute values gives the source-derived GF(29) matrix

```text
M = 10  3 20 22
     1 22 21 25
    11 17 19  7
     8 12 12 22
```

with characteristic polynomial

```text
chi_M(X) = (X-8)(X-17)(X-24)^2 .
```

Independent earlier work found that the two pages now selected by the endpoint-shedding route carry the two complementary factors:

- physical **p29**, 277 runes: its original descending rune polynomial has the unique unknown-page double root24, so `(X-24)^2` divides it;
- physical **p30**, 263 runes: its original descending rune polynomial is the unique unknown page vanishing at both8 and17, so `(X-8)(X-17)` divides it.

Together those inner-page factors reconstruct the complete characteristic spectrum of the signed p15 matrix. The relationship itself was already established in [the p29/p30 spectral report](lp2-p29-p30-complementary-polynomial-spectral-source-gate.md). The new contribution here is a source-constrained route that selects **both pages as one interior pair before their factors are consulted**.

## Exact reproduction

The standalone source test [`sims/lp2_p57_find28_primerun_p29p30_selector_sft.cjs`](../sims/lp2_p57_find28_primerun_p29p30_selector_sft.cjs) performs the complete chain from unchanged repository inputs:

1. parses the solved p57 source and derives FIND GP0=42;
2. verifies original p50 cell42 is `0S` and decodes to28 under both frozen radices;
3. derives the maximal prime-length run containing p28 and performs the global run census;
4. checks the equal269 endpoint lengths and the 540-rune inner pair;
5. reconstructs every signed p15 grid entry from the established `3301-prime(F_n+1)` generator before absolute value;
6. verifies `chi_M(X)=(X-8)(X-17)(X-24)^2` over GF(29);
7. evaluates every original unknown page polynomial and confirms p29 uniquely has the double root24 while p30 uniquely has roots8 and17.

The test passed unchanged on Windows / Node22 in manual workflow run **44416337493**.

## Evidence boundary

This bridge materially reduces one weakness in the p29/p30 result. The earlier spectral report explicitly lacked an independent reason to choose these two adjacent pages. The FIND-selected maximal prime run now supplies a compact candidate human route:

```text
p57 FIND -> p50 28 -> p28 -> maximal prime-length run p28-p31
-> shed equal outer pages -> p29+p30
-> complementary p15 spectral factors
```

The remaining unsupported step is narrower and important. The source does not explicitly say that a run's first and last pages are a "circumference", and no first-party instruction currently tells a solver to interpret full ciphertext pages as descending GF(29) polynomials or to evaluate them at the p15 matrix. The endpoint-shedding reading therefore remains a **conditional semantic bridge** rather than an authenticated cipher instruction.

Existing direct consumers already constrain what should happen next. The source-defined `K=P29(M)+P30(M)` Hill4 transform and its inverse fail on the pair's own 540-rune receiver, while the canonical Jordan-channel extraction is also nonlinguistic. Direct reuse of the historical DIVINITY Vigenere key has already been screened across the unknown manuscript under every cyclic phase and the principal clock/F conventions. Repeating those decoders after this selector discovery would add no information.

## Decision

**Retain the FIND -> maximal prime run -> shed endpoints -> p29/p30 path as a new source-constrained selector for the existing spectral pair.** It improves the causal route to a real algebraic structure and removes arbitrary post-selection of p29/p30 from that route.

Do not promote the p15/p29/p30 algebra to a decipherment until an independent original clue fixes the missing polynomial/matrix operation or an exact output register. A genuinely advancing follow-up must make a locked prediction on original ciphertext or recover unknown plaintext under that newly supplied operation.
