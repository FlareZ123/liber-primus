# 2014 Stage11 HTML 133/331: 36-rune p0 corridor and 56-node table-tree root

**22 November 2026, Agent12. Classification: two retrospective source-to-source navigation candidates with a fixed literal inverse negative. No unknown LP2 plaintext, key, cipher rule or final destination recovered.** A single pair of historically preserved 2014 identifiers supplies (a) an eight-word, 36-rune original-p0 receiver and (b) a separate prime-factor route to the earlier established 56-node table predecessor tree. The existing table zero-bracket and punctuation count were discovered previously and remain candidate-level.

## Starting artifacts and intended-operation hypothesis

The preserved [2014 Stage11 distribution HTML](../resources/historical/stage11-2014-index.html) prints literal `<title>133</title>` and `<div id="331">` around its 58 JPEG links. The [original participant Git manifest](../resources/historical/stage11-2014-index-manifest.json) dates the archived file to **11 May 2014**; this establishes the historical participant copy, **not** that a PGP-signed author instruction chose these numbers as numerical-table indices. The actual LP2 physical pp49–51 print a **32-row × 8-column table** of 256 two-character sexagesimal tokens, reproduced as [base60-grid.json](../resources/liber-primus/base60-grid.json). The unknown physical page p0 is the original GP29 ciphertext in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), with its 59 printed words independently delimited by [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt).

**Single proposed address rule:** interpret both historical HTML integers as zero-based addresses into the printed 256-cell table, reduce each modulo256, and interpret the resulting base60-decoded byte as an **original p0 zero-based rune offset**. This is reversible as an address lookup only where bytes and addresses are retained; it is not a proposed cryptographic inverse. Both receiver offsets happen to lie at exact word beginnings:

```text
2014 index.html <title>133</title>    -> table[133]     = 141
2014 index.html <div id="331">         -> table[331%256]  = table[75] = 177
original p0 rune offsets              -> 141 and 177
p0 zero-based printed-word ordinals    ->  32 and  40
entire enclosed words                 -> 8 words, lengths 4/6/3/4/8/7/3/1
entire enclosed p0 ciphertext        -> runes 141..176, exactly 36 runes
```

The upstream rule is motivated by the visible numerical table and numeric identifiers in the original delivery HTML. Its unsupported premise is decisive: **neither artifact says to apply modulo256, use the cell value as a page-rune offset, or choose p0 as the receiver**. These choices must be independently selected before claiming an intended solve route.

## Distinct historical six-digit-palindrome route to the 56-page tree

The HTML `title=133` and `id=331` also concatenate **in original printed order** into `133331`, a six-digit decimal palindrome. Complete integer factorization is

```text
133331 = 11 × 17 × 23 × 31
       = GP primes(R, G, H, I)
GP prime sum of derived 4-rune sequence RGHI = 82
original base60 grid[82] = 201
grid[82] = 201, incoming predecessor branches at201 = [82, 128]
reverse descendants: 82-rooted branch = 50, 128-rooted branch = 5
reverse descendants of201 = 50 + 5 + 1 = 56
```

All four *distinct* factor primes are in the original **29-symbol Gematria Primus alphabet**. This factor-sum lookup independently reaches **node201**, previously selected by the p57 PARABLE prime-ordinal structure; see [p57 tree/consumer gate](lp2-p57-tree56-pagekey-original-gate.md). Exactly **50** rune-bearing pages lie before numeric-only p50; exactly **five** rune-bearing pages follow it through p55. Treating the 56-node reverse subtree as a possible page map therefore matches the printed **50 + 1 + 5** structure, independently of choosing any plaintext. In the other concatenation direction, `331133=11×30103`, which is *not* a product of GP29 primes.

The same two identifiers have a simpler numerical property, `133+331=464=58×8=29×16`, tying the release's 58 images and the table's eight columns to its 29-symbol GP29 alphabet. This arithmetic is exact but has many possible interpretations.

### Conditional five-rune **RIGHT** reading

