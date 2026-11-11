# 2013 forest clue → 2016 tree → LP2 botanical-block aggregate gate

**Status:** source-authenticated clue plus a reproducible candidate block selector; no unknown plaintext, key, or cipher recovered.

## Why a human solver could select this block

The preserved 2013 first-onion artifact, [cicada2013-forest-clue.asc](../resources/historical/cicada2013-forest-clue.asc), says: “You can't see the forest when you're looking at the trees.” Its OpenPGP clear-signature verifies with the repository's Cicada public key. GnuPG reports a good signature from key ID 181F01E57A35090F, fingerprint 6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F; trust is unknown. The signature is dated 6 January 2013. The file is preserved from the public [neuroretransmit/cicada first-onion archive](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/clue.txt.asc).

The independently authenticated 2016 4gq25 message says Liber Primus is the way and its words are the map, their meaning the road, and their numbers the direction. Its carrier is a 563×569 tree image. The 2013 and 2016 messages use the same Cicada signing-key ID. The existing original-image audit already establishes that the identical botanical side-border template spans 16 consecutive LP2 pages; the side strips are pixel-identical while the central page content differs ([border audit](lp2-floral-border-template-audit.md)). This makes an aggregate reading of the tree-framed section a plausible human next step after the 2013 clue, without assuming that the border itself carries per-page state.

## Correct physical-page mapping

The full repeated-border span is **physical LP2 pp40–55 = archive JPEGs57–72**, 16 consecutive images. It is not a 15-image span.

The canonical rune transcript omits numeric-only physical p50 (archive JPEG67). Its 15 transcript segments 40–54 therefore map to physical pages **40–49 and 51–55**, archive JPEGs **57–66 and 68–72**. These are the 15 rune-bearing pages inside the 16-image botanical block. Physical p50 / image67 is a numeric table, not an empty image. The mapping is fixed by the existing parser's physicalLP2Page function and the canonical corpus.

## Reproduced counts and their definitions

Across those 15 rune-bearing pages:

| Quantity | Count | Interpretation |
| --- | ---: | --- |
| Gematria Primus runes | **3,316** | Exact source-transcript count |
| Canonical logical words | **735** | The shared parser merges typographical line and page continuations |
| Slash-normalized page fragments | **747** | Page-local fragments after the parser's slash handling |
| Raw whitespace/hyphen fragments | **810** | Splitting every whitespace and hyphen boundary, including visual line breaks |

The cleanest numerical relation is **3,316 = 3,301 + 15**, where 3,301 is printed in the signed 2013/2016 Cicada messages and 15 is the number of rune-bearing pages in the selected 16-image span. This is a candidate aggregate checksum, not a cipher key.

A second exact relation is **810 = 45 × 18**. The 2016 signed body has 45 whitespace-delimited tokens (43 natural-language words plus the tokens 3301 and 7A35090F); the carrier height gives 569 mod 29 = 18. The 810 count is specifically the raw whitespace/hyphen fragment count. It is **not** the canonical logical word count: that is 735. The 810 relation may be a layout-level clue, but it depends on treating line breaks as fragment boundaries. The script checks all 15-segment windows across the 57 text-bearing transcript segments; the pair (3,316 runes, 810 raw fragments) occurs only at segments 40–54 under this fixed counting convention.

## Frozen direct 45×18 readout: negative

A minimal direct interpretation is to arrange the 810 fragments as 45 groups of 18, one group per 2016 body token, then let each token's number select one of the 18 positions:

- Alphabetic tokens use the repository's longest-match GP transliteration and prime weights, including its existing v→u, k→c and z→s normalizations.
- The decimal token 3301 uses its decimal value.
- The hexadecimal key-ID token 7A35090F uses its hexadecimal value.
- The selector is value mod 18. Both 0-based and 1-based indexing are tested.
- Both natural layouts are tested: 45 contiguous groups of 18, and 18×45 row-major columns.

