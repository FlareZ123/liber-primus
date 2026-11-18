# `WE MUST SHED` resolves the p50 `60 → 59` numeral transition

**Agent48, 18 November 2026. Classification: source-constrained radix-state transition. No unknown LP2 plaintext, creator key, KDF, or complete cipher inverse is recovered.**

## Decision

The strongest current p57/p50 route no longer needs a free choice between base60 and drop-`f` base59.

A source-selected p28 construction produces a DH public value **66** and shared value **87** before either one is interpreted through p50. Cell66 is radix-independent and returns clear p57 **WE**. The solved text continues literally:

`WE MUST SHED`.

At **MUST**, two independent source numbers specify the radix transition:

- `GP-prime(MUST)=186`, so `phi(186)=60`, exactly the printed p50 alphabet size and the already selected twice-shed circumference length;
- `GP0(MUST)=51`, and conventional base60 reads original cell51 `0x` as **59**.

The next clear word is **SHED**. Across all 256 original p50 tokens, lowercase **`f`** is the sole symbol from the 60-character digit alphabet that never appears. Therefore the instruction `MUST: 60 → 59; SHED` has one order-preserving realization that leaves every printed token valid: remove `f`.

Only after that source-selected change does the frozen DH shared value87 decode correctly:

`p50[87]=15 → base59 64 = GP0(SHED)`.

Base60 gives65 instead.

This is a materially stronger explanation of the dual-radix behavior than the earlier missing-`f` observation or post hoc switching between readings. The transition is ordered by the clear text itself.

## 1. Base60 reaches p28 before any switch

Use the established solved-word grammar:

`whole-word GP0 → zero-based p50 address → numeral value`.

The conventional 60-symbol reading gives:

- `CIRCUMFERENCES=131 → p50[131]=20 → 120=PARABLE`;
- `PARABLE=120 → p50[120]=0g → 42=FIND`;
- `FIND=42 → p50[42]=0S → 28`.

Thus physical p28 is reachable without assuming base59.

Physical p28 word28 is independently selected by page number and exact center placement. It is also the final word of original line6, the unique one of all 604 p0–p55 physical rune lines whose first visible fragment is `DH`. Its geometry supplies the manuscript-side DH23 control `p=23, g=5, a=6, B=19, b=15, A=8, K=2`.

## 2. The p28 word supplies a second DH instance and lands on WE

The selected p28 word is:

`[28,24,10,1,20]`.

Shedding its outer circumference leaves:

`[24,10,1]`.

Its GP0 sum is **35**. Clear p57 supplies:

- `GP-prime(FIND)=151`;
- `GP-prime(OUR)=21`;
- `GP-prime(OWN)=55`.

Use the source-visible DH operation family from p28 with:

`p=151, g=35, a=21, b=55`.

The resulting values are:

- public `B = 35^55 mod151 = 66`;
- shared `K = 35^(21×55) mod151 = 87`.

No table radix is involved in deriving 66 or87.

Original cell66 is `0P`, which equals **25** under both base60 and base59. Clear p57 has:

`GP0(WE)=25`.

So the DH output enters the clear phrase at **WE** before any numeral-state choice.

There is an independent cross-DH convergence on the same address. The p28 DH23 state has `A=8`, `K=2`, and p50 visibly has width8, so zero-based row-major coordinate `(A,K)=(8,2)` is also:

`8×8+2 = 66`.

The DH151 public output and the DH23 coordinate therefore converge on the same radix-independent `WE` cell.

## 3. Clear word order specifies the transducer

In p57 the relevant canonical words are:

- word9 **WE**;
- word10 **MUST**;
- word11 **SHED**.

The route has already landed on WE. Following the solved sentence requires no invented opcode:

`WE → MUST → SHED`.

MUST independently names the outgoing and incoming numeral sizes.

First, its Gematria-prime sum is:

`GP-prime(MUST)=186`.

Euler's totient, explicitly sacred elsewhere in Liber Primus, gives:

`phi(186)=60`.

That equals both the full printed p50 digit alphabet length and the 60-cell circumference exposed by the independently derived shared2 shedding depth.

Second, canonical GP0 word addressing gives:

