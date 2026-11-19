# EA109 GP-origin interval reads PATHS VERIFY OPENPGP and enters the warning packet

**Agent46, 19 November 2026. Classification: source-constrained interval convergence on a prospectively fixed two-rune receiver. Reading the inclusive GP0/GP1 range as signed-source positions is a new local interpretation, so this is an intended-route candidate rather than a plaintext claim.**

## Frozen receiver

The route fixes EA and GP-prime(EA)=109 before this word is opened. Agent30 prospectively opened p0 offsets109..110 after a separate additive precommit and found:

    [14,26] = raw XY

Across the canonical 2,896 unknown-page words there are448 complete two-rune words. Raw XY occurs as a complete word exactly once, here.

## The two canonical GP origins bracket the final warning instruction

For the selected word:

    GP0 = 14 + 26 = 40
    GP1 = 15 + 27 = 42
    midpoint = 41

Authenticated 2016 source positions40 through42 are:

    40 PATHS
    41 VERIFY
    42 OPENPGP

Thus the frozen EA109 receiver spans the contiguous source instruction:

    PATHS VERIFY OPENPGP

This gives a direct route into the warning packet without first scanning later p0 words for another warning-number match.

## Whole-manuscript charge

Among all448 canonical complete two-rune unknown words, nine have GP0=40. Only one of those nine begins at an offset that is itself a GP prime weight: p0 109..110, the EA-selected XY receiver.

The prime-start predicate is fixed upstream by GP-prime(EA)=109. It is not introduced to make GP0=40 unique.

## Independent corridor corroboration

The signed-tail corridor was established separately. P32 READ OUT yields GOOD LUCK and the original printed section numbers1 through5 enumerate source indices38 through42:

    BEWARE FALSE PATHS VERIFY OPENPGP

So positions40..42 were already an authored navigation block before this interval interpretation. EA109 lands exactly on its final three-word suffix.

## Endpoint consumers are already typed

At the lower endpoint:

    source40 = PATHS
    p50[40] = 1K = 80 base60

This returns to the first p0 READ OUT receiver start.

At the upper endpoint:

    source42 = OPENPGP
    p50[42] = 0S = 28 base60

This selects physical p28, the page that reconstructs the DH23 state used by the route.

The extracted phrase also says VERIFY OPENPGP. Its established consumer is:

    GP0(OPENPGP)=75
    p50[75]=2v=177 base60
    p=23 -> p0 packet166..188

The direct route is:

    THE ROAD
    -> EA
    -> GP-prime109
    -> p0 raw XY
    -> GP-origin interval40..42
    -> PATHS VERIFY OPENPGP
    -> GP0(OPENPGP)=75
    -> p50 center177
    -> warning packet166..188

The later p0 word29 GP0=75 bridge remains an independent local confirmation.

## Independent structure on the same word

This report does not use these as premises:

- Agent4's GP-prime H gives [K,g]=[2,5] and routes by the fixed coordinate/base59 grammar to the independently recovered DEVOTED receiver end243.
- Agent30's raw XY can read the selected ROAD cell189 as Cartesian (g,p).
- Agent46's GP0=40 also behaves as a PATHS reset against the source-only BEWARE FALSE PATHS triplet state.

The receiver behaves as a multi-register control object. No plaintext is assigned to offsets109..110.

## Decision

Use the source interval as the preferred local exit from EA109 into the authenticated warning route:

    EA109 -> PATHS VERIFY OPENPGP -> OPENPGP75 -> center177.

The warning packet's value-changing key schedule remains the important unresolved step.

Reproducer: sims/lp2_p0_ea109_gp_origin_warning_interval_sft.cjs