All four frozen outputs are nonlinguistic; none yields readable plaintext. The exact selected fragments and transliterations are emitted by the reproducer. This rejects only the direct GP-prime-sum/decimal/hex mod-18 selector under these two layouts and index bases. It does not exclude a different source-selected use of the 45×18 structure.

## Frozen 16×16 p49–p51 table → page-key schedule: negative

The 256-cell numerical grid spans LP2 pp49–51, all inside the selected botanical block. A natural but unproven alignment is to flatten its printed 32×8 order row-major into 16 rows of 16 bytes, then assign row i to physical page 40+i. This gives one 16-symbol page key for each of the 16 border pages; the row assigned to numeric-only p50 is unused. Reduce each byte modulo 29 and repeat that row from offset zero within its page. This is a cheap test of the 16-page/256-cell coincidence, not a source-authenticated instruction.

The fixed test covers both established radix interpretations of the table (base60 and base59) and both additive directions, C−K and C+K. It does not fit phases, page permutations, table transpositions, or alternate reducers.

| Table radix | Operation | Output IoC | First 30 transliterated symbols |
| --- | --- | ---: | --- |
| Base60 | C−K | 0.03446938 | FIYXAEESEAMAEOWOEHMDEBEATICGO |
| Base60 | C+K | 0.03437568 | FHEONTEAGBFUAETDTHEOESXJUSYJCW |
| Base59 | C−K | 0.03443808 | OXFBYOEBTHLFCJYHOEYNGNGTHMJNHA |
| Base59 | C+K | 0.03446792 | YRNGSARXEAYDEOMTCNSJJHFJAHRORL |

The raw 3,316-rune block has IoC **0.03446283**, essentially unchanged. The solved p57 first-43-body-rune control has IoC **0.056478**. None of the four page-key outputs has a readable prefix or language-like distribution. The SFT includes a synthetic per-page encrypt/decrypt round-trip for both radix schedules; those controls validate the arithmetic only, not the proposed key assignment.

Reject this specific row-major 16×16, one-row-per-page, repeated additive GP29 schedule. The 16×16 reshape and page assignment are not prescribed by the source; do not rescue the result with free phases, row/column permutations, or alternative byte reductions. This does not exclude a different, independently source-selected use of the numerical grid.

## Decision

The 2013 forest clue motivates a **separate aggregate-block hypothesis**: the botanical span pp40–55, containing 15 rune-bearing pages plus the numeric p50 table. The 3,316 = 3,301 + 15 relation is exact and source-constrained enough to preserve. The 810 = 45×18 relation is weaker because it uses raw line/whitespace fragments rather than canonical words. Two obvious direct readouts—the 45×18 token-index selector and the 16×16 p50-table page-key schedule—do not recover text.

This does **not** overturn the existing negative result for a unique path through the p32 tree illustration. The forest clue does not identify a p32 root, start, order, direction, or endpoint. Do not expand this branch into arbitrary permutations, semantic dictionaries, or unconstrained matrix searches. Continue only if an independent original clue selects a precise mapping or reversible operation.

## Reproduction

Run:

    node sims/forest_45x18_selector_sft.cjs

Verify the 2013 source signature:

    tmp=$(mktemp -d)
    gpg --homedir "$tmp" --batch --import resources/historical/cicada-3301-2012-public-key.asc
    gpg --homedir "$tmp" --batch --verify resources/historical/cicada2013-forest-clue.asc
    rm -rf "$tmp"

The signature verifies as a good signature under the repository key; GnuPG reports trust as unknown. The source artifact and the 2016 signed message are separate from the derived counts and exploratory selector.

**Inputs:** the preserved 2013 clue and 2016 signed payload; original 2016 JPEG; canonical LP2 transcript/corpus; shared word parser.  
**Related work:** [floral-border image audit](lp2-floral-border-template-audit.md), [2016 signed-message word map](lp2-2016-signed-message-base58-word-map.md), [2016 tree JPEG structure audit](2016-tree-jpeg-structure-gate.md), and [2016 source gate](lp2-tree121-signed2016-source-gate.md).
