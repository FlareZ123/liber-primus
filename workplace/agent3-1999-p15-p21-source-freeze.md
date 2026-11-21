# p15–p21 cold-start source freeze

**Agent3, 21 November 2026.** This is the pre-report observation and candidate lock for Director Issue #1999. The original supplied JPEGs map physical p15–p21 to archive images 32–38. The observations below were taken from those original scans before opening the derived p15/p21 reports for this task.

## Two direct observations

1. **p15 places a 4×4 numeric array between distinctive visual markers.** The page shows a red heading above a four-row/four-column array of 16 four-digit values; exactly one entry, 3299, is red. An infinity-like black figure sits immediately below the array, followed by a runic text block beginning with a large red initial. The layout makes the array a plausible source object for the following text, but it does not itself label the values as a key, specify a modulus, or name an operation.

2. **p16–p21 are a continuous run of ordinary centered runic text pages.** They have no colored heading, numerical table, or local illustration comparable to p15; the interval ends on p21 before the separate p22 numeric-square page. This makes p15→p16 a plausible source/receiver boundary, but the scans do not visibly prescribe a page reset or block alignment.

## Frozen candidate H1: p15 table as a standard GP29 Hill key

The smallest conventional operation suggested by a 4×4 numeric array adjacent to a 29-symbol runic alphabet is a **4×4 Hill-style linear block transform over GF(29)**. Freeze the original p15 values in printed row-major order:

`[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]]`.

Reduce each entry modulo 29 to form the fixed matrix M. If M is invertible, test only `P = M⁻¹ C (mod 29)` on the untouched original GP29 stream p16–p21, partitioned continuously from the first rune of p16 into consecutive four-rune column vectors. Do not reset at page or word boundaries. Use p16–p20 as the candidate span and keep p21 untouched as the holdout. The exact forward prediction is `C = M P (mod 29)` on every tested rune. The output type is ordinary coherent GP29 plaintext; a positive must contain at least 50 contiguous readable runes on p16–p20 and independently readable held-out p21, with exact re-encryption.

Human motivation: a solver sees a 4×4 numerical object immediately before runic text and recognizes the standard linear-block-cipher use of a matrix. The GP29 alphabet supplies a natural candidate field size, but **neither Hill nor modulus 29 is explicitly named by the page**. The red 3299 and infinity mark are recorded as visible context, not used to alter matrix entries, orientation, key, phase, or operation. If prior reports already test this exact source object or if M is singular, reject H1 without variants.

## Explicit exclusions

- Do not use p22's DIVINITY label or square as a selector.
- Do not reopen the p21 Hill/five-fragment matrix hypotheses, candidate DH packets, or any p22 matrix/square route.
- Do not try transposed matrices, alternative moduli, block permutations, word/page resets, or fitted phases if H1 fails.
- No candidate plaintext, key, or matrix output may be used to choose the operation or holdout after this freeze.
