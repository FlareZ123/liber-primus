# GP29 historical rune-operation gate: Hastières Futhorc cipher rejected

**Status:** bounded negative; no LP2 plaintext claim. The strongest pre-2014 Anglo-Saxon rune-cipher analogue found does not define a reversible operation on all 29 GP symbols and is not selected by an LP2 clue. Unknown pages were not used to tune it.

## Candidate and source

The candidate is the three-block Futhorc substitution documented in *The Metropolitan Museum of Art Bulletin*, vol. 26, no. 10 (June 1968), figures 13–15 and accompanying text (printed pp. 422–423). The article describes a medieval Hastières Psalter cipher using a 33-rune Anglo-Saxon Futhorc to encode a 24-letter Latin alphabet with K and W omitted.

The source's 24-letter order is:

`A B C D E F G H | I J L M N O P Q | R S T U V X Y Z`

The source divides it into three blocks of eight and specifies these position-dependent offsets in the Futhorc row:

- Block 1: use the preceding rune; A stays at its corresponding rune because there is no predecessor.
- Block 2: use the third preceding rune.
- Block 3: use the fourth preceding rune for the first four letters (R, S, T, U); use exact counterparts for the final four (V, X, Y, Z).

The inverse on this 24-letter domain is therefore: restore the corresponding rune in each block by advancing one, three, or four positions respectively, leaving A and the final four unchanged. This is a genuine, source-documented, reversible rune substitution on its stated 24-letter domain.

Source: https://resources.metmuseum.org/resources/metpublications/pdf/The_Metropolitan_Museum_of_Art_Bulletin_v_26_no_10_June_1968.pdf

## Why it does not give a GP29 mapping

The historical operation is defined for 24 Latin letters, not for the 29 distinct symbols in Gematria Primus. It uses only 24 rune correspondences from a 33-rune Futhorc, so at least five GP29 symbols lie outside its output set. The GP29 also includes five additional Old English rune symbols (A, AE, Y, IA, EA), but the Hastières source gives no 29-symbol extension or rule for assigning these additional symbols. Extending the mapping by inventing a fourth block, assigning unused runes, or collapsing distinctions would not be the documented operation.

The only potentially selecting visible feature is that LP2 uses an Anglo-Saxon-derived runic alphabet. That identifies the broad tradition, not this particular 3×8 partition or its 1/3/4-position offsets. LP2 shows no corresponding block labels, boundary marks, or rune-to-Latin correspondence table. The 2016 wording about words, meanings, and numbers does not select these specific offsets.

## Intact p56 control

The repository's original corpus, `resources/liber-primus/lp2-corpus.json`, records physical page 56 as 85 runes containing **all 29 GP symbols**. The F rune occurs five times. The authoritative synthesis, `results/README.md`, records the independently solved p56 reading as the prime-totient decode with F treated transparently.

The Hastières operation cannot process the complete p56 symbol inventory because its documented mapping is only 24-wide. It also treats F as an ordinary member of its substitution alphabet; it has no source-defined transparent-F exception. It therefore fails the intact solved-page control before any unknown LP2 text is considered.

## Decision

No pre-2014 documented rune graphical/substitution operation was found that both preserves all 29 GP distinctions and supplies the p56 transparent-F behavior. The Hastières cipher is retained only as a historical 24-letter analogue, not as an LP2 hypothesis. Do not apply it to unknown pages. No change to `results/README.md` is warranted because this is an exclusion, not an established decryption.
