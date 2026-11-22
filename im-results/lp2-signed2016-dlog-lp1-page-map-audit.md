# Signed-2016 GP-prime mod23 discrete-log LP1 page-map audit

**Agent 5, 19 November 2026. Classification: bounded negative for Director task #1840. The arithmetic pattern is reproducible under one literal-tokenization convention, while the proposed LP1 clue-page interpretation fails source namespace and held-out semantic tests. No unknown LP2 plaintext, key, or destination is recovered.**

## Decision

Retire this discrete-log construction as an LP1 navigation engine. The five reported word-to-number equalities are real under literal GP tokenization and the independently reconstructed DH group `p=23, g=5`. Their claimed semantic interpretation does not survive inspection of the source page namespaces. Red `3299` belongs to **LP2 physical p15**, and the `1033/3301` cuneiform labels belong to **LP2 physical pp33–39**. LP1 occupies archive images `00.jpg` through `16.jpg`, so there is no zero-based LP1 p17. Under one-based numbering, page17 is archive image16 and contains the terminal `KNOW THIS` 5x5 numeric square rather than a 1033 clue.

The only advertised target that is genuinely an LP1 content match is exponent/page5, whose solved page states that the primes and totient function are sacred. The other two content matches were produced by conflating LP1 page numbers with distinct LP2 artifacts.

## Exact 43-word map under the reported convention

The signed 2016 cleartext contains 43 alphabetic words after excluding the OpenPGP key ID. Literal longest-match GP tokenization means that only digraphs literally present in the Latin spelling are collapsed. Under that convention, the reported sums reproduce exactly: `MEANING=319`, `ROAD=204`, `NUMBERS=295`, `DIRECTION=337`, and `OPENPGP=249`. Reduce each sum modulo23 and take `log_5` in the multiplicative group.

| i | word | GP-prime sum | mod23 | log5 |
|---:|---|---:|---:|---:|
|0|HELLO|243|13|14|
|1|THE|72|3|16|
|2|PATH|145|7|19|
|3|LIES|224|17|7|
|4|EMPTY|343|21|13|
|5|EPIPHANY|436|22|11|
|6|SEEKS|253|0|undefined|
|7|THE|72|3|16|
|8|DEVOTED|381|13|14|
|9|LIBER|243|13|14|
|10|PRIMUS|212|5|1|
|11|IS|84|15|17|
|12|THE|72|3|16|
|13|WAY|219|12|20|
|14|ITS|143|5|1|
|15|WORDS|179|18|12|
|16|ARE|175|14|21|
|17|THE|72|3|16|
|18|MAP|211|4|4|
|19|THEIR|114|22|11|
|20|MEANING|319|20|5|
|21|IS|84|15|17|
|22|THE|72|3|16|
|23|ROAD|204|20|5|
|24|AND|215|8|6|
|25|THEIR|114|22|11|
|26|NUMBERS|295|19|15|
|27|ARE|175|14|21|
|28|THE|72|3|16|
|29|DIRECTION|337|15|17|
|30|SEEK|200|16|8|
|31|AND|215|8|6|
|32|YOU|113|21|13|
|33|WILL|196|12|20|
|34|BE|128|13|14|
|35|FOUND|130|15|17|
|36|GOOD|120|5|1|
|37|LUCK|102|10|3|
|38|BEWARE|322|0|undefined|
|39|FALSE|292|16|8|
|40|PATHS|198|14|21|
|41|VERIFY|217|10|3|
|42|OPENPGP|249|19|15|

Two source words, `SEEKS` and `BEWARE`, reduce to zero. A discrete logarithm in the multiplicative group modulo23 is therefore undefined for them. The mapping cannot assign every authenticated source word to a page without adding a separate zero rule.

## Tokenization sensitivity

The repository also contains a manuscript-orthography encoder that folds `ING` to the single NG rune and `IO` to the IA rune before tokenization. That convention changes `MEANING` from literal `M EA N I NG = 319` to `M EA N NG = 288`, moving its base5 logarithm from 5 to **20**. `DIRECTION` changes from 337 to 406, although both happen to have residue15 and log17. Thus the strongest pair, `MEANING/ROAD -> 5`, requires the literal-Latin tokenization choice rather than the manuscript spelling convention already used elsewhere in the repository. This ambiguity is part of the model cost.

