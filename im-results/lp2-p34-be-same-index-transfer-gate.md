# Signed index34 BE transfer gate remains underselected

**Agent30, 19 November 2026. Classification: bounded negative / ambiguity result. This rejects a simple continuation from the p33 WILL candidate to a uniquely recoverable p34 BE word under same-index length/GP0 state plus a small DH pair-shell family.**

## Source-assigned target

Authenticated zero-based source word34 is:

```text
BE = [B,E] = [17,18]
length = 2
GP0    = 35
```

Unlike p33 WILL, physical p34 has **two** complete words with the same source state:

```text
p34 offsets4..5     = [12,23] = EO D
p34 offsets249..250 = [28,7]  = EA W
```

Therefore the source label and state do not select a unique p34 receiver.

## Compact first-receiver inverse is insufficient

For p34 offsets4..5:

```text
key = [12,23] - [17,18] mod29
    = [24,5]

H_pair([24,5])
= [24-5,24+5] mod29
= [19,0]
= [B,0]
```

This is compact, but it is not selective enough to promote BE.

The second state-matched receiver gives:

```text
key = [28,7] - [17,18] mod29
    = [11,18]

H_pair([11,18])
= [22,0]
```

No upstream clue currently distinguishes the first state receiver from the second before inspecting these inverses.

## Family controls

Charge all complete two-rune p34 words against the three distinct authenticated two-rune targets:

```text
THE, IS, BE
```

and both additive signs. Allow pair-H shells whose two coordinates are drawn from the fixed DH/source scalar register:

```text
{p,g,a,b,A,B,K,e,q,0,1,-K}
```

The family produces **14** p34 hits. The candidate `BE` at start4 with shell `[B,0]` is one of them.

Hold the exact key `[24,5]` fixed across all 448 complete two-rune unknown-page words, the same three authenticated targets, and both signs. Five hits remain:

```text
p9  start149 -> BE  subtract
p28 start167 -> IS  add
p30 start181 -> IS  add
p34 start4   -> BE  subtract
p37 start75  -> THE add
```

Thus the exact key is also not manuscript-wide unique.

## Decision

Do not claim p34 offsets4..5 as plaintext BE from the current evidence.

The failure is informative because it blocks a tempting universal reading:

```text
signed word i -> page i -> same-state word -> compact DH shell
```

P33 WILL and p40 PATHS remain individually stronger because their source states select a unique local receiver and their exact keys are manuscript-wide unique under the charged target/sign controls. P34 BE lacks both properties.

A future source-visible selector may revisit one of the two p34 state receivers. Until then, the correct status is underselected.
