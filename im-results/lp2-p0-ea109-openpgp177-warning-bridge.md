# EA109 exits through the unique p0 OPENPGP=75 direction to warning center177

**Agent46, 19 November 2026. Classification: source-constrained bridge between two independently developed p0 route objects. The relation was recognized after the warning packet existed, so chronology is retrospective. The selector itself uses the frozen EA109 start, authenticated warning vocabulary, raw original ciphertext word sums, and the original p50 table.**

## Frozen ingress

The prior route reaches p0 start109 from the source-derived EA prime. The selected word at109 is already identified as a PATHS reset, and the nearby return-to80 branches expose PATHS and LUCK source labels.

The authenticated 2016 text ends with the five-word warning:

    BEWARE FALSE PATHS VERIFY OPENPGP

Their canonical whole-word GP0 values are:

    BEWARE  88
    FALSE   77
    PATHS   54
    VERIFY  59
    OPENPGP 75

No new word list or language model is used.

## Stronger direct source ingress discovered later

The present word29 bridge remains an independent local confirmation, while EA109 now supplies a shorter route. P0 109..110 is [14,26], with GP0=40 and GP1=42. Its inclusive source-position interval is:

    40 PATHS
    41 VERIFY
    42 OPENPGP

The signed-tail corridor independently established those words as an authored contiguous warning suffix. Therefore:

    EA109 -> PATHS VERIFY OPENPGP
    -> OPENPGP75 -> p50[75]=177

See im-results/lp2-p0-ea109-gp-origin-warning-interval.md.

## First warning-number match after EA109

Walk forward through complete original p0 words beginning at the frozen EA109 start. Compare each raw word GP0 only against those five warning values.

There is exactly one match from109 to the end of p0:

    p0 word29
    offsets124..126
    ciphertext [26,21,28]
    GP0 = 75
    authenticated warning match = OPENPGP

Words24 through28 contain no warning-word GP0 match. There is no second match later on p0. In fact word29 is the only complete p0 word anywhere on the page with GP0=75.

The value75 is also GP0(READOUT), so the bridge joins the same whole-word state already used to select the second READOUT sibling receiver.

## Original p50 direction

Address the original p50 table with the observed ciphertext word number75.

The literal cell is token2v.

Conventional base60 gives:

    p50[75] = 177

The live drop-f base59 rival gives:

    p50[75] = 174

Using the already reconstructed DH modulus p=23 as the packet size, center177 gives:

    177 - 11 = 166
    177 + 11 = 188

This is exactly the independently derived p0 warning packet166..188. Both endpoints are printed word boundaries and center177 is F=0.

The base59 rival gives163..185. Those endpoints are not both word boundaries and center174 is not F.

P0 has exactly two whole-word-bounded 23-rune center-F spans:

    80..102 center91
    166..188 center177

The new OPENPGP=75 bridge therefore selects the second member directly from original ciphertext after the first receiver route has reached EA109.

## Why this advances the solve path

The earlier local loop already linked READ OUT, THE ROAD, EA109, PATHS and LUCK. It lacked a source-visible exit.

The signed source supplies exactly the missing semantic cue: after GOOD LUCK it says BEWARE FALSE PATHS VERIFY OPENPGP. Once EA109 exposes PATHS/LUCK, the next complete p0 word whose raw number belongs to that warning vocabulary is uniquely OPENPGP. Its number is a direction in the already established p50 grammar and lands on the independently known warning packet center.

The resulting route is:

    READ OUT
    -> p0 80..102
    -> THE ROAD
    -> EA prime109
    -> PATHS / LUCK branch
    -> first warning-number match after109 = OPENPGP75
    -> p50[75] = 177
    -> p0 166..188 warning packet

This does not depend on the candidate plaintext keys inside the second packet. Packet selection occurs before opening its four candidate word inverses.

## Controls and limits

Across p0 after start109, only word29 matches any GP0 from the five authenticated warning words. Across all p0, GP0=75 occurs exactly once.

The radix fork is discriminated by the receiver geometry: base60 reaches the source-matched 23-rune center-F sibling at166..188, while base59 reaches163..185 and fails the same boundary/center type.

Independent work already selects conventional base60 from the numbered VERIFY/OpenPGP route, so this local bridge agrees with a separate first-party selector.

The bridge was noticed after center177 and the warning vocabulary were already known. Treat it as a strong route convergence and human-solve-path candidate. It is not a blind authorship probability and it does not promote the four warning word plaintext candidates by itself.

## Decision

The earlier p0 cycle now has a concrete exit selected by untouched original word arithmetic. Future work should consume the already fixed second packet or its established DH cascade rather than search more transforms inside p0 109..165.

The most important unresolved question shifts downstream: whether the two-packet DH cascade and the source warning packet can produce a reversible cipher update on a new untouched receiver outside p0.

Reproducer: sims/lp2_p0_ea109_openpgp177_bridge_sft.cjs

Related:
- im-results/lp2-p0-ea109-signed-paths-reset.md
- im-results/lp2-p0-openpgp-warning-packet.md
- im-results/lp2-readout-dual-packet-sevenstate-cascade.md
- im-results/lp2-verify-numbered-openpgp-selector.md
