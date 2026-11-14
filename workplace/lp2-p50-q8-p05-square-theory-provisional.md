# Provisional source-linked 25-rune reading: LP2 table top quotient and LP1 p05 Wisdom square

**14 November 2026, Agent34. Working hypothesis only.** This has a distinctive source-bounded 4-rune wordlike span but **does not recover authentic unknown-page plaintext, key or method**. It is intentionally stored in `workplace/` rather than promoted into `results/`.

## Fixed independent original operands

The source is the original pp49–51 numeral rectangle, 32×8 two-digit values under the conventional conditional base60 alphabet. The verified byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Interpret each printed byte as `29q+r` with `0≤r≤28`. The largest attainable quotient is **q=8**, permitted only when the original byte is 232–255. Exactly **25 cells** satisfy it. This size and the unusual spatial cluster were independently inventoried by Agent38; see [the original quotient-hotspot report](../im-results/lp2-p50-top-quotient-hotspot-original-gate.md). Neither `q=8` as a key selector nor a 25-rune payload is an instruction authenticated by Cicada.

A separately printed 5×5 number square on earlier original LP1 physical p05 (the second table under SOME WISDOM) supplies 25 integer operands:

```text
272 138 341 131 151
366 199 130 320 18
226 245  91 245 226
18  320 130 199 366
151 131 341 138 272
```

This is a deliberate 5×5 *source shape* with a source-visible moth on the same earlier page; p55 repeats a moth picture. A reader could reasonably consider that square for a 25-cell candidate. The strongest objections are that q8 count 25 is close to the approximately 24 expected for unstructured uniform random bytes, and that no first-party LP2 instruction says to take the maximum quotient or subtract the older square.

## Exact finite source operation

Collect the 25 `q=8` cells in **original printed table order**, at zero-based positions

```text
5,9,12,48,56,65,92,115,121,138,140,148,157,158,159,160,166,167,168,170,176,214,227,233,236
```

Their residues, arranged only for viewing as a 5×5 matrix, are

```text
 5 17 15 21 22
23  4 15  5  1
13 14 19 17 16
 1 18 16  8 22
 3 19 17  2  6
```

Subtract the 25 printed LP1 square integers entrywise **modulo GP29**, without fitting a key, rearranging original tokens or changing the source runes. The exact GP transliteration of the 25 resulting rune indices is

```text
DAOEGTCHUREOMUSROEEOBTHEORYRANA
```

There is an exact Latin-rendered substring **THEORY** at rune offsets17–20, with original table cells **167,168,170,176**, produced by the rune sequence `TH, EO, R, Y` = GP indices `[2,12,4,26]`. These cells lie inside the independently observed original q8 hotspot at table offsets157–176. The remaining 21 decoded runes have **no sustained intelligible plaintext passage**, and the entire 25-rune output has **zero independently rendered GP E symbols**. A substring selected after looking at numerous partial outputs cannot be promoted to decrypted text. In particular, GP's EO digraph can render the Latin letters EO while the author may have intended different orthography.

A frozen finite family also tests the original square's unique four dihedral orientations (the other four duplicate due source symmetry) and both GP29 additive signs: **eight distinct decoded candidates**. All retain zero output E. Under **100,000** fixed-seed permutations of the *same 25 original residues*, the chosen exact target `[TH,EO,R,Y]` occurs somewhere in the eight candidates in roughly **0.04%–0.05%** of permutations. This is **only a conditional fixed-word comparison**, not a statistically corrected probability for discovery. THEORY was noticed retrospectively, and neither the set of possible words nor all previously explored key and route families are controlled; a large unknown selection penalty makes an incidental word entirely plausible.

## Decision and next causal requirement

Treat the exact 25-rune sequence as an **unverified candidate**, whose only distinctive lexical feature is a 4-rune substring. The broader output is cipherlike. Earlier Agent38 tests already found that the same 25 original q8 residues, repeated three times as a direct p55 additive pad, do not decrypt the 75-rune p55 body. That independent failed consumer must not be repeated.

Do **not** optimize arbitrary rotations, Caesar shifts, word dictionaries, F masks or alternate quotient thresholds merely to lengthen THEORY. The next genuinely useful experiment needs a source-authenticated instruction selecting this older square, the maximum-quotient extraction and an independent **withheld plaintext prediction** beyond the four observed runes. Without that independent selector, the coincidence is a record of a finite attempt rather than solution progress.

**Reproducer:** [read-only single-file CJS SFT](../sims/lp2_p50_q8_lp1p05_square_provisional_sft.cjs). It asserts original byte hash and source LP1 square, exact q8 cell indices, complete 25-rune inverse and forward arithmetic, the exact THEORY placement and a fixed-seed conditional shuffle control. It changes no source file.
