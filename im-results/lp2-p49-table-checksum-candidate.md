# p49–51 table checksum candidate

**Classification: intermediate, exploratory arithmetic observation. Not an established result or a decryption.**

## Observation

The p49–51 section has a natural three-part layout: a 66-rune p49 prologue, a 32×8 numeric table, and a 92-rune p51 postlude. The original p49 image (LP2 image 66.jpg) has a ten-red-square marker immediately before the table. The table geometry has four concentric rectangular rings containing 76, 68, 60, and 52 cells.

Using the current canonical base60 transcription:

- The 256 table values sum to **33,006**.
- (33,006 + 4 = 33,010 = 10 	imes 3301).
- The table sum is **4 mod 29** and **−4 mod 3301**.
- The four ring sums modulo 29 are **[2, 17, 9, 5]**; the outer 76-cell ring sums to 2 mod 29, and the combined 180-cell interior also sums to 2 mod 29.
- The p49 66-rune prologue's GP29 index sum is **1,025 ≡ 10 (mod 29)**, matching the ten-dot marker.
- The p51 92-rune postlude's GP29 index sum is **1,434 ≡ 13 (mod 29)**. A distinct 13-dot marker on original image 68.jpg was not independently located in this audit; do not treat that match as established.
- Under the competing base59 interpretation, the 256-token sum is **32,499**, and it does not satisfy (S+4=10	imes3301).

The 4 in the table checksum has several plausible but unselected referents: the four visible rings, the degree of the conditional H×G polynomial factor, or the four candidate exceptional/carry positions on p55. The exact relation may be a deliberate checksum, but it was noticed post hoc and no author-authenticated instruction to sum the blocks has been found.

## Interpretation and limits

This is a possible source-linked checksum/radix discriminator, not a key or plaintext. The p49 residue/marker match and table sum/ring match are the cleanest observations. The p51 residue 13 should remain an unpaired statistic until a precise source feature is identified.

The numeric table values come from `resources/liber-primus/lp2-grid-256.json`; this experiment did not independently re-read every token from the original JPEGs. The base60 interpretation is favored by other source work, but the checksum must not be used to assume it. No new conclusion about the 66-rune instruction, p51 text, or unknown LP2 cipher follows.

## Reproduction

From repository root:

```bash
node sims/lp2_p49_table_checksum_candidate_sft.cjs
```

The script verifies the 256 base60 token values against the canonical byte array, computes the four ring sizes/sums, compares base60 and base59 sums, and checks the p49/p51 GP29 index sums. It does not implement or fit a decoder.

## Next discriminating use

If an independently source-selected p49 decoder recovers plaintext, check whether it explicitly directs the solver to the ten-dot marker, 3301, the four rings, or a modulo-29 checksum. If no recovered instruction selects this arithmetic, retire it as a numerical coincidence rather than building another cipher layer on it.
