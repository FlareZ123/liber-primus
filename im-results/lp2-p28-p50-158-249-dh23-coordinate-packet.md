# P28 line-6 position-19 → p50 reciprocal cells → p0 count: a geometric DH23 packet

**Agent 4, 22 November 2026. Classification: exact original-source arithmetic bridge and proposed key route. No new LP2 plaintext, source-authenticated cipher, or complete inverse.** This report joins three previously independent manuscript observations without inventing key parameters. All arithmetic and original-cipher inputs are reproduced by the [Windows/Node22 SFT](../sims/lp2_p0_158_249_dh23_coordinate_packet_sft.cjs).

## Source-visible proposed human route

The source-selected five-rune word 28 on physical LP2 p28 finishes the **only** original unsolved-book line beginning with the literal rune fragment `DH`. That line is **line 6** of its page and contains **23 runes**; the selected word begins at **one-based line position 19** and has length **5**. A prior manuscript-native reading treats this as the conventional Diffie–Hellman example `(p,g,a,B)=(23,5,6,19)`, giving `A=5^6 mod23=8` and `K=19^6 mod23=2`. This complete DH23 worked tuple is visible in the authenticated 2013 Cicada TCP specification, although the specification does not instruct a 2014 LP2 solver to reuse it. Original source: [p28 DH23 line selector](lp2-p57-find28-p28-centerword-dh87-loop.md), [2013 source and its limits](cicada2013-dh23-worked-example-player-visible-gate.md).

The original three-page physical p50 numerical table has exactly **8 columns**, equal to the independently selected DH public value `A=8`. Use the p28 line's **position 19** as a zero-based table row and its **line number 6** as a zero-based table column. This is a proposed (not explicitly instructed) interpretation of the visible numbers as coordinates. It selects exactly

```text
row 19, column 6 = cell 19×8+6 = 158
p50[158] = literal "49" = base60 byte 249
row 31, column 1 = cell 31×8+1 = 249
p50[249] = literal "2c" = base60 byte 158
```

Thus the p28-derived coordinate enters the **unique nontrivial full-byte p50 two-cycle** `158 ↔ 249`. The previously established original-p0/chapter study, independently of this coordinate reading, found **249 black runes** after p0's authenticated 13-rune red heading and **158 printed words** in its entire three-page opening chapter pp0–2. Thus both printed source counts correspond to the two addresses returned by this p28-seeded cycle. See the independently reported [p0 249 ↔ chapter 158 source gate](lp2-p0-opening249-chapter158-two-cycle-source-gate.md).

The cycle's two source positions themselves encode the already selected p28 DH fields:

| Original p50 source value | Geometric interpretation | Candidate historical DH field |
|---|---|---|
| Cell 158 = (row19, col6) | First row | `B=19` |
| Cell 158 = (row19, col6) | First column | `a=6` |
| Cell 249 = (row31, col1) | 31−19 row displacement | `K·a=12` because 2×6=12 |
| Cell 249 = (row31, col1) | 6−1 column displacement | `g=5` |
| Difference / source private exponent | 12/6 in GF29 | `K=2` |

In ordinary DH23 arithmetic the same tuple independently yields `5^6 mod23=8` and `19^6 mod23=2`. The geometric packet `(g,K·a,B)=[5,12,19]` is the **exact original runic word at physical p38 offsets 54–56**, previously selected by a different authenticated-source/p50 low-digit route at the section-4/5 boundary. See [p38 reciprocal original-source word](lp2-p38-found-road-reciprocal-state.md). This new table-coordinate explanation does not depend on using the recent first-`00` event clock to derive those fields.

## What this changes cryptanalytically

The previously proposed p0 four-rune candidate **WILL** at offset141 relied on importing the DH23 key tuple through p38 and several conjectural selector operations. The p28 → eight-column table → p50 two-cycle geometry now supplies a *different original-artifact route* to the identical operands `[g,a,B,K·a]=[5,6,19,12]`. The signed 2016 source contains the literal phrase **YOU WILL BE FOUND**. Its word YOU has native GP0 sum30; original p50[30]=`2L`=base60 141, selecting the complete four-rune original p0 word at offsets141–144. Using the previously proposed GF29 map `H(x,y)=(x−y,x+y)`, `A=8,B=19` gives candidate pad

```text
[K·a, a, A−B, A+B] mod29 = [12, 6, 18, 27]
Original C_p0[141..144]       = [19,16,9,18]
Conditional output P          = [ 7,10,20,20] = W I L L
```

The entire original four-symbol pad exactly forwards to its original ciphertext. **WILL is not new plaintext and remains an unverified proposed reading.** The new contribution is a distinct, source-structured route to key *operands*, with no dependence on first-`00` equal-event sampling or an arbitrary guessed exponent.

The obvious extension of this exact four-position key as a period-four pad across p0 does **not** produce normal GP29 language: original p0 black249 IoC is `0.03436325949`; the period-four decoded 249-rune IoC remains `0.03452519756`, compared with `0.06270996641` in authentic solved p57. The pre-existing [second coda GOOD→LUCK holdout](lp2-p0-2016-coda-dual-dhpad-holdout.md) also falsified transfer of the four-slot DH grammar to that proposed different word, even with freely renewed DH23 fields. Neither result licenses further ad hoc key changes. The missing deliverable remains an **author-selected, reusable plaintext decoder**.

## Independence, restrictions and decision

**Source observations:** original p28 position19/line6, p50 table width8 and exact tokens at 158/249, original p0 13-red/249-black, first-chapter 158-word count and p38 [5,12,19] are fully reproducible. The authenticated signed source fixes DH example arithmetic; no inferred author action is needed for those equalities.

**Unlicensed inference:** no first-party instruction explicitly identifies p28 position as a *zero-based* p50 row, p28 line number as a *zero-based* p50 column, or the two-cycle's displacement as cryptographic operands. Source positions and table addresses use differing conventional indexing (the p28 position and line number were counted starting at one; row19/col6 are numeric zero-based coordinates). The source-derived count and DH packet matches were recognized with extensive prior hypothesis searches; **the correlations cannot be multiplied into an independent p-value**. The p38 word and conditional WILL readings were known first.

**Research decision:** prioritize the **p28 → row19/col6 → 158 ↔ 249 → p0** bridge as a *candidate source-derived key route*, and seek one predeclared invertible operation on an untouched original ciphertext region that predicts readable native plaintext **and re-encrypts exactly**. Existing 158-rune flank-addition and p56-prime/totient seeding tests were negative and should not be rerun. If this entire route cannot select such an inverse independently, leave the arithmetic in intermediate results; do not promote it as solved cryptography.

## Exact reproducibility

Execute `node sims/lp2_p0_158_249_dh23_coordinate_packet_sft.cjs` on Windows Node.js 22. The script reads unchanged original corpus, original page transcription, p0 image-backed ink adjudication, physical p50 tokens, the signed 2016 message and canonical word parser. It asserts the p28 line/word geometry, p0 and chapter counts, the only full-byte 2-cycle, table coordinates, p38 packet, DH23 arithmetic and conditional existing four-rune WILL inverse. It prints the complete input and operand packet. A standalone independent evidence assertion is preserved without requiring any community-generated plaintext as input.
