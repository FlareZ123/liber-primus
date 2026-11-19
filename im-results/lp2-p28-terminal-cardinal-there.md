# P28 terminal line serializes to `U THERE` under the fixed p56 cardinal map

**Agent42, 19 November 2026. Classification: source-constrained hidden-layout candidate on an independently selected page. The lexical hit was recognized during a fixed serializer scan, so its manuscript uniqueness is descriptive rather than a blind authorship probability. No unknown rune values are decrypted.**

## Fixed operation and page selection

The operation is the same solved-p56 positive-cardinal serializer already used for the p23 hidden-layout route:

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

No parameter is fitted on p28.

P28 now has two independent manuscript selectors that do not consume its candidate plaintext:

- solved p57 `FIND` reaches physical p28 through the established p50 register;
- p23 physical page `p=23` plus its visible five-dot/`g=5` cardinal lands at `p+g=28`, whose page start carries the unique full DH-cardinal vector `[K,g,g+K,g,q]`.

This makes a fixed layout-cardinal check on p28 materially different from an unrestricted manuscript scan.

## Terminal-line readout

Physical p28 has exactly 12 rune-bearing printed lines. Its final line contains five printed words with lengths

```text
[1,2,8,3,8].
```

Applying the fixed serializer gives

```text
1 -> U
2 -> TH
8 -> E
3 -> R
8 -> E

=> UTHERE
=> U | THERE
```

The conservative raw claim is the exact string **`U THERE`**. Interpreting `U` as the homophone “you” is plausible rebus language but is not required by the computation and is not promoted here.

## Exact source controls

Across all 604 rune-bearing printed lines in physical LP2 p0–p57, including the solved p56/p57 controls, the complete vector

```text
[1,2,8,3,8]
```

occurs exactly once: **p28 line12**.

The `THERE` suffix corresponds to the raw four-cardinal vector

```text
[2,8,3,8].
```

Across all **1,566** contiguous four-word windows in those 604 lines, that exact vector also occurs once, as words2–5 of p28 line12.

There are 57 rune-bearing physical page terminals. P28 is the only terminal with the complete `[1,2,8,3,8]` vector.

These counts use source geometry only. They do not search alternative serializers, offsets, cipher signs or rune values.

## THERE is the unique unknown-page terminal self-pointer

The `THERE` suffix also has a typed numerical consequence under the already established p57/p50 register:

```text
GP0(THERE)
= TH + E + R + E
= 2 + 18 + 4 + 18
= 42.

p50[42] = 0S
native base60(0S) = 28
```

This is exactly the same p50 address used by solved-p57 `FIND`, because `GP0(FIND)=42`. The fixed solved-page route therefore reads

```text
FIND  -> address42 -> p28
THERE -> address42 -> p28
```

The hidden terminal word does more than resemble an instruction: under a pre-existing source register it points back to the physical page on which it occurs.

Charge the same rule without language over every unknown physical page p0–p55: take the **last four printed words of the page terminal**, serialize their lengths with fixed T, sum the resulting GP29 values to a p50 address, read the native-base60 byte, and ask whether that byte equals the source physical page. Among every terminal with at least four words, there is exactly one self-pointer:

```text
p28 terminal last four lengths [2,8,3,8]
  T -> THERE
  GP0 -> 42
  p50[42] -> 28.
```

No other unknown-page terminal last-four vector self-addresses its page under this frozen stack. This control is stronger than the bare lexical uniqueness because the acceptance criterion is numerical and language-free.

A wider source-boundary sensitivity check prevents overstating that uniqueness. Charge first/last physical line × first/last four words × forward/reverse order on every unknown page with an eligible boundary. This is 404 configurations. Six configurations self-address numerically: two on p25 and four on p28. P28's hits include the first-line last-four sum42 as well as the terminal THERE sum42, with reversal duplicating each sum. Therefore **the self-pointer is unique only under the terminal-last-four operand rule**, not across every plausible boundary slice. The lexical output THERE is what makes that terminal slice especially suggestive, and that recognition was post-discovery.

Chronology still matters. `THERE` was noticed before this self-pointer census was run, so the self-pointer is a post-discovery cross-operation validation rather than a blind plaintext prediction. The p50 register itself predates this observation and was held out from the cardinal scan.

## Relation to the local p28 evidence

The p28 page already has a separately recovered, post-discovery local marker **HERE** at its first line under the fixed outer-H readout. The terminal cardinal readout supplies **THERE** at the opposite page boundary under a different independently established operation, and THERE independently closes back onto p28 through the solved-p57 p50 pointer register.

That HERE/THERE opposition is structurally suggestive, especially because the center-derived p28 candidate is **READ OUT**. Chronology matters:

- HERE was known before this terminal-cardinal scan;
- THERE was recognized after scanning the fixed T outputs;
- the two operations are different.

Therefore the pair is corroborative route structure, not an independent plaintext probability.

A plausible human-facing picture is now:

```text
source-selected p28
  page start  -> HERE     (outer-H local checkpoint)
  page center -> READ OUT (candidate power-map output)
  page end    -> U THERE  (fixed cardinal serializer)
```

The manuscript does not yet state how those three local markers compose into a general decoder. Do not invent an interpolation cipher, skip pattern, or HERE→THERE key schedule from this geometry alone.

## Next decisive test

The useful next question is whether **one already-authenticated source operation** prospectively links the p28 boundary markers without tuning on their letters. A positive must predict an untouched p28 or other-page object. A negative leaves `U THERE` as a selective hidden-layout echo only.

## Reproduction

- SFT: `sims/lp2_p28_terminal_cardinal_there_sft.cjs`
- P23→p28 source handoff: `im-results/lp2-p23-pg-p28-handoff.md`
- P28 HERE checkpoint: `im-results/lp2-p28-readout-here-page-start.md`
