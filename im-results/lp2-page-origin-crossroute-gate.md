# LP2 page-origin cross-route gate

## Question

Can the newer p24–p26 mayfly/Fibonacci pointer and the existing signed-2016 source/page handoffs be stated under one consistent number-origin convention?

This is a **route-consistency gate**, not a new plaintext claim. It compares already-reported operations without changing their arithmetic.

## Reproduction

Run:

```text
sims/lp2_p28_fibonacci_onebased_source_bridge_sft.cjs
```

CI run: `46126198839`.

The SFT independently rebuilds the signed-2016 word list and canonical page words, reproduces the p28 `READOUT` transform and its held-out `THE` packet, and checks the complete eligible two-rune signed-word family.

## Established inputs reproduced by the gate

The original p24–p26 runic counts are `270,273,265`. Their absolute pairwise differences are `3,5,8`; with the separately source-adjudicated local frame `13`, the four terms sum to `29`. The mayfly report interprets this as the **29th LP2 page**, i.e. project page `p28`.

On project `p28`, the already-established exponent split at offsets 134–139 yields `READOUT`. Under the existing +6 signed-source rise predictor, the next two ciphertext runes at offsets 140–141 are exactly the predicted `THE` packet `[24,25]`.

Across the complete eligible two-rune signed-word family, only the same two source/page hits survive:

- one-based signed word **29 = THE** -> physical page **29** / project `p28`, offset 140;
- one-based signed word **35 = BE** -> physical page **35** / project `p34`, offset 4.

The immediate one-based follower of word 29 is word **30 = DIRECTION**. Mapping the ordinal literally gives physical page 30 / project `p29`; canonical word 30 there is `[11,26,11,18]`, whose canonical H4 serialization is `[22,15,8,0]`, reproducing the previously reported p29 direction packet.

## Cross-route origin conflict

The p28/mayfly route is naturally ordinal at its new independent pointer:

```text
29th LP2 page -> project p28
```

The promoted p33 THEIR-RISE handoff uses body rises `[1,7,34]` as **zero-based** signed-word labels:

```text
signed[1], signed[7], signed[34] = THE, THE, BE
34 -> project p34
```

If those same rises are instead read one-based, they select:

```text
word 1, word 7, word 34 = HELLO, SEEKS, WILL
34 -> physical page 34 / project p33
```

Conversely, reading the mayfly pointer `29` as a zero-based project-page index sends it to `p29`, not the independently selected `p28`.

Therefore a **single global number-to-page/source-word origin convention cannot justify both routes unchanged**. The arithmetic hits themselves remain reproducible; what is not yet justified is a convention switch between the mayfly/READ-OUT route and the p33 THEIR-RISE route.

## Consequence

The p28 `READ OUT THE` -> one-based word 29 `THE` -> follower word 30 `DIRECTION` -> physical page 30/project `p29` chain can now be stated without zero-based signed-word dereferencing.

The p33 body-rise `[1,7,34]` -> `THE,THE,BE` -> `p34` handoff remains a conditional route that specifically requires zero-based indexing. Until an independent clue licenses that origin change, it should not be stacked with the ordinal mayfly pointer as though both were consequences of one global indexing rule.

No new LP2 plaintext is claimed here.