The four GP factors have canonical GP29 prime ordinals **[4,6,8,10]** in zero-based notation (the **5th, 7th, 9th and 11th consecutive prime ranks**) and rune values `R,G,H,I`. An [independent mathematical curiosity catalog](https://t5k.org/curios/page.php/133331.html) explicitly describes **133331** as a palindrome formed by multiplying alternating primes in a consecutive sequence. That is a real non-Cicada mathematical property and a conceivable reason to select these HTML numbers. The catalog excerpt does not date the observation to before the 2014 puzzle or authenticate the subsequent RIGHT reading. The 2014 HTML source presents the two three-digit operands in reversed order. As an explicit *candidate* inversion, read the sorted GP-prime factors **outside-in**, alternating leftmost, rightmost, next-left and next-right, then append the GP-index rune supplied by the additive half-sum quotient:

```text
factor(133331) = [11,17,23,31] -> GP runes [R,G,H,I]
outside-in indices  [0,3,1,2]   ->           [R,I,G,H]
(133+331) / 29 = 16             -> GP-index16 = T
candidate token                -> RIGHT

independent algebraic route to the final T:
factor sum 82 -> original table[82]=201 -> table[201]=74
74 mod29 = 16 -> GP-index16 = T -> again RIGHT
```

The same original table byte **74** at address201 had already been independently noticed in the [2014 magic-square, DH3301 and p57 root bridge](lp2-2014-133331-dh3301-p57-table-bridge.md): `1033^133 mod3301=74`, and p57's last prose clause has one-based GP-prime ordinal201. The present factor-sum route reaches that same preexisting address and value, and the GP residue of the value reproduces the final letter of the additive half-sum method. These are **different arithmetic paths from overlapping source numerals**, so they strengthen the specificity of the candidate decoder without becoming statistically independent evidence that RIGHT was authored.

The entire standard-GP conversion is computable from source-supplied numerals without any LP2 unknown plaintext crib or trained alphabet, and **RIGHT** has a directly relevant meaning as a direction. The later signed-2016 words/numbers/direction message and solved p57's language about shedding circumferences offer possible human clues to a directional or outside-in reading, but they do not actually specify this four-factor interleave or instruction concatenation.

Under the already frozen all-900 six-digit-palindrome census, **133331 alone** is a product of four **distinct GP29 primes** whose two decimal three-digit halves have a sum divisible by29. It is also the unique one whose factor sum addresses table root201 (see below). These are two exact arithmetic selectivities **within the chosen palindrome/factor family**. Since both factorizations, the quotient and the factor ordering were recognized after inspecting the same values, this cannot establish that the author encoded RIGHT. It **is a concrete candidate source-derived instruction** whose consequence must be tested against independent, unmodified ciphertext without reordering factors to fit another word.

RIGHT may hypothetically choose the right branch of the 50+1+5 source tree, a rightward register traversal or a right-facing page element; those interpretations are currently unresolved. A normal additive GP29 inverse using the adjacent 36-cell bracket already fails (below), so the token is not a key or plaintext decryptor by itself.

**Complete narrow comparison:** among all **900** six-digit palindromes, **175** factor entirely over the 29 canonical GP primes. Exactly **nine** are products of four distinct such primes. **Only 133331** has both (a) the two original three-digit operands summing to a multiple of29 and (b) a factor sum whose **unmodified original base60 table value is201**. This is a descriptive complete family, with source-supplied 201 as a previously investigated tree root. It does not calibrate the massive choice space of other integer operations or target nodes; retroactively selecting concatenation, factorization, prime sum and byte-address lookup prevents assigning it a discovery-wide significance.

### Two independent original artifacts land on opposite root branches

The actually **clear** p57 PARABLE says `WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIUINITY WITHIN AND EMERGE`. Its original word `DIUINITY` has the eight GP symbols `D I U I N I T Y`. Removing the two circumference symbols leaves `I U I N I T`, whose canonical **GP-prime sum is184**, with no fitted rune or ciphertext letter. The original table then gives `B[184]=128`, `B[128]=201`.

By the independent HTML-palindrome factor route, `11+17+23+31=82`, and `B[82]=201`. At node201, the original table has precisely **two immediate predecessors:82 and128**. Thus the HTML factor sum82 selects its **50-node predecessor branch**, and p57's original *self-referential word interior* selects node128 (the **5-node branch**) through the one-step address184. The single shared table node201 connects both source-selected branches, with group sizes **50+1+5**, matching physical p0–49/p50/p51–55.

```text
2014 HTML 133331 -> GP factors 11,17,23,31 -> sum82  --> B[82]=201
                                                                 ↑
p57 clear DIUINITY -> interior I U I N I T -> sum184 -> B[184]=128
                                                   then B[128] = 201
```

The p57 directive to shed circumferences makes the *word interior* operation more strongly clue-constrained than an arbitrary arithmetic guess. The HTML's concatenation/factorization premise still needs independent authorial selection, and the p57 self-referential interior was known before this report. The resulting **complete two-branch original-source correspondence** is newly assembled here. Its strongest open gap is **a unique, plaintext-producing direction/order/key consumer for the 56 page nodes**. It is useful as a possible book map rather than as a decryption by itself.

**Strongest remaining assumption:** nothing in the 2014 HTML explicitly directs a reader to concatenate the identifiers, prime-factor the palindrome, use GP prime sums, or interpret the byte as a graph root. The 2014 original HTML is a participant-preserved artifact rather than a contemporaneous signed instruction. The branch sizes provide a plausible *page index architecture*, while the missing key and node-to-page ordering still prevent a decipherment.

## The 36-element bracket and nested word-number addresses

The table prints literal `00` *only* at addresses **192** and **229**, with **36** nonzero byte cells strictly inside, indices193..228. The original image-annotation source [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json) counts **36** large 10/13/23-dot punctuation marks across the entire release. Those two correspondences and several source-derived paths into the bracket predate this investigation; see the authoritative [established bracket context](lp2-grid-two-zero-address-36-punctuation-bridge.md). The new corridor offers a distinct **p0 word-number bridge** back to its exact endpoints.

Using the standard GP0 sum (sum of canonical 0–28 rune indices) for each of the eight newly selected original ciphertext words, then interpreting the sum as another table cell address gives:

| p0 word (zero-based) | p0 start | Length | Ciphertext GP0 | table[GP0], base60 byte |
|---:|---:|---:|---:|---:|
| 32 | 141 | 4 | 62 | 124 |
| 33 | 145 | 6 | 91 | 49 |
| 34 | 151 | 3 | 22 | 59 |
| **35** | **154** | **4** | **83** | **193** |
| 36 | 158 | 8 | 96 | 222 |
| **37** | **166** | **7** | **101** | **229** |
| 38 | 173 | 3 | 50 | 47 |
| 39 | 176 | 1 | 28 | 150 |

Thus two of eight input-defined words uniquely land on **193, first strictly enclosed cell**, and **229, right-hand zero delimiter**, under the GP0→table-byte reading. The original source supplies no principle selecting words35 and37 ahead of inspecting those outputs. Their shared first GP rune Y is another literal source observation but is insufficient to authenticate the address grammar. The 2016 authenticated words/numbers/direction message can motivate the numerical lookup, yet it does not prescribe GP0, the page, or the output type.

## Complete same-source address controls

A control enumerates **all 256×255 = 65,280 distinct ordered table-cell pairs**, fixes the exact unmodified p0 word-start inventory, and asks which pairs return (1) two p0 word beginnings, (2) exactly **eight** complete word boundaries apart, and (3) exactly **36** ciphertext runes apart.

- **4,556** table pairs return two word starts.
- **75** table pairs return word starts eight words apart.
- **15** table pairs also span exactly 36 ciphertext runes.
- Those 15 pairs cover just five distinct value pairs: `13→49`, `20→56`, `141→177`, `192→228`, and `201→237`.

The historical title/id pair selects **141→177**; this is distinctive *within the defined exact table/address family*. This conditional count is **not an authorship p-value**: the 133/331→table→p0 operation, the eight/36 targets, and the bracket tie were identified retrospectively, against a large preexisting field of explored numbers and routes.

## Fixed literal key consumers and negative inverse

The source-defined 36 table bytes at cells193–228 align one per original p0 rune at offsets141–176 without inserting or deleting symbols. The first natural hypothesis is ordinary GP29 additive decoding: `P[i]=(C[i]−table[193+i]) mod29`. This gives the exact 8-word, unchanged-boundary output:

```text
NTHWT FOELYMJ RSP SEAD SOWGXGDAE DSPTNBU EAOEO F
```

It is not coherent English. Exact inverse replay restores all 36 original ciphertext runes, while a 36-rune known-clear p57 positive encrypts and decrypts correctly with that fixed byte key. Independent preliminary checks with the opposite sign, both directions, base60 high/low digits, ragged eight-column byte transposition, differential/integral byte keys, simple GP-prime and GP-index byte XOR and 36 mark-derived keys also fail to produce a legible complete plaintext. These are **finite negative checks**, not evidence that every keyed or source-guided use of these objects is impossible. Do not optimize more unselected key variants on this 36-rune window.

## Research decision

**Preserve the historical HTML→table→p0 eight-word corridor, paired GP0→zero-bracket endpoints, candidate outside-in RIGHT token, and HTML-palindrome→GPprime-factor-sum→tree-root201 route as one candidate source-navigation frontier.** The first supplies an exact original ciphertext receiver and 36-byte register; the second supplies the already-studied 50+1+5 page-tree grouping from a different source-anchored start. Neither gives the original operation mapping table values to GP plaintext. Do **not** promote these retrospective correspondences into an authenticated route without a source-selected lookup convention, reproducible ordering and a complete original-cipher decryptor. The immediate high-value fork is an original instruction or external historical witness selecting how the 36 table cells relate to the eight intact p0 words, or a source-licensed mapping of p0 word-number outputs to untouched ciphertext. A second straightforward key sweep would add little evidence.

**Exact Windows Node22 standalone test:** [`sims/lp2_2014_html133331_p0_36word_corridor_sft.cjs`](../sims/lp2_2014_html133331_p0_36word_corridor_sft.cjs). It asserts the release HTML identifiers, the original p0/word parsing, table bytes, both nested bracket addresses, every one of 65,280 table-pair controls, the two independently original-source selected 50+5+1 reverse table-tree branches, all 900 six-digit palindrome controls, the two convergent but unauthenticated RIGHT letter readouts, and a reversible known-clear positive. Source paths and all 15 exact matches are pinned. The source-derived numerical assertions were independently run on the fetched GitHub original inputs. **Native Windows Node22 CI PASS:** [manual reusable SFT run 44972882586](https://github.com/FlareZ123/liber-primus/actions/runs/44972882586); all original corpus assertions and synthetic inverse controls passed.
