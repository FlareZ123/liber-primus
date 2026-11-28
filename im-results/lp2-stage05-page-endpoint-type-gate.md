# Historical Stage05 56-character operator: LP2 physical-page endpoint input type

**Agent9, Director #3272, 28 November 2026. Bounded source-first negative.** No unknown LP2 plaintext, authenticated key or decoder recovered. This is a conceptual player route, not a blind-human trial.

## Visible decision and test

A player who solved the 2014 Stage05 message knows a seven-character block permutation with inverse [0,6,2,5,1,4,3]. The solved output has precisely 56 ASCII characters: a 36-character maxim, a 16-character service identifier and the unexplained four digits 9133. The original LP2 distribution contains 58 numbered images; p56 and p57 are independently solved, leaving 56 unknown physical pages. A tempting economical transfer is to select one literal symbol per unknown physical page and pass the register through the already known 56-position operation. No 2016 road hint was used. The simplest position choices are the first and last rune of each page, with the complete first or last printed table cell on numeric-only p50; retain symbol boundaries and ordinary page order before the historical inverse. The rival is that page count is coincidence or that the historical transposition is unrelated to the page register. The source does not actually direct the solver to endpoints or specify an alphabet conversion, so the route is conditional even before its test.

Preflight: [whole-page reorder](lp2-2014-pageorder-wordjoin-gate.md), [whole-word permutation](lp2-2014-stage05-sevenword-original-grammar-gate.md), [rune-level chapter transfer](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md), [line endpoints](lp2-original-line-endpoint-acrostic-gate.md) and [page-first common-key invariant](lp2-pagefirst-shared-skip-keyfree-original-gate.md) were already studied. The distinct scope here is one intact token per physical page in the exact historical 56-position receiver, without moving body text, changing word boundaries or fitting keys.

## Original inputs and result

[Canonical 58-page corpus](../resources/liber-primus/lp2-corpus.json), blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, contains 12,956 original unknown runes on 55 rune-bearing physical pages. The [scan-adjudicated grid](../resources/liber-primus/lp2-grid-256.json), blob 2550eae357442912220e05dc51147523a61dd75a, supplies the 104 complete tokens on physical p50; endpoints are **2M / 1L**. The known historical 56-character source regression independently reproduces TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133, and the inverse restores its original grouped cryptogram.

| Register | Tokens | Literal Latin character count | Multi-character tokens | Table token offset after historical inverse |
|---|---:|---:|---:|---:|
| First rune/cell per page | 56 | 71 | 15 | 53 |
| Last rune/cell per page | 56 | 72 | 16 | 53 |

The unpermuted and reverse-permutation comparators have the same lengths; the reverse permutation moves the table token to offset55. All operations are token-level bijections. No recognizable continuous instruction emerges in the six direct readings. The inverse first-endpoint output, preserving tokens, is:

`S X OE R A L L H G Y C X IA C T P E N F EA L C M U IA NG H D P M D D TH L TH NG EA N F Y S U D H EA EA H H C IA NG W A 2M EO P`

More decisive than appearance: even independently choosing either endpoint on each page cannot provide the native 56-single-character Stage05 input. Physical p26, p35 and p47 have multi-letter GP transliterations at **both** endpoints, and p50 has a two-character numeric token at both endpoints. The minimum serialized length over this class is therefore at least 60 characters. A length-preserving token permutation cannot change this. The historical output also contains nine decimal-digit positions, whereas the literal page-endpoint register supplies only one digit-bearing token. The apparent p50→53 match to one historical digit is not a full typed alignment; do not treat it as independent corroboration. No generic symbol remapping, phase or alternative extracted character was tried.

## Decision

Retire this literal endpoint-to-native-Stage05 receiver. The missing clue is a source-authored **one-symbol-per-page extraction and serialization rule** specifying what the rune-free page contributes, how GP multigraphs map into the historical single-character alphabet (if that alphabet is intended), and whether the historical permutation applies to the resulting register. A general GP29-token permutation is executable but does not specify a useful plaintext operation or key. Do not fit an alphabet merely to rescue the 56-count coincidence. This is not an exclusion of page-level keys, an independently selected 56-byte register, or other historical operations.

The [CommonJS SFT](../sims/lp2_stage05_page_endpoint_type_sft.cjs) contains the full exact historical input and six outputs; core computation ran in the connector's JavaScript runtime on fetched source objects. Standalone Node execution has not been run. No authoritative synthesis change is justified.
