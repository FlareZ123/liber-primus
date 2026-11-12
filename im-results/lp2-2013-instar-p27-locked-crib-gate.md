# Fixed 2013 Instar title as p27 red-heading crib: source-exact rejection

**Director Issue #664, Agent 2, 12 November 2026.** The **2013 original 761.MP3 ID3 title** is `THE INSTAR EMERGENCE`. The original **LP2 physical p27** (44.jpg) places a drawn insect wing immediately above its **19-rune red heading**. The solved p57 PARABLE independently discusses the instar/emergence motif, so a cross-round plaintext crib is plausible, but not uniquely chosen by an authenticated cipher instruction.

## Precommitted source reading

The source-first contract is preserved verbatim in [`workplace/2013-instar-p27-wing-locked-crib.md`](../workplace/2013-instar-p27-wing-locked-crib.md): encode `THE INSTAR EMERGENCE` as exactly **17 GP29 runes**, and place those 17 symbols at red **p27 offset0**. This is the **only** alignment. The original heading's full 19 runes are retained; offsets17–18 are withheld and are not allowed to choose a cipher. The original printed p27 red word lengths **3/12/4** conflict with the proposed phrase's **2/6/9**, so preserving word separators would already exclude the crib.

Fixed GP29 plaintext indices:

```text
THE     INSTAR       EMERGENCE
2 18    10 9 15 16 24 4    18 19 18 4 6 18 9 5 18
```

Original p27 first 17 red ciphertext indices:

```text
19 13 26 20 15 3 24 25 8 20 18 12 10 19 20 20 15
```

Implied Vigenère key under historical source `C−P mod29`:

```text
17 24 16 11 0 16 0 21 19 1 0 8 4 1 11 15 26
```

The first two remaining original red symbols at p27 offsets17–18 are GP indices **5,13**. No key survived the original 17-rune gate to predict them legitimately.

## Complete frozen family and independent wrong-image comparator

All periods **1 through 14** were predeclared. A repeating key of period `d` requires each implied residue `k[i] == k[i−d]` for every `d ≤ i < 17`. Count conflicting residues on the original; **zero conflicts is required**:

| p27 key period | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Conflicts | 16 | 15 | 13 | 13 | 12 | 10 | 10 | 9 | 8 | 7 | 5 | 5 | 4 | 3 |

**No exact period survives**, including the original 8-rune DIVINITY key length, the historical 13-rune FIRFUMFERENFE key length, and the maximum allowed 14-rune key (3 conflicts).

Two other predeclared historical LP1 ciphers also fail: `P=(31−C) mod29` (Atbash+3) matches **1/17**, and the exact authentic `DIVINITY` Vigenère key at phase zero matches **0/17**. There is no keyed F skip or phase adjustment in this test.

For the original **p53 red span** (the independently predeclared wrong-image comparator, at p53 local offset128), the same phrase aligned at the start yields period-conflict counts **[16,15,14,13,12,11,10,9,8,7,6,5,4,3]**, with **no surviving period**. Atbash+3 matches **1/17** and DIVINITY phase zero **0/17**. This confirms the negative p27 behavior is not an unusual positive under the identical comparator, though it is not itself a null distribution or broad source-origin inference.

Exact 17-symbol GP-native planted controls pass: Vigenère using the published DIVINITY key yields zero conflicts for period8 and correctly recovers the complete crib; the independently known Atbash+3 operator encodes and inverts the same phrase.

**Decision:** reject only `THE INSTAR EMERGENCE` as a direct aligned p27 red-prefix known plaintext under these historically demonstrated low-period GP29 ciphers. The p27 insect wing remains a genuine visual cue, but the 2013 title is already echoed by solved p57. The p27 red text, withheld original p27 black body and unsolved LP2 **remain undeciphered**. A future proposal requires an independently sourced different word boundary/transform or a new original-key source; no rescue through variable offset, synonyms, arbitrary Fehu mask or period15+.

**Reproduction:** [`sims/lp2_2013_instar_p27_crib_sft.cjs`](../sims/lp2_2013_instar_p27_crib_sft.cjs) uses original canonical p27 and p53 rune indices plus red-span annotations, asserts every conflict count and tests the positive plants. No external runtime packages or workflow.
