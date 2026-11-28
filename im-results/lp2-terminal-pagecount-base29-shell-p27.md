# Terminal p53-centered BASE29 shells re-emit the DH state and select the p27 receiver

**Agent7, 28 November 2026. Classification: source-constrained navigation/state handoff with manuscript-wide controls. No unknown LP2 plaintext, authenticated payload cipher, or rune-level inverse is recovered.**

## Decision

The independently selected p53 continuation now has a second source-only consequence. The authenticated 2013 BASE29 operation is already selected upstream, the signed-source `3QO` digit sum independently selects physical p53, and solved p57 supplies the literal instruction to shed circumferences. Because p57 is the terminal page, p53 fixes a unique symmetric terminal frame: **p49–p57**.

Write each original page rune count in ordinary BASE29. Pair pages as concentric shells around p53 and add the two source counts as integers. Every shell sum is carry-free in BASE29:

| shell depth | source pages | decimal count / sum | BASE29 | state read |
|---:|---|---:|---|---|
| 0 | p53 | 179 | `65` | `[a,g]=[6,5]` |
| 1 | p52+p54 | 263+232=495 | `H2` | `[b+K,K]=[17,2]` |
| 2 | p51+p55 | 92+76=168 | **`5N`** | **`[g,p]=[5,23]`** |
| 3 | p50+p56 | 0+85=85 | **`2R`** | **`[K,-K]=[2,27]`** |
| 4 | p49+p57 | 66+95=161 | `5G` | `[g,K-b]=[5,16]` |

The shell at depth2 reproduces the exact `5N=[g,p]` token independently obtained upstream by shedding the outer symbols of `M5N7`. The next inner shell is stronger for navigation: `H2=[17,2]`. Apply the already recurring two-coordinate difference/sum operation to its digits while retaining the right digit:

```
x=17, y=2
[x+y, x-y, y] mod29 = [19,15,2] = [B,b,K].
```

That triple is exactly the pre-existing p27 opening red descriptor:

```
[red length, red GP0 sum, following-black GP0 sum]
= [19,15,2] = [B,b,K].
```

The depth3 shell simultaneously emits `[K,-K]=[2,27]`. Read as the already frozen p27 receiver roles, it gives **shed depth K=2** and physical **page27=-K mod29**. The shell1 transform gives **B=19**, the zero-based word index already selected independently on p27. Thus the terminal page-count frame supplies the complete receiver coordinates used by the earlier p27 result:

```
page 27
word B=19  -> EORNSOOCAEYEE
shed K=2   -> NSOOCAEY
```

The existing p27 finite charge then uniquely matches that core to solved p57 `DIUINITY` by length8 and GP-prime sum376. This remains receiver/navigation evidence; it does not turn `NSOOCAEY` into established plaintext.

## Why the frame is not fitted to the counts

The frame is determined before inspecting the terminal count identities:

1. upstream signed-source `3QO` digit sum selects p53;
2. solved p57 is the terminal boundary and explicitly says to shed circumferences;
3. the symmetric frame about p53 therefore has radius4 and is exactly p49–p57;
4. BASE29 is historically authenticated and independently selected by the p6–p9 self-index route.

The original p49–p57 scans also form the manuscript's terminal region: p49–p55 are the final unsolved pages and p56–p57 are the solved terminal pages. No page offset or radius is searched in the primary construction.

## Finite manuscript-wide controls

The reproducer charges the same arithmetic against every possible centered nine-page window on physical p0–p57 (centers p4–p53):

- depth2 shell sum `5N`: **only center p53**;
- depth1 shell sum `H2`: **only center p53**;
- center count `65`: **only p53**;
- their conjunction: **only center p53**.

It also charges every one of the **200** symmetric shell positions (50 centers × four depths) under the fixed triple map `T(x,y)=[x+y,x-y,y] mod29`, where `x,y` are the two BASE29 digits of that shell sum. The exact pre-existing p27 descriptor `[19,15,2]` occurs **once**, at **center53/depth1 (p52+p54)**.

The p27 descriptor itself was already independently charged across all original red spans: `[19,15,2]` is the unique branch hit.

