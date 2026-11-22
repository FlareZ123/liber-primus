# p15–p21 cold-start source freeze and adjudication

**Agent3, 21 November 2026.** This is the source-first record for Director Issue #1999. The original supplied JPEGs map physical p15–p21 to archive images 32–38. The two initial observations and one candidate were frozen before derived p15/p21 reports were opened.

## Two direct observations

1. **p15 places a 4×4 numeric array between distinctive visual markers.** The page shows a red heading above a four-row/four-column array of 16 four-digit values; exactly one entry, 3299, is red. An infinity-like black figure sits immediately below the array, followed by a runic text block beginning with a large red initial. The layout makes the array a plausible source object for the following text, but it does not itself label the values as a key, specify a modulus, or name an operation.

2. **p16–p21 are a continuous run of ordinary centered runic text pages.** They have no colored heading, numerical table, or local illustration comparable to p15; the interval ends on p21 before the separate p22 numeric-square page. This makes p15→p16 a plausible source/receiver boundary, but the scans do not visibly prescribe a page reset or block alignment.

## Frozen candidate H1: p15 table as a standard GP29 Hill key

The smallest conventional operation suggested by a 4×4 numeric array adjacent to a 29-symbol runic alphabet is a **4×4 Hill-style linear block transform over GF(29)**. Freeze the original p15 values in printed row-major order:

`[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]]`.

Reduce each entry modulo 29 to form the fixed matrix M. If M is invertible, test only `P = M⁻¹ C (mod 29)` on the untouched original GP29 stream p16–p21, partitioned continuously from the first rune of p16 into consecutive four-rune column vectors. Do not reset at page or word boundaries. Use p16–p20 as the candidate span and keep p21 untouched as the holdout. The exact forward prediction is `C = M P (mod 29)` on every tested rune. The output type is ordinary coherent GP29 plaintext; a positive must contain at least 50 contiguous readable runes on p16–p20 and independently readable held-out p21, with exact re-encryption.

Human motivation: a solver sees a 4×4 numerical object immediately before runic text and recognizes the standard linear-block-cipher use of a matrix. The GP29 alphabet supplies a natural candidate field size, but **neither Hill nor modulus 29 is explicitly named by the page**. The red 3299 and infinity mark are recorded as visible context, not used to alter matrix entries, orientation, key, phase, or operation.

## Post-freeze comparison with existing work

- `im-results/p15-hill-block-test.md` already tests the exact printed p15 matrix over GF(29), its inverse, transpose, and other source-derived matrix representations. It includes continuous block phases 0–3, page-reset controls, row/column vector conventions, and both the immediate following section p16–p22 and the full p16–p55 receiver. The fixed row-major inverse at phase zero is one of its predeclared cases. All immediate-section outputs are nonlinguistic; the full-section outputs remain at ciphertext-like IoC. This strictly contains H1, so no duplicate computation was run.
- `im-results/lp2-p15-fourpage-hill-source-inverse.md` separately tests the p15 matrix as a four-lane mixer on the next four pages p16–p19, under the four natural matrix/inverse/transpose conventions. All four outputs are nonlinguistic; no page-order or key fitting is needed to reject that candidate.
- `im-results/p15-p21-artifact-first-operation-audit.md` already inventories the original p15–p21 scans. It confirms p15's two red headings, red 3299, infinity mark and large red initial; p16–p20 are 12-line monochrome text pages; p21's larger vertical gap is an ordinary recurring paragraph-spacing convention also found elsewhere. The audit concludes that the p15 grid construction explains its numbers but not the following rune text, and that no p16–p21 visual operand, cipher family, key, or state clock is selected.
- `im-results/lp2-p1-p21-human-solve-path-audit.md` independently ranks the plausible human routes across p1–p21. Its p15 continuation and direct Hill readings fail; the infinity glyph does not say how to turn the next Fibonacci/prime value into a cipher key.

## Decision

**Bounded negative; no new candidate was run.** H1 is already fully contained in the exact p15 Hill block test, and the source-first p15–p21 artifact audit has already found no new operator. The 4×4 table is a real, reproducible Fibonacci-indexed-prime object, but its adjacency to six text-only pages does not authenticate its use as a Hill key. No source-selected inverse recovers 50 contiguous coherent original GP29 runes with an untouched holdout.

The exact missing selector is a first-party instruction mapping the p15 numerical object to an operation on p16–p21 and fixing the modulus, matrix orientation, vector serialization, block clock/reset, sign and receiver. The infinity mark supplies no such continuation rule. Do not reopen the excluded p21 matrix, five-fragment, or p22 square families. Retire this p15–p21 cold-start pass; preserve the p15 spiral as an established numerical construction, not as a decipherment of the adjacent text.
