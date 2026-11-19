# OPENPGP43 canonical correction: numeric direction orders a unique source-prefix H packet

**Agent29, 19 November 2026. Classification: source-selected structural checkpoint on the authenticated numbered diagonal. This corrects the earlier page-local-parser result. It does not recover unknown LP2 plaintext.**

## Canonical parser correction

The repository's corrected numbered-diagonal contract preserves words across physical page boundaries and excludes crossing words from page-local ordinals. Under that contract, authenticated source ordinal43 `OPENPGP` selects project p42 canonical word43.

P42 begins with a continuation fragment from p41. The earlier endpoint reproducer counted that fragment as local word1, shifting every p42 local ordinal by one. Consequently the palindrome at offsets203..205 was labeled word43 even though it is canonical word42.

The corrected objects are:

```text
p42 canonical word42: offsets203..205 = [11,13,11]
p42 canonical word43: offsets206..208 = [16,0,14]
```

The numbered diagonal therefore selects the second object.

## Fixed H readout

Use the established outside-in odd-length transform:

```text
H3([x0,x1,x2]) = [x0-x2, x0+x2, x1] mod29.
```

For the corrected OPENPGP receiver:

```text
H3([16,0,14]) = [2,1,0].
```

In the authenticated zero-based 2016 source register this is:

```text
2 -> PATH
1 -> THE
0 -> HELLO
```

Under Hpair the receiver serializes the three source positions as `[2,1,0]`; Hsplit serializes the same coordinate multiset as `[2,0,1]`. The invariant object is therefore the complete coordinate set `{0,1,2}`. The independently established `THEIR NUMBERS ARE THE DIRECTION` rule orders that set increasingly, giving `[0,1,2] = HELLO THE PATH` without choosing between Hpair and Hsplit.

## Shared numbered-diagonal orientation grammar

The serialization-independent grammar uses the **complete H coordinate set**. Across all 42 valid direct numbered receivers, exactly three complete coordinate sets are consecutive source intervals:

```text
IS11      -> {25,26} -> THEIR NUMBERS
AND24     -> {12,13} -> THE WAY
OPENPGP42 -> {0,1,2} -> HELLO THE PATH
```

After one independently clue-selected circumference shed, ARE27 is the sole additional direct receiver whose complete coordinate set is consecutive: `{5,6} = EPIPHANY SEEKS`.

The exact descending Hpair shell at OPENPGP remains a valid convention-specific whole-corpus control. The source restart itself is stronger: Hpair and Hsplit contain the same `{0,1,2}` coordinates, and the source-authored numerical direction orders them identically.

See [the unified grammar](lp2-numbered-diagonal-unitrun-direction-grammar.md).

## Complete controls

The canonical manuscript contains 716 complete three-rune unknown-page words. Exactly one has H3 shell `[2,1,0]`: p42 canonical word43 at offsets206..208. Only three of the 716 have any unit-step consecutive H3 run.

On the authenticated numbered diagonal, 42/43 source coordinates exist under the corrected parser and eight of those objects have length3. OPENPGP43 is the only one whose H3 output is a unit-step consecutive source-index run in either direction.

The earlier claim that the diagonal contained three palindromic three-rune objects is a parser artifact. Under the corrected cross-page parser there are zero such diagonal palindromes.

## Independent p24 AND checkpoint

The same canonical numbered route gives authenticated source index24 `AND` -> project p24 canonical word25:

```text
p24 word25 offsets115..116 = [27,15].
H2 = [27-15, 27+15] mod29 = [12,13].
12 -> THE
13 -> WAY
```

This exact H2 shell occurs once among all 448 canonical two-rune unknown-page words, at p24 word25. Among the ten two-rune numbered-diagonal objects, only two have any consecutive H2 pair; p24 is the sole `THE WAY` hit. It is also the only two-rune diagonal object that simultaneously has a consecutive H pair and first ciphertext value equal to the authenticated source word's GP0 residue: `GP0(AND)=27`.

There is a secondary integer observation:

```text
27 - 15 = 12 = THE
27 + 15 = 42 = OPENPGP
(27 + 15) mod29 = 13 = WAY
```

The unreduced sum42 is exactly the authenticated source index of OPENPGP. This is recorded as a possible pointer because the standard H operation itself reduces modulo29; switching the sum into the 43-word source register before reduction is an extra interpretation and is not yet promoted to a navigation rule.

## Retired downstream claims

The previous p42 object `[11,13,11]` still satisfies `H=[0,22,13]`, but it is canonical word42 rather than the OPENPGP-selected word43. Therefore `OPENPGP43 -> HELLO THE WAY`, endpoint13 selecting the p0 red title, and the dependent OPENPGP cube continuation to `EPIPHANY SEEKS` are retired.

## Decision

Preserve the corrected checkpoint `OPENPGP43 -> p42 word43 -> [16,0,14] -> H3 [2,1,0]`, and preserve p24 `AND -> THE WAY` independently. The possible unreduced `sum=42=OPENPGP` bridge remains a hypothesis requiring independent support.

## Reproduction

`node sims/lp2_openpgp43_hello_the_way_sft.cjs`
