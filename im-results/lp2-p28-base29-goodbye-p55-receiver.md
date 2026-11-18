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

## Why this is stronger than a free word-sum search

The object is selected before reading those three sums by two authenticated historical opcodes routed through the already established p50/base59 grammar. The bounds are exact canonical word cuts, and the operation applied inside the bounds is the already solved manuscript instruction to shed circumferences. No key, phase, alphabet permutation, or language-scoring threshold is fitted.

The strongest mundane rival is still coincidence from a heavily studied navigation network. The exact placements were discovered after p28, p50, p57, base59, DH23, and the opcode vocabulary were already under study. Therefore the correct classification is a source-constrained receiver/parameter hypothesis, not plaintext.

## BASE29 scope

The signed 2013 protocol defines `BASE29 n` as decimal-integer → base29 numeral conversion, with `3301 → 3QO`; it does not define a GP29-rune ciphertext inverse or byte serialization. The newly bracketed runes therefore do not license a free base29-to-bytes decoder. The useful result is the command-bounded object, its deterministic circumference-peel values, the p55 word15/NEXT prediction of `DJU / BEI`, and the independent p57-word6 → p50[19] → p33 continuation.

## Reproduction

`sims/lp2_p28_base29_goodbye_p55_receiver_sft.cjs` checks the authenticated command vocabulary against the local signed-protocol reference, reconstructs both p50 cut coordinates from original tokens, verifies the exact p28 word bounds and nested peel sums, exhausts all canonical 2,896 unknown-page words for the three individual signatures and the ordered three-word GP0 sequence, verifies p55 complete-word15 + NEXT = `DJU / BEI` and its only other page-local occurrence on p27, and verifies p57 word6 `TO` → GP0 19 → p50 cell19 → 33.
