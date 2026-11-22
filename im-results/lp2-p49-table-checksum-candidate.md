# p49–51 table checksum candidate

**Classification: intermediate, exploratory arithmetic observation. Not an established result or a decryption.**

## Observation

The p49–51 section has a natural three-part layout: a 66-rune p49 physical-page fragment, a 32×8 numeric table, and a 92-rune p51 physical-page fragment. The original p49 image (LP2 image 66.jpg) has a ten-red-square marker immediately before the table. The table geometry has four concentric rectangular rings containing 76, 68, 60, and 52 cells.

Using the current canonical base60 transcription:

- The 256 table values sum to **33,006**.
- (33,006 + 4 = 33,010 = 10 	imes 3301).
- The table sum is **4 mod 29** and **−4 mod 3301**.
- The four ring sums modulo 29 are **[2, 17, 9, 5]**; the outer 76-cell ring sums to 2 mod 29, and the combined 180-cell interior also sums to 2 mod 29.
- The p49 66-rune prologue's GP29 index sum is **1,025 ≡ 10 (mod 29)**, matching the ten-dot marker.
- The p51 92-rune page fragment's GP29 index sum is **1,434 ≡ 13 (mod 29)**. Original image 68.jpg contains **13 visible horizontal rows** (nine numeric-table rows followed by four rune lines), a concrete page-layout referent for 13; it is not a 13-dot marker.
- Under the competing base59 interpretation, the 256-token sum is **32,499**, and it does not satisfy (S+4=10	imes3301).

The 4 in the table checksum has several plausible but unselected referents: the four visible rings, the degree of the conditional H×G polynomial factor, or the four candidate exceptional/carry positions on p55. The exact relation may be a deliberate checksum, but it was noticed post hoc and no author-authenticated instruction to sum the blocks has been found.


## Intact-sentence boundary control (16 November 2026)

The 66-rune p49 fragment and 92-rune p51 fragment are not intact semantic sentences. The complete pre-table sentence is p48's final 72 runes plus p49's 66: index sums **961 + 1,025 = 1,986 ≡ 14 (mod 29)**. The complete post-table sentence is p51's 92 runes plus p52's first 78: **1,434 + 1,159 = 2,593 ≡ 12 (mod 29)**. Thus the fragment residues 10 and 13 do not survive the source-correct sentence boundaries. The p51 13-row match is a genuine visual count, but it does not authenticate a sentence checksum or a table consumer. Keep the 10-dot / 4-ring / 13-row correspondences as exploratory layout arithmetic, not an established checksum grammar.

## Interpretation and limits

This is a possible source-linked checksum/radix discriminator, not a key or plaintext. The p49 residue/10-dot match and table sum/4-ring match are the cleanest observations. The p51 residue 13 has a page-local 13-row referent, but the intact-sentence control shows that the match is fragment-dependent. No common checksum grammar or decoder is established.

The numeric table values come from `resources/liber-primus/lp2-grid-256.json`; this experiment did not independently re-read every token from the original JPEGs. The base60 interpretation is favored by other source work, but the checksum must not be used to assume it. No new conclusion about the 66-rune instruction, p51 text, or unknown LP2 cipher follows.

## Reproduction

From repository root:

```bash
node sims/lp2_p49_table_checksum_candidate_sft.cjs
```

The script verifies the 256 base60 token values against the canonical byte array, computes the four ring sizes/sums, compares base60 and base59 sums, and checks the p49/p51 GP29 index sums. It does not implement or fit a decoder.

## Next discriminating use

If an independently source-selected p49 decoder recovers plaintext, check whether it explicitly directs the solver to the ten-dot marker, 3301, the four rings, or a modulo-29 checksum. If no recovered instruction selects this arithmetic, retire it as a numerical coincidence rather than building another cipher layer on it.
