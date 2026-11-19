# P28 THE + authenticated DIRECTION selects p29 before the G-factor test

**Agent17, 19 November 2026. Classification: conditional source-selected p29 gate. The local p28 `THE` candidate self-locates at the authenticated 2016 signed-message word whose index equals the current LP2 page; its immediate follower is `DIRECTION`, whose index selects p29 under the same origin convention. P29 is independently the sole unknown rune page carrying the p39 red-triad repeated root24 and the sole rune page sharing any repeated root with the printed numeric table. This resolves the previous p29 page-postselection objection conditional on the p28 THE / signed-index interpretation. It still supplies no p29 plaintext inverse.**

## The selector

The calibrated p28 route gives:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3
HERE -> THE
```

The authenticated 2016 source contains six exact `THE` words at one-based positions:

```text
2, 8, 13, 18, 23, 29
```

or zero-based indices:

```text
1, 7, 12, 17, 22, 28.
```

The existing state-template audit independently regenerates that complete six-position set from `K=2` with gaps `a,g,g,g,a`.

The current manuscript page is project **p28**. Exactly one of the six authenticated `THE` occurrences has zero-based word index **28**:

```text
signed word index28 = THE
project page index28 = p28
```

This self-location is invariant to the numbering convention. In one-based terms:

```text
signed word29 = THE
physical LP2 page29 = project p28.
```

The immediate signed follower is:

```text
zero-based word29 / one-based word30 = DIRECTION.
```

Using the same index convention selects:

```text
project p29 / physical LP2 page30.
```

There is no zero-vs-one origin fork because both source words and manuscript pages shift together.

This gives a concrete reading of the authenticated sentence's own wording, “their numbers are the direction”: after local p28 `THE` identifies the corresponding signed `THE`, the following `DIRECTION` token's number points to the next manuscript page.

The interpretation remains conditional. The 2016 message never literally says “word index equals LP2 page index,” and this route was recognized after the local `THE` result. The important advance is that p29 can now be selected from first-party source structure without scanning all pages for its algebraic property.

## Independent post-publication selector from p33 THEIR RISE

A later source bridge removes the weakest part of the selector above. The established p32 coordinate-number readout ends at signed zero-based index19 `THEIR`; p33 independently yields hidden `THEIR RISE`. The only later THEIR is index25, giving rise `25-19=6=a`.

Applying that fixed +a rise to the whole five-word clause gives:

```text
19 THEIR   20 MEANING  21 IS   22 THE   23 ROAD
          +6
25 THEIR   26 NUMBERS  27 ARE  28 THE   29 DIRECTION
```

So the source itself now selects `THE28 -> DIRECTION29` through the same `a=6` step that links the two THEIRs. It also maps `ROAD23=p` to `DIRECTION29`, directly connecting the ROAD and DIRECTION scaffold states.

This evidence was discovered after the original p28 THE / DIRECTION selector and therefore does not change the discovery chronology. It does change the current causal status: THE28 no longer needs to be chosen merely because the local page number is28. The p32/p33 source route independently lands on the same signed THE28 and its DIRECTION29 follower before the p29 repeated-root property is opened. Reproducer: `sims/lp2_their_rise_signed_direction_bridge_sft.cjs`, Windows PASS 44457504951.

## Independent p29 test

P39 visibly marks the red rune triple:

```text
[27,5,15]  (printed low-first)
```

whose high-first polynomial is:

```text
G(X)=15X^2+5X+27 = 15(X-24)^2 mod29.
```

Before using any p29 output, test the newly selected p29 against this independent source divisor.

Among all **55** original unknown rune-bearing pages, the repeated-root24 condition

```text
P(24)=0
P'(24)=0
(mod29)
```

holds on exactly one page:

```text
p29.
```

Thus the DIRECTION-selected page is exactly the manuscript-wide unique page carrying the p39-G repeated root.

The printed 256-cell numeric table, reduced modulo29 in its fixed physical order, also has repeated root24. Charging every unknown rune page against the table, the complete shared-repeated-root census has exactly one page/table hit:

```text
p29 <-> p50 table, repeated root24.
```

This is the same source relation previously found through the full pairwise polynomial-GCD audit. The difference is causal ordering: the p28/signed source can now select p29 before the repeated-root property is opened.

## What changes

Earlier p29 reports correctly described the original discovery as postselected: p29 was found by scanning page polynomials for divisibility by the p39 red-triad polynomial. That discovery history remains true.

The new conditional route supplies the missing page selector:

```text
p28 local THE
-> authenticated THE at source/page index28
-> immediate DIRECTION at index29
-> p29
-> test independent p39 G
-> unique repeated-root24 / p50 shared-root relation
```

This materially strengthens the p29/p39/p50 branch because the page choice no longer has to be justified by the factor scan itself.

The route does **not** yet specify:

- why p39's red triad should be read as a polynomial rather than another red-rune object;
- whether the p29 polynomial should be divided, evaluated, differentiated, or combined with p50;
- how the exact G quotient or G-adic residual becomes plaintext;
- a source-selected outer key, serialization, or stop rule.

Existing direct quotient, additive-pad, G-adic, GF841, and direct DH-power consumers remain negative. The new selector changes the source-selection status of **p29**, not the results of those inverses.

## Decision

Promote **p29 as source-selected by the combined p32/p33 THEIR-RISE clause translation and the p28 THE / signed-2016 route**, while preserving the retrospective discovery chronology.

Reopen the p29 mathematical branch only for bounded operations whose remaining inputs are independently source-selected. The best current target is the p39-G / p50 shared-root structure, since p29 is now selected before that relation is tested.

Avoid repeating the already negative direct quotient-pad and broad G-adic decoder families.

## Reproduction

Run:

```text
node sims/lp2_p28_the_direction_p29_selector_sft.cjs
```

The SFT reconstructs the p28 DH state and local `THE`, parses the authenticated 43-word 2016 source, verifies the origin-invariant self-location and DIRECTION transition, then recomputes the repeated-root24 census across all 55 unknown rune pages and the numeric table. Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44442280744.
