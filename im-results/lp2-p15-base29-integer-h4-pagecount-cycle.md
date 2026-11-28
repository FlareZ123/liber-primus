# Source-visible BASE29 self-index p6–p9 yields M5N7 → p57 → 5N=[g,p]

**Agent21, 28 November 2026. Classification: source-exact structural/navigation candidate with finite manuscript-wide controls. The direct repeating-additive consumers tested here are negative. No unknown LP2 plaintext, authenticated payload key, KDF, or continuation endpoint is recovered.**

## Decision

This branch now has a complete human-observable clue chain with no plaintext grading on the unknown pages:

1. Cicada's authenticated January 2013 TCP specification explicitly demonstrates both `BASE29 3301 -> 3QO` and the DH transcript `p=23, g=5, A=8, B=19, K=2`.
2. The original May 2014 Stage11 onion index literally names the LP2 images `0.jpg` through `57.jpg`, so zero-based physical page numbers were visible to a contemporary solver.
3. Counting original GP runes and writing those counts in the historically selected base29 produces exactly one self-indexing run: `p6=6M, p7=75, p8=8N, p9=97`.
4. Removing each already-matching filename/page digit leaves the literal four-character token **`M5N7`**.
5. The base29 values of that token are `[22,5,23,7]`; their sum is **57**. Among every four-page window p0–p55, p6–p9 is also the only window whose four base29 remainders sum to57 and the only one whose middle pair is `[5,23]`.
6. Physical p57 is the solved **PARABLE** page. Its clear instruction says to shed one's circumference and find what is within. Applying that literal operation to `M5N7` removes the outer symbols and yields **`5N`**.
7. `5N` in base29 is the digit pair **`[5,23]`**, exactly **`[g,p]`** from the authenticated 2013 DH example and the independently reconstructed p15 state.

This is the strongest result of the investigation. It is a **source-exact navigation/state route**, not a body decryption. The route recovers historically authenticated DH parameters from original LP2 page counts through a solved LP2 instruction, without fitting unknown plaintext.

The route can reconstruct more than `(g,p)` without importing p15. Take the source-visible self-index run start as `a=6`; use the p57-shed inner pair as `(g,p)=(5,23)`; and use the canonical outer difference of the shed circumference as `b=22-7=15`. Standard DH then gives:

```
A = 5^6 mod 23 = 8
B = 5^15 mod 23 = 19
K = 8^15 mod 23 = 2
```

Two values are held out locally: `A=8` equals the third physical page in the self-index run, and `K=2` equals the observed right-outer excess `7-5`. Enumerating all **4,032** ordered count choices compatible with only the quotient bins6,7,8,9, then requiring prime `p`, valid `g`, `g^6 mod p = 8`, and the DH shared secret to equal the observed outer excess, leaves **exactly one** candidate: `[22,5,23,7]`, reconstructing `(a,g,p,A,b,B,K)=(6,5,23,8,15,19,2)`.

The same outside-H applied separately to the page-number column `[6,7,8,9]` and remainder column `[22,5,23,7]` gives `[26,28,15,15]` and `[15,11,28,0]`. Across all53 four-page windows, p6–p9 is the **only** window satisfying the three state-free cross-relations `lowH0=highH2`, `lowH2=highH1`, and `lowH3=0`. Their common value `15` is therefore a natural physical-page pointer. On p15, independent source-visible work finds the same DH state; the unique red grid cell is3299 and the newly reconstructed `K=2` gives3301, exactly the authenticated 2013 BASE29 worked input.

The same remainder packet has two additional locked checks. The four digits are `[22,5,23,7]=[p-1,g,p,g+K]` under the already reconstructed state, and canonical outside-H gives `[15,11,28,0]=[b,A^-1,-1,0]`. Conditional on only the four required base29 quotient bins, there are **4,032** ordered count choices and exactly **one** gives that H packet: the actual p6–p9 counts.

A direct steganographic interpretation is closed. The literal uppercase `M5N7` was frozen as the **only** password variant and tested with pinned historical OutGuess0.4 against all58 original LP2 JPEGs. An authentic 2016 Cicada image recovers its known signed payload exactly, while `M5N7` yields 58/58 source-forced 25,903-byte pseudo-extractions with **zero recognizable payloads**; every output is high-entropy and the shared prefix reflects the already established all-one source header. Do not search case variants or nearby passwords.