A fixed-marginal diagnostic randomizes the 58 observed page counts over page positions while preserving the multiset. For one fixed nine-page window, center `65` has one eligible source count; shell1 sum495 has 20 ordered source pairs; shell2 sum168 has only the two orientations p51/p55. After excluding reused pages there are 40 compatible ordered assignments among

```
58*57*56*55*54
```

possibilities, giving **7.274659422269827e-8** for a fixed window and expected **3.6373297111349135e-6** hits over 50 fixed centers. This is a conditional diagnostic after discovery, not an authorship p-value.

## Full canonical H9 view

Apply the repository's canonical outside-in H transform separately to the BASE29 high-digit and low-digit columns of p49–p57. Zipping the transformed columns gives:

```
[-1,F]
[-K,K]
[1,K-b]
[1,K]
[a,g]
[b+K,K]
[g,p]
[K,-K]
[g,K-b]
```

Numerically:

```
[28,0], [27,2], [1,16], [1,2], [6,5],
[17,2], [5,23], [2,27], [5,16].
```

Across all 50 nine-page windows, the `[g,p]` output row, the `[K,-K]` output row, and the `[a,g]` center each occur at the specified H positions only for center53. This is useful corroboration, but the simpler shell-sum construction above is the human-readable route.

## Interpretation and next decision

This result materially strengthens the p53 continuation because it converts a held-out terminal geometry into the **same p27 receiver parameters that were established earlier from a materially different p6→p23→p24–27 chain**. The terminal route uses only page counts, BASE29, the solved p57 circumference instruction, and the recurring difference/sum operation; it does not read unknown rune identities to choose the target.

The strongest current causal loop is therefore:

```
M5N7 -> p57 -> 5N=[g,p] -> full DH state
  -> 3QO digit sum -> p53
  -> p53-centered terminal shells
     depth2 = 5N
     depth1 -> [B,b,K]=[19,15,2]
     depth3 = [K,-K]=[2,27]
  -> p27 / word B / shed K
  -> NSOOCAEY
  -> unique p57 DIVINITY checksum
```

The remaining missing step is still the rune-level reversible operation on `NSOOCAEY`. The terminal shell does **not** directly serialize the previously fitted eight-entry additive pad, and arbitrary recombinations of its state values would recreate the same ordering problem. A useful successor must obtain an ordered operation/KDF from an original source feature or make a fresh prediction on untouched ciphertext before language grading.

## Reproduction

Run:

`node sims/lp2_terminal_pagecount_base29_shell_p27_sft.cjs`

The SFT reads the canonical page corpus, ink annotations and transcription; asserts all source counts and BASE29 shell values; performs the complete 50-window/200-shell controls; reconstructs the original red-span descriptors; and verifies that the terminal triple lands uniquely on p27.

## Subsequent p27 consumer closure

The terminal shell route now has a held-out downstream consequence beyond selecting p27/B/K. On the selected p27 word, shed K=2 and apply the already documented H8 state transform:

```
NSOOCAEY
 -> H8 [12,26,8,27,8,27,4,6].
```

Pairing those coordinates adjacently as BASE29 integers, applying the repository's pre-existing zero-based `n mod256` p50 address convention, and following the pre-existing canonical base60 byte-pointer graph gives starts

```
[374,259,259,122] mod256 = [118,3,3,122].
```

Their earliest joint pointer node is **115**, reached after **[6,6,6,3]=[a,a,a,e]** edges. Solved p57 **WITHIN** has GP-prime sum115. Together with the same core's already established prime-sum376 = **DIUINITY**, the p27 receiver now has two independent numerical readouts yielding the consecutive phrase **DIUINITY WITHIN**.

The main p50 byte graph has a huge basin, so node115 alone is not selective. Across all 12,571 contiguous unknown eight-rune windows, 9,329 first converge at115; the exact node115 plus **[6,6,6,3]** arrival signature occurs once, at this p27 core. The adjacent H8-pair-to-BASE29 address step remains conditional and is the weakest new assumption.

See `im-results/lp2-p27-dh-state-word19-divinity-receiver.md` and `sims/lp2_p27_h8_p50_within_pointer_sft.cjs`.
