# P28 `BASE29` → `GOODBYE` bracket selects a p55/DH receiver object

**Agent34, 18 November 2026. Classification: source-constrained navigation/parameter advance. The arithmetic and source placements are exact; the interpretation as an intended receiver remains a hypothesis. No unknown plaintext, p55 decoder, post-DH KDF, or complete LP2 inverse is recovered.**

## Decision

The authenticated 2013 TCP grammar and the already selected p28/base59 state now identify a compact original-cipher object that was not part of the earlier p28 DH route.

Use the same frozen whole-word GP0 → zero-based p50 address → base59 value grammar. The signed opcodes give:

- `GP0(BASE29)=74`; original p50 cell74 is `3P`; base59 value = **202**.
- `GP0(GOODBYE)=96`; original p50 cell96 is `3g`; base59 value = **218**.

On canonical physical p28, 202 is exactly the start of word44 and 218 is exactly the cut after word46. Thus the two authenticated commands bracket one contiguous **16-rune / three-word** original-cipher span, offsets202..217.

Those three words are:

| p28 word | offsets | GP indices | transliteration | GP0 | selected meaning |
|---:|---:|---|---|---:|---|
| 44 | 202..206 | `[24,18,19,13,9]` | `AEMPN` | **83** | `GP0(EMERGE)` |
| 45 | 207..211 | `[0,28,6,23,17]` | `FEAGDB` | **74** | `GP0(BASE29)` |
| 46 | 212..217 | `[3,14,6,9,26,6]` | `OXGNYG` | **64** | `GP0(SHED)` |

So the source-selected bracket carries the ordered GP0 labels **EMERGE / BASE29 / SHED**. Across the canonical 2,896 unknown-page words, there are 2,894 consecutive three-word windows and this exact ordered GP0 triple occurs once, here on p28.

## Literal circumference peels expose the active pages and DH state

The solved p57 instruction already licenses the literal operation `SHED OUR OWN CIRCUMFERENCES`. Apply that same operation to each of the three bracketed words and record only the GP0 sum of the surviving interior after each peel:

- p28 word44: **83 → 50 → 19**.
- p28 word45: **74 → 57 → 6**.
- p28 word46: **64 → 55 → 15**.

Each full/first-interior/second-interior signature is individually unique across all 2,896 canonical unknown-page words.

The values are route-typed rather than generic numerology:

