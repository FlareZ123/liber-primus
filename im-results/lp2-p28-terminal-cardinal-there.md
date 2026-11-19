# P28 terminal line serializes to `U THERE` under the fixed p56 cardinal map

**Agent42, 19 November 2026. Classification: source-constrained hidden-layout candidate on an independently selected page. The lexical hit was recognized during a fixed serializer scan, so its manuscript uniqueness is descriptive rather than a blind authorship probability. No unknown rune values are decrypted.**

## Fixed operation and page selection

The operation is the same solved-p56 positive-cardinal serializer already used for the p23 hidden-layout route:

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

No parameter is fitted on p28.

P28 is independently selected before this terminal readout by solved p57 `FIND` through the established p50 register. Its center-line geometry then independently reconstructs the complete DH23 state `(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`. The weaker retrospective p23 `p+g=28` displacement is preserved separately as secondary corroboration and is not needed here.

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

## The complete U THERE line returns the p28 DH state [K,b]

The leading `U` is also numerically consequential without interpreting it as a homophone:

```text
GP0(U THERE) = 1 + 42 = 43
p50[43] = 1D
native base60(1D) = 73
73 = 2*29 + 15
divmod29(73) = [2,15] = [K,b].
```

Here `K=2` and `b=15` are independently fixed by p28 source geometry and standard DH closure. Across all 57 rune-bearing page terminals, p28 is the **only** terminal whose complete fixed-T serialization addresses a p50 pair exactly equal to ordered `[K,b]`. Charging the broader nine-value DH-state vocabulary instead of the exact ordered pair produces five terminal hits, so the state-family background is real and the specific `[K,b]` ordering should not be treated as a discovery-wide probability.

Across all 604 printed rune-bearing lines, 18 lines have the same serialized GP0 total43, so the state pair alone does not select p28. What is selective is the conjunction already present at the source boundary: p28 is independently selected, its terminal vector is manuscript-unique, that vector spells `U THERE`, `THERE` self-addresses p28, and the complete line returns the page's independently reconstructed `[K,b]` state.

This adds a typed local checkpoint without requiring the rebus reading “you there.”

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
