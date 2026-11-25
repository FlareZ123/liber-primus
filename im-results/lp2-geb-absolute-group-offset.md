# Absolute GEB book-key offsets for shuffled native groups (#2721)

## Decision

The pinned 2014 GEB OCR cannot supply a contiguous additive GP29 key to the printed group inventory under the frozen 10,842-type native register, literal-F nonadvance and 5% OOV per chapter. This is stronger than a contiguous-offset test for this specific intact-group hypothesis: every group was granted an independent arbitrary absolute book offset and either additive sign, yet **only 3 of 300** eligible original long groups have any match in either spelling. All nine chapters exceed their OOV allowances before enforcing ordering, sign consistency or contiguous tiling.

No unknown original plaintext, book offset or key has been accepted. This does not exclude GEB's genuine historical coordinate role, other books, other spellings, H-decoy or other cipher actions.

## Independent source and exact inverse

The authenticated 2014 Fifth Onion used GEB as a coordinate book; that is a historical source selector but not proof of a running key. Reuse precisely the OCR and spelling rules pinned by [#1186](lp2-geb-tablefree-runningkey-original-gate.md), which tested a materially different contiguous unknown-table skip-aware receiver. #1191 concerns two actual 2012 books, not this source. The public OCR Git blob is `da652686147aa1c8585be659c89d0db60c831571`; SHA-256 as previously recorded is `2674287a2f6ccdf9f263451b9e332d57d39af7891090ddc3561b6c5fa7fccf8e`. The exact blob was read through the GitHub connector after the ordinary file endpoint returned no content; no copyrighted source text or substantial key extract is redistributed. The SFT retrieves the pinned raw URL at runtime, validates the SHA-256, and reproduces the existing NFKD / combining-mark removal / greedy GP29 digraph and single-letter normalization. Actual tape lengths 1,399,392 and 1,470,789 agree exactly with #1186.

Use the corrected carry-aware original tape (2,896 groups, 12,956 runes) and the frozen #2678/#2684 lexical register. Each original group with >=8 nonzero ciphertext runes is an eligible long anchor: at least eight key symbols must be consumed under every legal literal-F alignment. For every register word of the same length and each sign, construct the required key substring: plaintext F must produce zero and does not advance; otherwise key digit = sign×(ciphertext−plaintext) mod29. Build an index of query prefixes of length eight (exact integer base29, <2^53), then scan **every** book start, matching each full required suffix exactly. The matching set includes absolute offset, exclusive end, sign and native word. No source offset grid, approximate string score, target-derived register or alternate OCR. This necessary-condition relaxation covers every possible ordering of the complete groups.

## Native offset and relative order controls

Six independently encrypted 100-group donor-tail plants from three donors and two source spellings, using disjoint absolute book intervals and both signs, then whole-group shuffled. The first eligible donor-tail window with <=5 OOV and >=4 in-register eligible anchors was selected by a frozen rule. Training lexicon does not include those donor-tail passages. The solver is given neither their interval nor key sign.

| Spelling / donor | Eligible in-register anchors | True absolute word/offset matches retained | Unique true sign, word and absolute offset |
|---|---:|---:|---:|
| Digraph Gibran |4|4|3|
| Digraph Shakespeare |7|7|6|
| Digraph Emerson |4|4|2|
| Letters Gibran |4|4|2|
| Letters Shakespeare |7|7|3|
| Letters Emerson |4|4|1|
| **Total** |**30**|**30**|**17**|

The 17 unambiguous anchors recover exact absolute offsets and relative source order. Other anchor domains have up to 103 word/offset/sign alternatives, including repeated book substrings; the four eligible OOV control groups yield no false match. Whole-passage ordering and complete interval identification are not demonstrated by this anchor-only calibration. Because the exact necessary original gate fails, no costly full tiling or short-group search is warranted.

## Original results

| Physical chapter | Total groups | Eligible anchors | Digraph covered | Letters covered | 5% OOV allowance |
|---|---:|---:|---:|---:|---:|
| 0–2 |158|18|1|0|7|
| 3–7 |255|24|0|0|12|
| 8–14 |383|40|1|1|19|
| 15–22 |437|44|0|0|21|
| 23–26 |224|22|0|0|11|
| 27–32 |326|33|1|1|16|
| 33–39 |378|39|0|0|18|
| 40–53 |669|70|0|0|33|
| 54–55 |66|10|0|0|3|
| **Total** |**2,896**|**300**|**3**|**2**|**140**|

The two letters-supported anchors are the same two already supported by digraph mode. Even granting arbitrary spelling **per group**, arbitrary sign and independent starting offsets, 297 eligible originals require OOV, greater than the sum of per-chapter allowances 140. Each chapter individually fails. The three incidental matches are not authenticated plaintext or offsets and do not jointly justify a source interval.

The combined query workloads (original and controls) contain 539,980 and 539,972 full candidate strings, with 529,868 and 529,860 distinct 8-digit prefixes. All starts 0..length−8 are scanned (1,399,385 and 1,470,782 starts), with full suffix confirmation. A legal match consuming >=8 key values cannot lie outside this domain.

## Reproduction and decision scope

[CommonJS SFT](../sims/lp2_geb_absolute_group_offset_sft.cjs) · [raw outputs](lp2-geb-absolute-group-offset-output.json). Connected JS runtime executed the core against the pinned Git blob; Node wrapper performs runtime source-hash verification but was not independently executed. No CI claimed. Retire this exact pinned GEB canonical additive literal-F postshuffle source tape within the frozen vocabulary/OOV model. An unknown alphabet, skip law, other OCR, missing separators or noncontiguous source extraction is a separate hypothesis requiring independent evidence. 