`GP0(MUST)=51`.

Under the still-active base60 reading:

`p50[51]=0x = 59`.

Among all 17 distinct p57 GP0 word addresses, MUST is the only one whose base60 table value is59.

The next clear word is SHED. The source therefore supplies the ordered transition:

`WE → MUST: 60 → 59 → SHED`.

## 4. SHED determines which digit is removed

The full ordered alphabet is:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`.

Every symbol in that 60-character alphabet occurs somewhere in the 256 printed tokens except lowercase `f`.

So after the route has independently produced **59**, the instruction **SHED** has one order-preserving realization compatible with every original token:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`.

Earlier work correctly classified “`f` happens to be absent” as weak evidence by itself. The role is different here. The source-derived value59 fixes the target radix first; the token census merely determines which single digit can be removed without invalidating the artifact.

## 5. Frozen shared87 is a post-switch holdout

The DH151 shared value87 was already fixed before the transition.

Original cell87 is `15`:

- base60: **65**;
- drop-`f` base59: **64**.

Clear p57 has:

`GP0(SHED)=64`.

Thus the newly selected post-SHED state makes a locked value land exactly on the instruction that selected it:

`DH shared87 → p50[87] → base59 64 = SHED`.

The base60 control misses.

This is the most useful discriminator in the route because the radix choice is made before reading cell87.

## 6. Immediate base59 continuation

Keep the selected base59 state.

The same solved-word GP0 grammar gives:

`SHED=64 → p50[64]=22 → 120=PARABLE`.

Then:

`PARABLE=120 → p50[120]=0g → 41`.

The value41 is the **13th prime**, matching the visible red13 object on p57. Under base59:

`p50[41]=1O → 83=EMERGE`.

So the post-switch continuation is:

`SHED → PARABLE → 41 = prime #13 → EMERGE`.

This path never needs to switch back to base60.

## 7. The earlier successor-GP1 observation is auxiliary

The first version of this result used p28's literal next complete word to reach MUST. That step is no longer necessary.

The observation remains unusual:

- p28 word29 is `[24,25]`;
- its length2 equals DH23 shared `K=2`;
- its indices are a forward-consecutive pair;
- its one-based ordinal sum is `25+26=51=MUST`.

The one-based values are also the prime ordinals of the runes' Gematria primes:

`pi(97)+pi(101)=25+26=51`.

Across the 48 page-numbered words with successors, p28 alone has both a forward-consecutive two-rune successor and successor sum51.

There are additional local echoes. The independently selected p27 red-heading successor has GP1=67=`SURFACE`, and selected p39 terminal word `WLYNU` is followed by a word with GP1=83=`EMERGE`.

Prospective holdouts reject a universal successor rule:

- the intermediate selected p39 word `HGREOT` has a following word whose GP1 is39, outside the p57 GP0 vocabulary;
- the terminal p0 THE/WAY receiver at offset117–121 is followed by GP1=17, also outside that vocabulary.

Across all 40 complete words whose GP0 maps to physical p50 under base59, `WLYNU` is the sole occurrence followed by GP1=83=EMERGE. That remains a useful local transition clue, while the failed holdouts mean successor-GP1 must not be treated as a general decoder.

## What changed

The defensible state machine is now:

1. conventional base60 reaches `CIRCUMFERENCES → PARABLE → FIND → 28`;
2. p28 supplies the DH operation and the DH151 state `B=66, K=87`;
3. `66 → WE` under either radix;
4. solved text continues `WE MUST SHED`;
5. `phi(GP-prime(MUST))=60` fixes the current radix;
6. `GP0(MUST)=51 → p50[51]=59` under base60;
7. SHED plus the sole unused digit `f` fixes the new radix59 alphabet;
8. frozen shared87 then decodes to SHED only in base59;
9. the base59 continuation reaches `PARABLE → prime #13 → EMERGE`.

The main unresolved question has moved downstream. The radix transition itself now has a source-constrained causal path. What is still missing is a reversible operation applying the resulting state to unknown ciphertext, or a source-authored exit from the closed p27/p28/p50/p55/p57 navigation network.

## Reproduction

`sims/lp2_p28_successor_must_base59_selector_sft.cjs`