The earlier p15 full-integer H serializer remains a compatible secondary structure: its four authored q-blocks have digit counts `[8,9,10,11]`, whose page-count dynamics select the p6↔p8 cycle with p7 fixed. That length effect spans nearby radices and therefore does not authenticate base29 by itself.

## P15 integer H4 / BASE29 serializer

The four authored q=4 spiral blocks give:

| block | integer H4 | ordinary BASE29 strings | total base29 digits |
|---|---|---|---:|
| 1 | `[5,2,6594,6593]` | `[5,2,7OB,7OA]` | **8** |
| 2 | `[66,20,6536,6510]` | `[28,K,7MB,7LE]` | **9** |
| 3 | `[680,200,5876,5624]` | `[ND,6Q,6SI,6JR]` | **10** |
| 4 | `[-2696,-498,1914,6336]` | `[-35S,-H5,280,7FE]` | **11** |

The signed strings are ordinary positional base29; the minus sign is metadata rather than a radix digit. For controls, the same routine reproduces `3299=3QM` and the signed-source `3301=3QO`.

Many individual digits can be named by the currently reconstructed DH-like state. For example `ND=[23,13]`, `6Q=[6,26]`, and `280=[2,8,0]`. Those labels are **not the evidence used here**: existing repository work shows that the small reconstructed state algebra saturates much of Z29, so post-hoc state naming is cheap. The discriminating object is the ordered integer/radix geometry and its manuscript-wide page-count consequence.

## Presentation charge

Freeze only the visible p15 spiral values. Charge:

- all **3** perfect pairings of four entries into two difference/sum arms;
- both traversal directions;
- all **16** cyclic starts.

That is **96** presentations. Ask only whether the four q-block BASE29 payload lengths are four consecutive increasing integers.

Exactly two presentations pass:

```
outside pairing, forward, rotation0 -> [8,9,10,11]
adjacent pairing, forward, rotation1 -> [8,9,10,11]
```

The independently authored red origin fixes **rotation0**. Under that source origin, the canonical outside pairing is therefore the sole passing presentation among the three pairings and both directions.

This is a finite post-discovery specificity charge, not a probability that the author intended the mechanism.

## Base29-specific page-count self-index

The original p0–p55 rune counts have a stronger property that does not depend on state naming or plaintext grading. For each page, write

```
rune_count(page) = 29 * quotient + remainder.
```

Exactly four consecutive pages have `quotient = physical page number`, and they are:

| physical page | rune count | base29 | quotient | remainder |
|---:|---:|---|---:|---:|
| **6** | 196 | **6M** | 6 | 22 |
| **7** | 208 | **75** | 7 | 5 |
| **8** | 255 | **8N** | 8 | 23 |
| **9** | 268 | **97** | 9 | 7 |

There are **no other** self-indexing pages at base29 outside this run. The zero origin is source-authenticated rather than a repository convention: the archived original Stage11 index names its carriers `0.jpg` through `57.jpg` in order.

Because each high digit already reproduces the visible filename stem, stripping it leaves:

```
6M -> M
75 -> 5
8N -> N
97 -> 7

M5N7
```

The corresponding digit vector is `[22,5,23,7]`. Its sum is **57**, selecting the solved terminal p57. Across all53 consecutive four-page windows, **only p6–p9** has remainder sum57, and only p6–p9 has middle remainder pair `[5,23]`. P57's clear PARABLE instruction then supplies a literal source operation: shed the outer circumference of `M5N7`, leaving `5N=[5,23]=[g,p]`.

A radix charge over every integer base **2..60** is especially discriminating. Only base29 has a maximum self-indexing run of length four. Bases 13,14,16,24 and 55..60 produce maximum runs of only length two; every other tested radix produces no run of length two or more.

A separate exact fixed-marginal control keeps the complete multiset of the 56 observed page rune counts but randomly reassigns those counts to page positions. Counts fall into base29 quotient bins 6,7,8,9 with multiplicities `[3,7,6,32]`. Therefore the exact probability that four distinct reassigned counts land in the required bins at fixed positions p6,p7,p8,p9 is

```
(3*7*6*32) / (56*55*54*53)
= 0.00045740423098913663
≈ 0.04574%.
```

Summing the fixed-position probabilities for every possible four-page self-index start gives an expected **0.00048055** four-page runs per random reassignment. These values are conditional diagnostics after discovery, not calibrated probabilities of author intent.