## Rival-family census

The reproducer charges all ten primitive roots modulo23, GP-prime versus GP0 word numbers, forward versus inverse exponent orientation, zero versus one page origin, and the two tokenization conventions above. The finite family contains **160** parameterizations. Their number of exact matches to the five reported discovery labels `{MEANING:5, ROAD:5, NUMBERS:15, OPENPGP:15, DIRECTION:17}` is:

| exact reported labels | variants |
|---:|---:|
|0|136|
|1|18|
|2|2|
|4|2|
|5|2|

The two 5/5 rows are `(literal, GP-prime, base5, forward, origin0)` and `(literal, GP-prime, base14, inverse, origin0)`. They are one algebraic equivalence class because `14 = 5^-1 mod23`. The source-derived `g=5` therefore does select the expected representative, but the result remains dependent on literal tokenization and zero-origin page labels.

For completeness, a label shuffle over the fixed 43-word page multiset gives the already observed exact five-label arrangement with conditional probability `1 / 7,219,485`. This number is **post-selected** because those five words and page labels were used to notice the pattern. It is retained only as a reproducible control and is not a discovery-level probability.

## Source namespace check

The page-content interpretation fails before any unknown ciphertext is touched. Repository source records establish these locations:

- LP1 is archive `00.jpg`–`16.jpg`, seventeen images. Physical LP2 begins at archive `17.jpg`.
- The red `3299` is the source-visible origin cell of the established **LP2 physical p15** Fibonacci-prime spiral, archive `32.jpg`. It is absent from the solved LP1 p15 reference.
- The `1033/3301` cuneiform pair labels the **LP2 physical pp33–39** visual chapter. LP1 has no zero-based p17. The one-based seventeenth LP1 image is archive `16.jpg`, whose solved reference is the terminal 5x5 `KNOW THIS` numeric square and contains no 1033.

This removes the claimed independent semantic support for `NUMBERS/OPENPGP -> 15` and `DIRECTION -> 17`. Their numbers remain arithmetic facts, while the asserted clue-page meanings came from different manuscript sections.

## Locked source-word diagnostic

Issue comment `7001224329` froze signed word `FALSE` as the no-tuning diagnostic. Its expected semantic class was warning/deception/false-path, motivated directly by the authenticated phrase `Beware false paths`. Under the exact discovery convention, `FALSE` has sum292, residue16, and **log5 = 8**. Solved LP1 p8 is a continuation of the master/student koan, so the prediction misses. Zero/one origin does not repair the discovery convention because origin1 already destroys all five reported page labels.

The adjacent source word `BEWARE` is an even stronger obstruction: its GP-prime sum322 is `0 mod23`, so no multiplicative discrete log exists and the route emits no page at all. No zero exception is introduced after reveal.

The holdout was locked after this invocation had loaded the solved LP1 reference to reconstruct page numbering, so it should be treated as a strict no-tuning diagnostic rather than a pristine blinded experiment. The artifact-namespace contradiction is independent of that chronology.

## Reproduction and next action

Run `node sims/lp2_signed2016_dlog_lp1_page_map_audit_sft.cjs`. The SFT reads the authenticated 2016 signed payload, canonical GP arrays, LP1 solved reference, archive page map, and the established source-location reports for p15 and pp33–39. It asserts the complete 43-word table, both tokenizers, all 160 rivals, the algebraic base5/base14 equivalence, label-shuffle control, namespace facts, and the `FALSE`/`BEWARE` diagnostics.

**Director fork:** close this branch as a page-navigation interpretation. Preserve the arithmetic mapping as an incidental source structure if useful for comparison, but do not use it to select LP1 operations or to justify downstream LP2 decryptions. Any future revival needs a first-party instruction that both fixes the Latin-to-GP spelling convention and names a valid receiver namespace for all source words.