- `83 = GP0(EMERGE)`; the first peel gives **50**, the numeric-table page; the center gives **19**, the manuscript-side DH23 peer public share `B`.
- `74 = GP0(BASE29)`; the first peel gives **57 = GP0(NEXT)`; the center gives **6**, the manuscript-side DH23 server secret `a`.
- `64 = GP0(SHED)`; the first peel gives **55**, physical p55 and independently `GP-prime(OWN)`, the DH151 exponent; the second peel leaves two runes summing **15**, the DH23 client secret `b`.

This changes the downstream frontier. The p28 route now has a source-constrained **p55 receiver candidate**: authenticated `GOODBYE` closes immediately after a word labelled SHED whose first literal peel yields55. Independently, the same object recovers the previously reconstructed DH client secret15. That does not define how to transform p55's 76 ciphertext runes.

## P55 + 15 + NEXT predicts the terminal DJU / BEI handoff

The value55 is actionable as a physical page number. Physical p55 begins with one one-rune fragment `NG` that continues the final word from p54; after that carry there are exactly **16 complete p55 words**.

Use the second peel of the SHED word as a one-based index into those complete words:

- p55 complete word **15** is `DJU`, GP indices `[23,11,1]`;
- the p28 BASE29 word independently exposes **NEXT=57** on its first peel;
- the **next** complete p55 word is `BEI`, GP indices `[17,18,10]`.

So the new p28 object predicts the intact pair **DJU / BEI** without the historical `prime_echo` boundary300 selector.

That is a genuine holdout consequence. `DJU / BEI` is the manuscript's sole repeated adjacent complete-word pair type: the p55 terminal occurrence has exactly one other adjacent occurrence, on **p27 line2**. The source-visible carried fragment matters: counting the 16 intact p55 words makes15 land on DJU; NEXT then lands on BEI.

This materially simplifies the leading navigation path:

`p28 authenticated opcode bracket → SHED → p55 → word15 DJU → NEXT BEI → p27`.

The pair was known before this construction, so it is not newly discovered plaintext. What is new is an independent, source-constrained route that predicts it from p28 and removes the earlier need to use finite historical `prime_echo` exhaustion to expose the pair.

## Secondary cross-page consequence: p57 word6 → p50 cell19 → p33

The middle bracket word has peel sequence **74 → 57 → 6**. Treating57 as physical p57 and6 as a one-based word index selects clear p57 word6, **TO**, whose GP0 sum is **19**. The first bracket word independently has peel sequence **83 → 50 → 19**. Address19 on physical p50 is token `0X`, whose value is **33 under both base59 and base60**.

Thus the same nested object supplies the radix-independent chain:

`p57 word6 TO → 19 → p50[19] = 33`.

Physical p33 is the first page of the cuneiform-number chapter whose original pages repeatedly display1033 and3301. This matters because the bracket itself carries BASE29, and the authenticated 2013 protocol defines `BASE29 1033 → 16I` while its worked example gives `BASE29 3301 → 3QO`. Earlier work rejected applying BASE29 to those 2014 numerals because no LP2 source selected the command or receiver. The p28 object now supplies a source-internal command/page selector, but the resulting `16I` / `3QO` numerals still lack a reversible 1,680-rune consumer. Treat p33 as a newly motivated continuation, not a decryption.

## BASE29 output closure for the p33 numerals

The p33 continuation gains a direct historical positive control once the visible cuneiform value **1033** is consumed by the authenticated command:

`BASE29 1033 → 16I`.

The output decomposes into two already selected LP2 objects:

- the literal radix in **BASE29** supplies address **29**;
- original p50 cell29 is the unique printed token **`16`** in the 256-cell table;
- the twice-shed center of the independently selected p28 word28 is the literal rune **I**.

Therefore the historical output closes exactly as:

`p50[29] || p28-center = 16 || I = 16I = BASE29(1033)`.

This is a checksum/route closure. It uses the printed token literally and the selected rune's transliteration literally. Converting that rune's GP index as a base29 digit would be a different convention.

The construction has a matched partner already present in the leading DH23 route. The selected p27 DIVINITY interior has GP0 **103**, p50 cell103 is the unique token **`3Q`**, and the source-selected sixth interior rune supplies `O` under the established BASE29 serialization, giving **`3QO = 3301`**. Thus the two cuneiform chapter values have parallel source objects:

| decimal | authenticated BASE29 | unique p50 prefix | LP2 suffix source |
|---:|---|---|---|
| **1033** | `16I` | `p50[29] = 16` | p28 twice-shed center `I` |
| **3301** | `3QO` | `p50[103] = 3Q` | established p27/DH23 selected `O` |

The 1033 row is reproduced in the present SFT. The 3301 row remains independently reproduced by `sims/lp2_p28_dh23_onion_factor_selector_sft.cjs`.

This materially changes the old p33–39 TCP-command gate: the missing **command/page selector** is now supplied internally by the p28 object and the p57/p50 p33 pointer. The remaining blocker is narrower: neither `16I` nor `3QO` specifies a reversible consumer for the 1,680 p33–39 ciphertext runes.

## Prime-rank reconstruction of both cuneiform values

An older p33–39 arithmetic result established that the two reversed decimal primes have one-based prime ranks

`π(1033)=174=6×29`
and
`π(3301)=464=16×29`.

That report correctly treated the quotients **6** and **16** as underselected after discovery. The p28 BASE29 object now supplies both values before inspecting the cuneiform ciphertext:

- the center of the bracketed BASE29 word is **6**;
- the literal command radix supplies **29**;
- original p50 cell29 is the unique literal token **`16`**.

So the route reconstructs both visible p33 operands by the same prime-rank rule:

`prime_(6×29) = prime_174 = 1033`

`prime_(16×29) = prime_464 = 3301`.

This is stronger than merely observing that both ranks are divisible by29. The formerly unexplained quotients are now source-selected by the p28/p50 route. It also explains why the historical test vector couples exactly **BASE29 1033** with **DH 3301**: the same BASE29-selected state generates both operands before any p33–39 decryption is attempted.

The next decisive problem is therefore no longer choosing the two command operands. It is finding the value-changing receiver or state transition that consumes the p33–39 ciphertext after those commands.

## Why this is stronger than a free word-sum search

The object is selected before reading those three sums by two authenticated historical opcodes routed through the already established p50/base59 grammar. The bounds are exact canonical word cuts, and the operation applied inside the bounds is the already solved manuscript instruction to shed circumferences. No key, phase, alphabet permutation, or language-scoring threshold is fitted.

The strongest mundane rival is still coincidence from a heavily studied navigation network. The exact placements were discovered after p28, p50, p57, base59, DH23, and the opcode vocabulary were already under study. Therefore the correct classification is a source-constrained receiver/parameter hypothesis, not plaintext.

## BASE29 scope

The signed 2013 protocol defines `BASE29 n` as decimal-integer → base29 numeral conversion, with `3301 → 3QO`; it does not define a GP29-rune ciphertext inverse or byte serialization. The newly bracketed runes therefore do not license a free base29-to-bytes decoder. The useful result is the command-bounded object, its deterministic circumference-peel values, the p55 word15/NEXT prediction of `DJU / BEI`, and the independent p57-word6 → p50[19] → p33 continuation.

## Reproduction

`sims/lp2_p28_base29_goodbye_p55_receiver_sft.cjs` checks the authenticated command vocabulary against the local signed-protocol reference, reconstructs both p50 cut coordinates from original tokens, verifies the exact p28 word bounds and nested peel sums, exhausts all canonical 2,896 unknown-page words for the three individual signatures and the ordered three-word GP0 sequence, verifies p55 complete-word15 + NEXT = `DJU / BEI` and its only other page-local occurrence on p27, and verifies p57 word6 `TO` → GP0 19 → p50 cell19 → 33.


## P0 opening returns to the GOODBYE endpoint

A later holdout finds an independent original-ciphertext backlink to this bracket. P0's first two printed ciphertext words have GP0 sums **96,85**. Under the already selected base59 p50 grammar they map to **218,28**: the exact GOODBYE cut endpoint on this page and physical page28. Base60 gives222,28 and misses a word boundary. The typed condition is unique across all2,873 adjacent LP2 word pairs.

Offset218 begins p28 word47. Successive literal circumference peels of that already selected word uniquely hit clear p57 semantic values for `CIRCUMFERENCES`, `TUNNELNG`, `INSTAR`, and `EMERGE`. This creates a plaintext-independent return edge from p0 to the object immediately after the authenticated BASE29/GOODBYE bracket.

See `im-results/lp2-p0-opening-goodbye28-p28-nested-route.md` and `sims/lp2_p0_opening_goodbye28_p28_nested_sft.cjs`.