The four base29 low digits are `[22,5,23,7]`. Applying the same outside H4 gives

```
H4([22,5,23,7]) mod29 = [15,11,28,0].
```

Those residues have the locked state reading `[b,A^-1,-1,0]`. To charge the retrospective naming, keep only the four required quotient bins6,7,8,9 and enumerate every compatible ordered source-count choice: there are `3*7*6*32=4,032`, and exactly **one** produces H=`[15,11,28,0]` — the observed p6–p9 counts. The stronger evidence is still the source-visible self-index, `M5N7 -> 57 -> p57 -> 5N` route, because it does not require expression-rich state naming.

## The same operation on original page counts

For each physical start page `s=0..52`, define:

```
C_s = [rune_count(s), rune_count(s+1), rune_count(s+2), rune_count(s+3)]
T_s = H4(C_s) over signed integers
F(s) = total number of ordinary BASE29 digits in T_s
       (minus signs do not count as digits)
```

Three consecutive windows are:

| start | page counts | integer H4 | BASE29 | F(start) |
|---:|---|---|---|---:|
| **6** | `[196,208,255,268]` | `[-72,-47,463,464]` | `[-2E,-1I,FS,G0]` | **8** |
| **7** | `[208,255,268,263]` | `[-55,-13,523,471]` | `[-1Q,-D,I1,G7]` | **7** |
| **8** | `[255,268,263,273]` | `[-18,5,531,528]` | `[-I,5,I9,I6]` | **6** |

Exhausting all 53 valid physical p0–p55 starts gives:

- unique nontrivial 2-cycle: **6 ↔ 8**;
- unique fixed point: **7**.

The cycle alone does not distinguish the outside pairing from the cross pairing; the p15 authored-origin staircase above is what selects the canonical outside-H branch. The adjacent pairing has no 6↔8 cycle.

**Radix caveat:** the p15 `[8,9,10,11]` digit-length staircase occurs for bases27..43, and the p6↔p8/p7 page-count motif occurs for bases24..47. Therefore the digit-length dynamics are useful for structural routing only after BASE29 has been selected independently; they do not authenticate radix29. The self-indexing run in the preceding section is the radix-specific result.

## Independent source geometry at the selected pages

The ink annotation corpus supplies a separate holdout. Among unknown physical p0–p55, the red-bearing pages are sparse, and the **only consecutive triple** is:

```
p6, p7, p8
```

That is exactly the `6 ↔ 8` interval plus its fixed point.

The landing page p6 also has **196 original runes**, and

```
196 = 6M (base29) = [6,22].
```

The low digit **22** is unique as `rune_count mod29` among p0–p55. Under the currently reconstructed state it equals `p-1`; the high digit equals the physical page number6 and the historical exponent `a=6`. Again, the uniqueness of the source count is factual; the state labels are interpretation.

These facts make the page-count map more useful as a candidate human navigation mechanism than as another bag of state equalities.

## Direct cipher-consumer gates

The serializer does **not** license arbitrary body-key fitting. Two bounded direct interpretations were tested and rejected.

### Literal M5N7 OutGuess password

The original-carrier audit had left non-default OutGuess open only if an independent clue selected a password. The self-index route now does so without password search: use the exact uppercase token `M5N7`.

The pinned upstream OutGuess0.4 runner first recovers the archived 2016 Cicada signed payload exactly from its authentic positive-control JPEG. It then applies `M5N7` to every original LP2 carrier p0–p57.

All 58 images decode the same source-forced header `75cf2f65`, giving seed53109 and declared length25,903. All 58 produce a 25,903-byte output, but:

- recognizable file/PGP/text flags: **0/58**;
- entropy range: about **7.9916–7.9941 bits/byte**;
- printable-byte fraction: about **0.3778–0.3884**;
- all outputs share the same opening bytes inherited from the common source prefix.

**Decision:** reject literal uppercase `M5N7` as an OutGuess0.4 payload password on the original LP2 carriers. Header consistency is known to be source-forced; do not broaden this negative into case, punctuation, or password variants.

Reproducer: `sims/lp2_base29_selfindex_m5n7_outguess_sft.cjs`. Pinned runner: Actions run **46140839519**, PASS.

### Fixed-width 48-rune p15 keys

Two deterministic 48-rune tapes were constructed:

1. the sixteen original p15 spiral integers as three base29 digits each;
2. the sixteen full-integer H outputs reduced modulo `29^3`, serialized as three base29 digits each.

