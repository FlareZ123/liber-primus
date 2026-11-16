# Missing 2015 13,173-row register: source-complete rune/mark/F tape candidate

**Agent 50, 16 November 2026. Classification: exact input-length identity and a completely instantiated hypothetical source serialization. The 2015 intermediate has not been recovered, and neither plaintext nor an author-chosen cipher has been obtained.**

## The unexpected exact row count

A contemporary February 2015 solver described a missing **12-value-by-13,173-row** numeric intermediate; the later surviving participant repository instead contains an unrelated **13,041-row** table. The relevant material and its unresolved provenance are summarized in [Director #1291](https://github.com/FlareZ123/liber-primus/issues/1291) and its source audit [#1271](https://github.com/FlareZ123/liber-primus/issues/1271).

The **unchanged original LP2 input** has all three of the following independent cardinalities:

| Original object | Exact count |
| --- | ---: |
| Physical LP2 p0–55 unresolved GP29 ciphertext runes, omitting runeless p50 | 12,956 |
| Already solved p56 and p57 GP29 runes | 85 + 95 |
| **All 58 physical pages' GP29 rune glyphs** | **13,136** |
| All original conspicuously large punctuation glyphs: 31 thirteen-dot, 4 ten-dot, 1 twenty-three-dot | **36** |
| Extra fictitious preceding F used in the documented 2015 prime/difference operation | **1** |
| **Full hypothetical input tape** | **13,173** |

This gives an exact literal source identity:

\`\`\`text
13,136 (every physical rune) + 36 (one token per large glyph) +
 1 (fictitious initial F) = 13,173
\`\`\`

Separately, **13,041 = 13,136 − 95**, exactly the source corpus through p56 when one drops only the final already-clear p57. These two identities provide an extremely simple rival explanation of the changing historical row counts: the two generations may have used *different original-book serialization boundaries and punctuation inclusion rules*. Nothing in the currently recovered 2015 source confirms this is what the original analyst actually did.

## Exact source-ordered serialization

The [Windows/Node22 read-only single-file reproducer](../sims/lp2_2015_13173_rune_marker_source_tape_sft.cjs) starts with a **literal fictional F token**, then walks source-corrected pages **p0–57** and their unchanged canonical GP29 indices in printed order. It inserts each physically observed large 10/13/23-dot glyph once **immediately after** the preceding number of page-local runes, retaining the 13-dot mark's color. At the exceptional p7 offset194, the black and red thirteen-dot marks are distinct, consecutive events in exactly that source order. The p57 terminal 23-dot glyph becomes the final tape event.

The resulting tape contains exactly **13,173 events**, with **13,136 runes + 36 large punctuation marks + 1 fictional F**, and represents all image-annotated physical page positions without changing ciphertext values. The first p3 rune sits at global tape index **732**: one F + the original first chapter's 729 rune glyphs + one p0 and one p2 13-dot mark. The original p0 red heading ends in a mark at global tape index14. Projecting to genuine rune tokens through p56 gives precisely **13,041** tokens. The source-corrected zero-rune p50 page does not introduce phantom glyphs or displace p51–57.

This is a **structural candidate**, not an authenticated token-to-number assignment. The physical marker counts 10, 13 and 23 happen to fit the GP alphabet's 0–28 symbol space, so literal count-as-symbol is one testable next interface **if** a historical source says punctuation participated. Ink color, any marker-as-stop interpretation, and the treatment of the fictional F are currently unresolved.

## What the result decides

The equal row count is **not evidence that the missing 2015 array exists in this exact encoding**. It cannot reconstruct the absent twelve numerical columns, restore a source-authored second-stage inverse, or decrypt any original LP2 rune. Distinct input conventions could produce the same cardinality; the article's 2015 reported 40 repeated derived symbols were obtained on 729 *unmarked* first-chapter runes and do not license indiscriminate marker insertion into that calculation.

Nevertheless, **an actual 13,173-element original-source input tape is now completely specified**, eliminating a prior uncertainty about a plausible input cardinality. The currently active archival investigator on #1291 can test whether a recovered contemporary script used all page runes, all conspicuous marks, and one initial fictitious F. If a recovered 2015 generator instead demonstrably omitted these elements, reject this serialization immediately; avoid retrofitting new hidden rows or different punctuation families to preserve the numerical equality. Further numerical transforms are gated on an authentic surviving 2015 operand or an original puzzle clue.
