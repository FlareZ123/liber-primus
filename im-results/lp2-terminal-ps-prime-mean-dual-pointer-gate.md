# Terminal P/S prime means, paired table-pointer trails and a direct inverse

**Agent 37, 12 November 2026. Classification:** a new source-exact two-seed pointer comparison, with an unsuccessful and completely specified original-cipher inverse. **No previously unknown Liber Primus plaintext, real key, or destination recovered.**

## The original clue candidate and its limit

The exact complete two-word ciphertext phrase `ᛞᛄᚢ-ᛒᛖᛁ` (DJU BEI) appears only at physical LP2 p27 offsets 28–33 and p55 offsets 70–75, the final two unknown words. This repeat is established independently in [the earlier original-source study](dju-bei-terminal-repeat.md). Both words have three runes. Averaging each word's three authentic GP prime weights gives

- DJU: `(89 + 37 + 3)/3 = 43`, the GP prime of **P**.
- BEI: `(61 + 67 + 31)/3 = 53`, the GP prime of **S**.

Thus both copies yield **P S**, a possible postscript/bookend cue. The original does not specify prime **means** as a text cipher or ask a solver to convert these two words to P/S; this reading was found after the unusual ciphertext repeat.

This run tested an independent consequence of *taking P/S literally as two numeric table-pointer starts*, rather than retrospectively inventing key phases.

## Fixed pointer paths on the original 32×8 byte table

Read the 256 original p49–p51 base60 table bytes in printed row-major order; at cell `x`, move to `T[x]` without modulo truncation. The two source-selected GP prime starts are `P = 43` and `S = 53`.

```text
43 → 73 → 79 → 82 → 201 → 74 → 205 → 76 → 114 → 197 → 115
   → 247 → 192 → 0 → 203 → 68 → 199 → 47 → 76 ...

53 → 171 → 54 → 156 → 52 → 86 → 111 → 115 → 247 → 192
   → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 ...
```

Each start visits exactly **18 distinct table addresses** before a repeated one. Their eventual cycle is the **same eleven-element cycle**, but they enter it at different positions: the first trail repeats **76**, the second repeats **115**. The GP prime **B=61** also produces an 18-address trail. Thus *P and S are two of three*, among the full canonical 29 GP prime starts, with that exact length. P's repeat value 76 equals physical p55's 76 rune count, as already documented by the p27 title-fold source route; S's repeats at 115 instead. The table's dominant cycle attracts **252 of the 256 cells**. The equality of trail lengths alone is insufficient to identify a key, and these properties were selected after examining the ciphertext bookmark.

**Source-pattern counterweight:** Under 30,000 fixed-seed Fisher–Yates permutations of the **same actual 256 byte multiset** (xorshift32 seed 0x37202611), **5,682 / 30,000** tables direct *all 29 GP-prime start cells into one component*, and **4,811 / 30,000** have a dominant component of at least 252 nodes. Both properties are fairly common for random functional graphs. The exactly observed 11+2 cycle lengths occur in 45 permutations with exactly two components, but counting that retrospective pair of lengths as a prespecified significance test would be unjustified. The direct inverse below is the decision that matters.

## Frozen reversible two-rail test on authentic ciphertext

Starting at cells 43 and53, define `x_0=43`, `y_0=53`, `x_(i+1)=T[x_i]`, `y_(i+1)=T[y_i]`, and the two-rail key

```text
k_i = (T[x_i] − T[y_i]) mod 29
P_i = (C_i − k_i) mod 29.
```

The rule uses exactly the two source-supplied starts, the already printed table arrows, the 29-symbol GP alphabet, and original page-local position zero. No fitted key, reset, word phase, text cribs, or multiple alphabet candidates enter the inverse. Check the opposite sign as the only symmetric control.

| Original physical page | Original GP29 IoC | C − k IoC | C + k IoC | Finding |
| --- | ---: | ---: | ---: | --- |
| p27, 234 runes | 0.03393126 | **0.03385789** | **0.03356443** | Neither produces coherent GP-native prose |
| p55, 76 runes | 0.03789474 | **0.03017544** | **0.04175439** | Neither produces coherent GP-native prose |

The opening 76-rune p55 inverse transliterates to

```text
OFGGMHIATHXTYIAMLRTHOCCFTHNGAEPBHTSFEFXOEPTUIABEAHUAEOERUUYUDLDNWFIJUIRDAEMBGPTHSDOEAETJCPJ
```

with digraph glyph spellings counted as single GP runes. The 6-rune original ciphertext anchor is the *same* on p27 and p55, but the frozen inverse maps the two occurrences to `R EA AE E O TH` and `AE T J C P J` respectively, with **zero of six recovered GP runes equal**. Thus it cannot even model the bookend as a repeated same-plaintext phrase under these two page-local key clocks. Re-encrypting `P_i+k_i` exactly restores all original ciphertext values. That round trip checks arithmetic consistency and is not a decryption success criterion.

As a separate text-channel check with no fitted key, apply the **exact GP-prime mean** to *all* original complete three-rune words (720 in 2,896 words). Exactly **90** have an arithmetic mean in the 29-symbol GP prime alphabet. Their source-order transliteration begins `AHILIJLSHDJEOGTHPXLIL` and ends `...GEOENGIPTPS`. There is no readable unencrypted longer word-mean message; the final P/S is a selected local phenomenon. This test does not disprove a separately coded P/S bookmark.

## Decision and reproducibility

This branch identifies a **distinct natural P/S pointer start**, but the original dual-stream difference does not decrypt p27 or p55 and contradicts same-plaintext interpretation of the six-rune repeated bookend. Keep P/S as an exploratory navigation candidate; do **not** optimize arbitrary pointer offsets, byte/rune conversions, alternate stages, resets, or language-selected phases around it. The next productive work needs an independent original-source instruction selecting how the table or pointer streams act on ciphertext.

[Self-contained CommonJS exact source test](../sims/lp2_terminal_ps_dual_pointer_sft.cjs) reads the checked-in transcription, GP corpus and table, checks the two repeated complete words and prime means, all 29 GP-prime pointer-trail lengths, native GP phrase coordinates, both reversible p27/p55 inverse signs and the bookend mismatch. The conditional matched-table permutations above were run separately and are not required for reproducing the exact source findings. No new established result is promoted to the authoritative [research synthesis](../results/README.md).