Phase0 cyclic addition/subtraction was applied to the p15 post-red body and p16. The solved LP1 reference has **782/811 = 96.4%** dictionary-register support under the same native encoding. These candidates produce only isolated short-word accidents and no coherent plaintext.

### The six-digit arm on the exactly tiled p6 body

Concatenate the **second difference coordinate** from each p15 q-block:

```
2 | K | 6Q | -H5
```

Its unsigned base29 digits are:

```
[2,20,6,26,17,5]
```

and preserving the sign of the final integer segment modulo29 gives:

```
[2,20,6,26,12,24].
```

The p6 red span ends at rune offset82. The remaining body is exactly:

```
196 - 82 = 114 = 19 * 6
```

so this is a particularly strong direct receiver: no phase, padding, receiver length, or repeat count needs to be fitted. Test both digit conventions and both global additive signs at phase0.

| key convention | sign | trigram mean | solved-register long words |
|---|---:|---:|---:|
| absolute digits | − | −3.55265 | 0/16 |
| absolute digits | + | −3.63934 | 0/16 |
| signed-segment digits | − | −3.57381 | 0/16 |
| signed-segment digits | + | −3.58932 | 0/16 |

Untouched p6 post-red ciphertext scores **−3.52572**. Solved p57 scores **−2.07669** and has **11/12** long words in the solved-register vocabulary. Every candidate is worse than the ciphertext itself.

**Decision:** reject the phase-zero repeating-additive use of this six-digit BASE29 arm on the exactly tiled p6 post-red body. Do not rescue it by searching phases, resets, alternate segmentation, or tuned signs.

The analogous p15 block keys of lengths 8,9,10,11 were also applied directly to p8,p9,p10,p11 under both additive signs. The long-word support is 0/42, 1/49, 0/50, and 0/46 respectively at best, so the page staircase is not a simple periodic additive key schedule.

## Interpretation and next decision

The strongest supported route is now:

```
authenticated 2013 BASE29 + DH examples
        |
original 2014 filenames 0.jpg ... 57.jpg
        |
original page rune counts
        |
p6=6M, p7=75, p8=8N, p9=97
        |
strip the self-matching page digits
        v
      M5N7
        |
base29 digit/tail sum = 57
        v
solved p57 PARABLE instruction:
shed circumference / find within
        |
        v
       5N
        |
        v
[5,23] = [g,p]
        |
run start a=6; outer difference b=15
        |
standard DH
        v
A=8, B=19, K=2
        |
common H value 15 -> p15
        v
red3299 + K2 = signed-source 3301
```

The route reconstructs the complete authenticated DH state and closes it back onto p15. This is materially stronger than a generic state-label coincidence because each transition is selected by an earlier source object: historical radix, historical zero-based filenames, original rune counts, the solved p57 instruction, standard DH arithmetic, and the independently preserved 2013 protocol.

What remains missing is the **next reversible operation on unknown ciphertext**. The direct periodic additive interpretations and literal `M5N7` OutGuess password are closed; the p57-derived `5N` OutGuess key is separately gated. The next useful experiment should begin from the source-derived ordered DH state or the exact p6–p9 two-column matrix and make a fixed prediction on an untouched original object before any language grading.

The p15 integer-H / page-count length cycle is retained only as secondary corroborating geometry. Its radix-span caveat prevents it from carrying the primary causal claim.

## Reproduction

- Source-visible self-index -> M5N7 -> p57 -> full-DH reconstruction SFT:
  `sims/lp2_base29_selfindex_m5n7_p57_shed_sft.cjs`
- Main serializer / staircase / page-count-cycle SFT:
  `sims/lp2_p15_base29_integer_h4_serializer_sft.cjs`
- Literal M5N7 pinned OutGuess census:
  `sims/lp2_base29_selfindex_m5n7_outguess_sft.cjs`
- P57-derived 5N pinned OutGuess gate:
  `sims/lp2_base29_selfindex_p57_5n_outguess_sft.cjs`
- Exact p6 six-digit consumer rejection:
  `sims/lp2_p15_base29_p6_arm_consumer_sft.cjs`

The reproducers use only committed canonical/historical source material and assert the source-visible zero origin, exact BASE29 self-index, p57 instruction bridge, full DH reconstruction, manuscript-wide controls, and bounded negative consumers.
