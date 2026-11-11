# 2016 signed-message base-58 word map

**Status: provisional source-constrained hypothesis; not a decryption.**

## Hypothesis

The 2016 signed message says:

> Its words are the map. Their meaning is the road, and their numbers are the direction.

The 16 words in that sentence can be treated as book-cipher tokens. For each word:

1. Transliterate it with the repository's canonical `corpus.translit` table.
2. Sum the corresponding Gematria Primus prime weights.
3. Split the sum in base 58:
   - page = remainder (the original LP2 image archive is pages 0–57);
   - word index = quotient (zero-based).

The original 58-page count is source-defined by the 2014 LP2 image set; page 50 remains a page even though it is a table rather than a text page. In the canonical master transcription, those LP2 pages are scans 17–74 (1-based).

This is a candidate interpretation of “words are the map” and “numbers are the direction.” The source does not explicitly state the quotient/remainder order or word-index origin, so those remain assumptions.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_2016_message_base58_word_map.cjs
```

The script reads the canonical GP corpus, physical-word transcription, historical master (only for a regression comparison), authenticated signed 2016 payload and printed numeral table:

- `resources/liber-primus/lp2-corpus.json`
- `resources/lp2-transcription.txt`
- `resources/transcriptions/liber_primus_master.txt`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `resources/liber-primus/lp2-grid-256.json`

It asserts the 58-page LP2 slice, physical word segmentation, each frozen signed address, the FOLD and independently solved END anchors, a new two-step book-pointer connection, and the p32 source-image checksum.

## Word-by-word addresses

The canonical corpus transliteration gives these prime sums and zero-based page/word addresses:

| 2016 message word | GP prime sum | LP2 page | Word index | Selected LP2 word |
|---|---:|---:|---:|---|
| Its | 143 | 27 | 2 | `ᛚᛋᚳᛈ` (LSCP) |
| words | 179 | 5 | 3 | `ᛁᛝᚩ` (INGO) |
| are | 175 | 1 | 3 | `ᚳᚱᚦᛡ` (CRTHIA) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| map | 211 | 37 | 3 | `ᛏᛠᛈᛉ` (TEAPX) |
| their | 114 | 56 | 1 | `ᛟᛋᚱ` (OSR) |
| meaning | 319 | 29 | 5 | `ᚫᚻᚪ` (AEHA) |
| is | 84 | 26 | 1 | `ᚩᚾᛠᚩ` (ONEO) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| road | 204 | 30 | 3 | `ᛖᚣᛟᚣ` (EYOY) |
| and | 215 | 41 | 3 | `ᚩᚾᛏᛚ` (ONTL) |
| their | 114 | 56 | 1 | `ᛟᛋᚱ` (OSR) |
| numbers | 295 | 5 | 5 | `ᚷᛞᚹᚪ` (GDWA) |
| are | 175 | 1 | 3 | `ᚳᚱᚦ` (CRTH) |
| the | 72 | 14 | 1 | `ᚠᚩᛚᛞ` (FOLD) |
| direction | 337 | 47 | 5 | `ᛒᛋᛏᚫᚾᚱᛁ` (BSTAENRI) |

All 16 addresses are in bounds. Repeated source words repeat the same destination: “the” maps three times to p14 word 1, and “their” maps twice to p56 word 1.

## Two nontrivial anchors

### “the” → FOLD

`GPsum("the") = 72 = 58 × 1 + 14`, so the address is p14, word index 1. That complete rune word is `ᚠᚩᛚᛞ`, transliterating exactly to **FOLD**.

It is the only occurrence of that complete four-rune word among the 56 unsolved LP2 pages (p0–p55). It is the second word on p14, whose illustration includes a tree and a dragonfly. This is a potentially actionable fold clue, but it is not yet proven plaintext; it could still be a ciphertext coincidence.

### “their” → END

`GPsum("their") = 114 = 58 × 1 + 56`, so the address is p56, word index 1. The selected ciphertext is `ᛟᛋᚱ`.

This is independently checkable against the established p56 totient-prime decryption. The word begins at rune offset 2 (the first word, AN, occupies offsets 0–1). The next three prime values are 5, 7, 11; subtracting their totients 4, 6, 10 from ciphertext GP indices [22, 15, 4] modulo 29 gives [18, 9, 23] = **END**.

Thus the repeated source word “their” maps twice to the verified plaintext word END on the solved p56 page. This is a real positive control, not a proposed decryption of an unsolved page.

## Complete signed-message prediction: the word “lies” selects the rune-free table

The base-58 rule above was first tested on the conspicuous 16-word sentence and its FOLD/END anchors. **Freeze the same modulus, quotient/remainder convention, GP tokenization, and zero-based indexing**, then apply it without fitting to every word in the *entire authenticated 2016 clear-signed message*, from `Hello.` through `Verify OpenPGP 7A35090F.`. A word-boundary regex finds **43 natural language words**; naively counting alphabetic subsequences finds 45 because the hexadecimal fingerprint contributes spurious `A` and `F` fragments. The corrected count is 43.

**42 of 43 signed-message words address existing original rune words. Exactly one fails the rune-word contract: `lies`.** Its canonical spelling `L-I-E-S` has GP prime weights `73+31+67+53=224`, and `224 = 58×3 + 50`: physical LP2 **page50, zero-based word index3**. This is the **only rune-free numerical page** among the 58 original LP2 page slots. The source sentence containing that word reads `The path lies empty; epiphany seeks the devoted.` This is an independently predicted and semantically suggestive page selection under the already-frozen rule, with an obvious alternative interpretation: the word's address could target a *table cell* in place of an absent rune word. Original p50 does have 104 two-digit cells; its fourth token is exactly **`3D` = 193** under the canonical base-60 grid codec. Reading a table cell at that position is a **new candidate semantic extension**, not part of the originally specified rune-word rule.

Two further predictions arise without changing the addressing convention. The signed word `found` has prime sum `130 = 58×2+14`, pointing to **physical p14 word2**, immediately after the unique p14 word1 `FOLD` selected repeatedly by `the`. The word `Beware` sums to `322 = 58×5+32`, selecting **p32 word5**, the same 11×11 tree page that independently matches the dimensions of the signed 2016 image. Neither of these selected unknown ciphertext words is established plaintext. Most of the other 42 selected rune words remain opaque. Their values must be read from the physical word boundaries, not from line-wrapped rune fragments.

These source-fixed matches strengthen the **candidate** book-navigation interpretation because they were discovered after fixing the map on the earlier 16-word sentence. They do **not** supply an authenticated original-LP2 decryption or prove the creator chose this addressing rule; the special interpretation of `lies` was recognized after observing the table hit. A justified next operation must specify what to do with the p50 numeric token and the selected words, then predict unseen authentic text, a key or a recoverable destination. The full-source assertions and a summary are embedded in the original SFT, [`sims/lp2_2016_message_base58_word_map.cjs`](../sims/lp2_2016_message_base58_word_map.cjs).

## Source-preserving recursive word route: FOLD → SB → END

After a signed-source word selects a rune word, apply the **same fixed** prime-sum quotient/remainder operation to that selected printed rune word. This gives a reproducible two-hop route across the original book:

| Source | Unmodified GP-prime sum | Address | Destination |
|---|---:|---|---|
| signed word **the** | `TH(5)+E(67)=72` | p14 word1 | `ᚠᚩᛚᛞ` = **FOLD** |
| p14 word1 **FOLD** | `F(2)+O(7)+L(73)+D(89)=171` | p55 word2 | `ᛋᛒ` = SB |
| p55 word2 **SB** | `S(53)+B(61)=114` | p56 word1 | `ᛟᛋᚱ` = **END** (verified plaintext under the separately solved p56 totient cipher) |

The first intermediate destination is **p55, the final unsolved physical LP2 page**; the second is **p56, the first solved physical LP2 page**. The independently signed source word **their** has the same GP-prime sum **114** as SB and thus selects the same END word directly. These relationships survive correction of printed word boundaries. They offer a particularly precise candidate **book-navigation route** whose endpoints are source-visible and whose end word is independently decryptable.

The **entire** physical word corpus contains **2,973 printed rune words**, versus **3,367 artificial rune runs** yielded by scanning the master transcript line-by-line. The earlier initial 16-word mapping, which used those line runs, splits a few real words at printed wraps. Among the 43 distinct-position signed source words, five addressed occurrences change their selected raw rune string under the correct printed parser: twice `are` at p1 word3, `empty` at p53 word5, `epiphany` at p30 word7, and `devoted` at p33 word6. All 43 computed **numeric addresses remain identical**, as do the 42 existent destinations and the unique p50 exception. This is an essential implementation correction for any human-readable route. It is source-grounded, with no plaintext recovery beyond the already known END.

The pointer walk must *stop or change rule* when it encounters an absent word on the rune-free p50. Directly iterating it elsewhere creates ordinary convergent cycles and does not automatically yield an unknown-language plaintext. A successful solve must still supply a distinct source-prescribed stop, selection, folding or decryption instruction.

## Original p49–51 numeral encoding: an independent base-60 clue and a base-59 ambiguity

**Integration of prior source evidence (Agent 50, 11 November 2026).** The radix59/f-omission fork and the independent p33 sexagesimal clue were already documented in [the exact existing numeral-codec analysis](lp2-grid-numeric-codec-ambiguity.md), including a stronger conditional p39 GP29 polynomial-factor discriminator. This section freezes their practical consequences for the signed-message `lies` selector and the 43-cell interval. It does not report a new cipher discovery or a second independent 193-selection proof.

The physical originals [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg) and [68.jpg](../resources/liber-primus/68.jpg) print **10, 13 and 9 complete rows of eight two-character numerals**, respectively: **32×8=256 tokens**, in an ordinary left-to-right, top-to-bottom page order. Each token is physically separated by whitespace. The earlier same-book [50.jpg, LP2 p33](../resources/liber-primus/50.jpg) displays a two-line cuneiform numeral. Its conventional two-place sexagesimal group readings **(17,13)** and **(55,1)** yield **17×60+13=1033** and **55×60+1=3301**, both already privileged Cicada numbers; the cuneiform recurs on other illustrated pages. This independent manuscript artwork motivates 60 *without consulting the table's decoded values* (compare [cuneiform visual reading](https://cicadanotebook.com/sessions/9.html)). It does **not** explicitly instruct that every later Latin two-character token uses the same radix.

Under the **conventional positional alphanumeric order** `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, lowercase `x` has digit index 59. Physical p49 token at global index **22** is `0x`, forcing a radix of **at least 60** if the alphabet includes all intervening characters. Physical p49 index **65** prints `4F` (F=15): if every token is supposed to be one byte in 0..255, `4×radix+15≤255` forces radix **at most 60**. Therefore **radix60 is uniquely implied under the joint assumptions** of the standard unsuppressed alphanumeric digit order *and* one unsigned byte per token. In that interpretation the original table explicitly reaches both byte endpoints: `00`=0 and `4F`=255. The independent 256-cell count makes a byte-stream interpretation natural, but does not prove that data type.

The historical alternative is nontrivial: **no lowercase `f` occurs in the printed 256 tokens** (other letters are not similarly omitted on that premise). Excluding `f` from the alphanumeric digit alphabet yields a consistent 59-symbol order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`. Both radix59 and radix60 keep all printed tokens in unsigned-byte range, including the `0x` and `4F` examples. The independent cuneiform favours sexagesimal, but the manuscript does not say to retain the unused lowercase `f` as a valid digit, or even that these numerals are bytes. The earlier book's GP treatment of F makes exclusion a genuine conceivable design choice. A later reconstruction describing the grid as base60 is not, by itself, a contemporary Cicada instruction (see the [community radix-alternative inventory](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_pp49-51_data_interpreted_as_base_59%2C_60%2C_62_and_64.)).

**Exact source map for the contentious 43-cell input**, with indices frozen before any unknown-language score: the table begins with 80 tokens on p49; p50-local cell3 is global **83**, `3D`; the other `3D` is p50-local cell47, global **127**. The interior is the **43 p50-local cells 4–46 inclusive**, in printed row-major order; the source bracket is `3L,3D,[43 tokens],3D,3L` at global offsets 82–128. Conventional radix60 gives the bracket values `201,193,[...],193,201`, while skip-`f` radix59 gives `198,190,[...],190,198`. The interior's complete frozen hex readouts, preserving the same original 43 tokens and positions, are:

- **base60:** `ad1c6f41d3dcc631ec543823de96482253e520ce7a3f1fda0eb82073498fc5f736ab23b82aed56360d14a3`
- **base59 (exclude f):** `aa1c6d40d0d9c330e8533723da94472252e120cb783e1fd70eb52071488dc2f335a823b529e955350d14a0`

In particular, `3D` decodes to **193 versus 190**, and `4F` to **255 versus 251**. Every later claim involving prime(44)=193, 201/193 flanking, the 43-byte key/nonce window, or a source-selected 193 pointer **depends on resolving this radix/letter-skip fork**. The prime coincidences were noticed after adopting base60 and cannot serve as independent evidence that base60 was intended. Neither input has produced unknown LP2 plaintext under existing tested inverses. The remaining unprovided contemporary instruction would have to specify, or unambiguously require, **the conventional 60-character alphabet including unused `f`, byte interpretation, and row-major consumption order**. Without that selector, the source commits to the *physical* 43 cells but not an authenticated unique 43-byte numeric key.

## Prime 193, the missing-prime index, and the 43-byte signed-message interval

**Exact original-source observation, 11 November 2026; intended route remains provisional.** The previously frozen signed-2016 base-58 book-address operation above uniquely maps the word “lies” (GP-prime sum 224) to original LP2 physical p50, table token index 3. The literal token 3D has radix-60 byte value **193**. The archived 2013 telnet prime list skips from 71 = prime(20) to 1229 = prime(201). Among those **180 omitted primes**, 193 is **prime(44)** and its omission-index is **24** (44 minus the 20 preceding visible primes). The number 24 is independently the p54 oversized Ac GP index and p39 quadratic double root, as already established in earlier source reports.

There is a stronger **unique, key-free two-route meeting relation**. The 2016 word sum and first-cell address supply **224** and original row-major grid offset **83**, respectively, before using the numeric value of that cell. For any candidate byte b in 0..255 with 1 <= 224-b <= 224, define two possible destinations: **83 + π(b)**, with π the ordinary prime-counting function, and **prime(224-b)**, the 1-based prime at the arithmetic residual index. Require both to refer to the same original grid position (0..255). Exhausting **every b=0..223, including composite values**, gives **exactly one solution: b=193**, because **π(193)=44**, **224−193=31**, and **83+44=prime(31)=127**. Thus this proposed two-route condition determines the observed table value 193 **without using the cell as an input**; the second actual original cell at offset127 is again 193. The source-supplied 2013 DH modulus **23** also has prime(23)=83, the first cell's global index. The residual **31** matches both the prime ordinal selecting the second position and the independently established count of red thirteen-dot stencil marks, which separate the last sixteen pages into 32 fragments. The two-route *rule itself* was inferred retrospectively from these coincidences, so the uniqueness does not authenticate it as the creator's intended decoder. The 256-byte table contains byte 193 *exactly twice*, at original global row-major offsets **83 and 127** (p50-local offsets 3 and 47). The distance **44** equals the 1-based prime ordinal of 193. The enclosed offsets **84–126** provide exactly **43 source bytes**, matching the 43 alphabetic words of the preserved signed 2016 message under the already fixed tokenization excluding 3301 and the hexadecimal fingerprint. Original byte **201** occurs exactly twice at offsets **82 and 128**, flanking the two 193 occurrences in reverse order: **201, 193, [43 bytes], 193, 201**. The value 201 is the 1-based ordinal of the first prime displayed after the 2013 gap. This is the only reversed ordered adjacent-byte-pair match anywhere in the original table. Under the alternative radix-59 reading, token 3D would equal 190 and the prime-rank route fails.

**One frozen original-data decoder was tested:** take the 43 interior bytes in forward row-major order and XOR each with its corresponding signed-word GP-prime sum modulo 256, as suggested by the historical 2013 bytewise XOR puzzles. This yields only **16/43 printable ASCII** bytes and no readable instruction. The same model roundtrips a separately supplied known 43-byte ASCII plant exactly, which is an implementation check only. This closes the literal direct XOR interpretation, without claiming an actual LP2 text decryption.

The source matching, 43-byte alignment, prime-gap index and bracketing bytes were recognized retrospectively, so there is no discovery-adjusted significance claim or proven creator instruction. Under a fixed-source shuffle conditioned on 193 being present at selected offset 83, the other copy occupies the expected +44 offset with probability 1/255; this is a narrow conditional arrangement probability rather than evidence of a cryptographic key. The next decisive step is an independent historical instruction turning these 43 signed-word/byte pairs into a recoverable key or original plaintext, then testing a frozen inverse against unsolved LP2. The existing [book-map source SFT](../sims/lp2_2016_message_base58_word_map.cjs) asserts the full chain and bounded XOR result.


### From the signed “lies” selector to the byte-pointer 11-cycle in 16 steps

**Source-original numerical route; hypothesized use.** The previously frozen signed-word map picks LP2 p50 original numeric cell3, whose global row-major table index is **83** and whose value is **193**. Interpret each byte as the next zero-based address in the existing 256-cell table, with no free offset. The exact pointer route is:

`83 → 193 → 155 → 112 → 73 → 79 → 82 → 201 → 74 → 205 → 76 → 114 → 197 → 115 → 247 → 192 → 0`

This first reaches zero after **exactly 16 steps**, matching the word count of the signed 2016 central sentence “Its words are the map, their meaning is the road, and their numbers are the direction.” Starting at zero then traverses the **11-cycle** `0→203→68→199→47→76→114→197→115→247→192→0`, identified separately before the signed “lies” selector was noticed (see [the existing byte-pointer report](lp2-grid-byte-pointer-11cycle.md)). Starting at the *other* original 193 cell, index127, also reaches zero after 16 steps. Exhaustively, only **11 of the 256** table positions first reach zero in 16 steps: **[63,65,83,127,179,181,209,217,222,231,244]**. Of these, precisely the two 193 cells **83 and127** pass through all of positions **112,114,115** along the 16-step route.

There is a further precise, still provisional source-navigation relationship: applying the **same previously frozen base-58 page/word interpretation** to the original route values **112,114,115** selects **p54 word1**, **p56 word1**, and **p57 word1** respectively. The second is the solved **END** (p56 ciphertext OESR under the independently verified prime-totient inverse); the third is the solved **LIKE** (p57 GP spelling LICE). The absent intervening value **113** selects **p55 word1**, which is still encrypted, and the signed 2016 message separately generates 113 from the source word **“you”**. Hence the route touches three of the four consecutive p54–57 page/word1 addresses but skips exactly the final unknown p55 one.

All table bytes, addresses, word counts, and solved-text anchors are asserted by [the updated source SFT](../sims/lp2_2016_message_base58_word_map.cjs). They form an exact computational relationship and a candidate intended walk, not authenticated plaintext. The sixteen-step stopping condition was inferred after observing the source, and the source does not explicitly specify one pointer advance per signed word. The missing operational clue is how to read the route as plaintext or use it to decode the withheld **p55 word1**. Further ungrounded offset and key sweeps would dilute this constraint.

### Source-selected 44-byte key/nonce: an actual authenticated-decryption test

The source-selected 193 copies are **44 printed cells apart**, so the original contiguous span can supply a **32-byte AES/ChaCha key and 12-byte nonce**, precisely 44 bytes. The source-defined interval permits two 44-byte windows, one including the first 193 and one including the last. Testing both byte directions and the two consecutive key/nonce field orders gives **eight source-exact candidates**; there is no secret phrase or arbitrary key search.

A [new standalone positive-controlled original-inverse test](../sims/gp29_193_signed_source_aead_sft.cjs) uses the existing whole-book 12,956-rune GP29 big-integer codec (7,868 bytes), in five previously specified orientations, and both natural payload framings (nonce externally supplied from the table, or initial 12 bytes of the cipher payload as nonce). Each candidate is tested with standard **AES-256-GCM** and **ChaCha20-Poly1305** with 16-byte final tag and empty associated data. Total: **160 attempts**.

**Original result: 0 authenticated plaintexts out of 160**, with both 7,852-byte positive controls recovering every byte under the actual source-derived key and failing correctly on a tampered tag. The complete successful [CI run 42954840869](https://github.com/FlareZ123/liber-primus/actions/runs/42954840869) executes the new SFT immediately after the frozen signed-word map in the existing manual workflow. Crypto API semantics follow [Node.js official crypto documentation](https://nodejs.org/api/crypto.html#class-decipheriv).

This rejects the precisely defined whole-book GP29/AEAD envelope under those key/nonce windows. It does **not** recover or rule out a p55-only key, another intermediate encoding, an unauthenticated cipher, or a different source-selected operation. The 44=32+12 interpretation was noticed after observing the cell spacing, so its motivation is provisional. Retire this direct key/nonce route unless an original clue determines a different framing.

## Literal PARABLE instruction: 43 interior runes on the last unsolved page

**New, source-visible 43-way alignment (Agent 29, 11 November 2026; provisional, with a completed original-input decision).** The independently solved p57 *PARABLE* says to “shed our own circumferences” and “find the divinity within.” An executable, human-readable reading of that instruction is to **delete the first and last GP rune of each original printed word**. Use [the physical-word transcription](../resources/lp2-transcription.txt), joining marked line wraps before counting words; a GP digraph is one printed rune.

Original p55 (72.jpg), the final unsolved page, has **76 runes across 17 printed words** with exactly **one singleton**. Removing the two external runes from every longer word, and the singleton itself, leaves **76 − (16×2+1) = 43 original interior runes**, in exact printed order. They begin `MIEOGDTHIAABCE...` in canonical GP transliteration and have GP-prime sum 2,060. This is a third original-source **43-position sequence** beside the PGP-authenticated 2016 message's **43 natural-language words** and the **43 printed table bytes at positions 84–126**, already isolated by the `201,193 ... 193,201` reversed byte brackets from the signed `lies`→p50 selector. The signed message and table geometry were identified independently of the p55 trimming operation. Each 43 count is exact, but matching counts do not prove authorial design.

The instruction has a second, different candidate destination: solved p57 carries a seven-rune `PARABLE` heading and **19 body words** containing **88 original GP runes**. Stripping the first and last rune from each body word leaves exactly **88 − 2×19 = 50** runes. **Physical p50 is the only rune-free numerical-table page**, so this gives a literal “inside” → page-number 50 coincidence. Its significance is unresolved; no original text says to treat the residual length as a page address.

**Whole-book selector and second 33/88 tree bridge.** The same literal outer-rune deletion has **no other 43-rune result** among all 57 rune-bearing physical LP2 pages; p55 uniquely yields that length under the frozen physical-word grammar. On the 2016-signed-image-linked original tree page **p32 (49.jpg)**, the original two printed sentences divide its 121 ciphertext runes into exactly **33+88**: seven words of 33 runes and fifteen of 88. The source-linked sharp tree on **p55 (72.jpg)** divides into **33 exterior runes plus 43 interior runes** after the same first/last-word extraction. The solved *PARABLE* p57 divides into a **seven-rune heading and an 88-rune body**. Thus the independent visual/textual source links select **p32 first sentence 33 ↔ p55 shed word-exteriors 33** and **p32 second sentence 88 ↔ p57 solved body 88**. These are exact structural identities; none says that those aligned sequences have identical plaintext.

The direct cross-source check is negative: p32's first 33 actual runes equal p55's 33 exteriors at only **1/33** positions; its second 88 actual runes equal the independently solved 88 *PARABLE* body runes at **2/88** positions. Even under an arbitrary *unknown stationary 29-way substitution* from solved p57 body to the source p32 second clause, at least **63 of 88** runes would have to change. **1,402/2,000** fixed-inventory p32-tail shuffles attain an equal or better fit (add-one **p=0.701149**). A native hidden-codebook control shows exact recoverability. This excludes the simplest direct cross-tree transcription under global substitution; a cryptographically meaningful transform has not been identified. **A stronger all-secret eight-column linear-cipher exclusion:** The same 88-rune known body and proposed p32 ciphertext tail form **11 successive eight-rune blocks**, with block width fixed by the original numerical table's eight columns. The eleven GF29 plaintext vectors have matrix rank **8**, but adjoining their eight output coordinates gives rank **11**; therefore **no possible secret 8×8 Hill matrix** maps these exact source blocks. Allowing an arbitrary constant eight-rune offset still fails: rank **9** for the augmented inputs (including a one column) versus **11** for augmented inputs plus outputs. A source-native planted nonsingular affine linear transform satisfies both equal-rank conditions. This algebraic obstruction is independent of English scores, guessed key entries or partial fitting. The eight-column grouping is a plausible source-selected model, and other groupings/nonlinear ciphers remain open. The **33/88**, **33/43** and **7/88** splits provide a newly aligned finite set of source-specific original inputs for a genuinely constrained next operator, without authorizing arbitrary new masks.

**Finite original-cipher decision using the already frozen 43-table-byte compass route.** The published `sims/lp2_2016_43word_compass_sft.cjs` maps the table bytes at 84–126 to a 43-stop route on the source-selected p32 11×11 prime matrix, starting at `HOMEX`, using its eight columns for compass direction and 32 rows for distance. Comparing the **actual 43 visited GP runes** against p55's **43 inner GP runes** gives only **1/43** exact rune agreements. Even giving this relation an *arbitrary secret stationary GP29 codebook* (every codebook selected by source-class plurality), at least **20 of 43** p55 target runes must be edited. On **2,000** deterministic permutations of the original 43-rune inventory, the same all-secret fit is as good or better **866** times (add-one upper tail **0.433283**). A native hidden-codebook plant fits **43/43** and one changed rune forces exactly one mismatch. Independently, direct table-byte XOR/add/sub with these source rune indices or their prime/totient weights produces no recognizable ASCII.

This excludes literal identity and a single stationary substitution from that **specific source-selected compass walk** into p55's inner stream. It does not exclude a more complex operator whose inputs include the 2016 word content, punctuation, previous state or other actual artwork. The three 43-element streams are worth a direct, independent human-solve-path question, **but no unknown LP2 plaintext, authentic key, or verified continuation has been recovered**. [Source-native exact CJS and seeded controls](../sims/lp2_p55_shed_circumference_43_source_gate.cjs) · [successful manual CI 42960789574](https://github.com/FlareZ123/liber-primus/actions/runs/42960789574). Preserve the physical-word count 17; the 19-word count belongs to p57's **body**, not p55.

## Original-LP2 inverse: 43 table bytes as a key for the 43 addressed words

**Bounded negative, 11 November 2026.** The previously frozen signed 2016 message contains 43 GP-encodable natural-language words. Its same 58-page GP-prime-sum address rule selects **42 actual LP2 rune-words and the single p50 table-cell exception**, a total of **175 source ciphertext runes**. The independently observed reversed numerical bracketing `201,193,[43 bytes],193,201` supplies exactly 43 original printed base-60 grid bytes at global offsets **84–126**. A literal source-to-cipher operation is therefore to pair the addressed rune-words with those bytes in the unchanged 2016 message order.

The [standalone reproducible inverse](../sims/lp2_2016_43byte_bookword_inverse_sft.cjs) freezes this byte alignment and applies each original byte modulo 29 as one additive GP29 shift for every rune in its corresponding *selected* printed word. Both reversible signs are tested; the absent p50 word simply carries no runes. Each model deciphers and then exactly re-encrypts the **175 original rune positions**. To evaluate something independent of roundtrip identity, a smoothed GP word-internal bigram/trigram model is trained on the first 75% of the repository's Shakespeare corpus, and **2,000 permutations of the same 43 source bytes** are tested per sign without varying the original book addresses. The last 25% of the Shakespeare GP corpus supplies held-out plaintext word-length-matched to all selected original words; encrypting it under the *same* table bytes and then inverting restores every planted rune.

| Original source-key decoder | Original mean log GP bigram+trigram | Key-order-null mean | Same-source shuffle upper tail |
| --- | ---: | ---: | ---: |
| Subtract table byte mod29, per selected rune-word | **−4.677788** | −4.699041 | **0.412794** |
| Add table byte mod29, per selected rune-word | **−4.760124** | −4.713194 | **0.676162** |

The held-out native plaintext plant scores **−2.127767** under the same trained model, with **175/175** symbols exactly recovered and reencryption passing. Neither original direction is informative against the preserved-source key-order null. This rejects the simple table-byte-per-addressed-word GP29 additive use; it does not exclude a different word traversal, nonlinear register, variable-rate intermediate or undiscovered key.

A separate direct 43-byte readout uses the GP-prime sums of the *selected LP2 rune-words*, a different and now frozen source from the original signed-word prime-sum XOR reported above. For the rune-free `lies` address only, it uses the selected table token value **193**. Direct XOR of the 43 interior bytes with selected-word prime sums leaves **16/43 printable ASCII**; the corresponding selected-word ordinal-sum XOR gives **15/43**. Direct modular subtraction/addition of selected-word prime sums yields **22/43** and **13/43** printable bytes, respectively. None is recognizable plaintext. The source-native wordwise GP29 plant and these finite negative byte readouts were executed successfully in [manual CI 42955097211](https://github.com/FlareZ123/liber-primus/actions/runs/42955097211). No unknown LP2 plaintext or authentic cipher key follows.

The candidate 43-byte alignment itself remains retrospective; further inverse searches would require a specific source-prescribed operation rather than expanding unconstrained byte/key transformations.

## Independent numerical bridge to the 2016 image

The first four words, “Its words are the”, have GP prime sum:

`143 + 179 + 175 + 72 = 569`.

That equals both:

- the 569-pixel dimension of the 2016 signed image; and
- the first-column GP-prime sum of the 11×11 p32 square.

The p32 top-row sum is 563, matching the other 2016 image dimension. This does not prove the book-map rule, but it independently links the 2016 message's word values to the p32/tree geometry.

## Alternative: cumulative 58-page walk, 76 selected runes

An explicitly different reading of the signed sentence “Its words are the map, their meaning is the road, and their numbers are the direction” treats each source word's GP-prime sum as a **running page displacement**, rather than the direct absolute page address above. Start at physical LP2 p0, advance by the sum **modulo the original 58 pages**, then select the zero-based word at index `floor(sum/58)` on the new page. The original message does not say which of these two possible address semantics applies. The alternatives are competing hypotheses, even though they share source arithmetic.

For the fixed 16 signed words, the source prime sums are `[143,179,175,72,211,114,319,84,72,204,215,114,295,175,72,337]`. Their **16 distinct** cumulative destinations, word indices, and exact selected-rune counts are:

```text
Word:       Its words are the map their meaning is the road and their numbers are the direction
Page:        27    32  33  47  26    24      53 21   35    7  48    46      51  52   8        55
Word index:   2     3   3   1   3     1       5  1    1    3   3     1       5   3   1         5
Rune count:   4    11   6   8   4     3       1  3    3    3   3     4       2   7   8         6
```

Specific original-source correspondences follow from the unmodified route: “words” reaches the blurred-tree **p32** linked to the signed 2016 image; “numbers” reaches the original numeric-table continuation **p51**; “direction” ends on **p55**, the last unsolved LP2 page. The first and last visited pages, **p27 and p55**, independently contain the same unusual six-rune span `ᛞᛄᚢᛒᛖᛁ`, at p27 local offset28 and p55's last six positions. The *selected address-words* at those endpoints are different from the repeated span; this is a page-level correspondence.

The 16 selected words total **exactly 76 runes under the canonical full master transcription**, the same size as both original p55 and the **76-byte outer boundary** of the printed 32×8 numerical table. The simplified LP2 transcription differs at certain source word boundaries; use the canonical 75-scan master for this 76-element reading. The size equality supplies a possible next operation, without specifying one.

A source-exact [standalone CommonJS inverse](../sims/lp2_signed2016_cumulative_page_walk_sft.cjs) passed [manual CI 42952172983](https://github.com/FlareZ123/liber-primus/actions/runs/42952172983). It tests the candidate 76-rune stream as a p55 additive key using three natural GP29 projections: rune ordinal, GP-prime residue and prime totient residue, with either key sign, with and without the 76 perimeter bytes in original row-major order. All **12** 76-rune outputs are unreadable, with IoC in **[0.02667, 0.03719]**. Four ordinary page-reset/global additive 76-key inversions across the complete unknown corpus also remain uniformly ciphertext-like (IoC **0.03445–0.03452**, original **0.034478**). These negative direct-key tests cannot reject the page walk or its cardinality match, only the declared simple key-use models.

The next discriminating evidence would explicitly choose a *running* versus *absolute* page address, or provide a source-native operation combining the 76-element sequence with the table perimeter. The cumulative interpretation provides **no newly recovered plaintext, cipher mechanism, authenticated key or destination**.

## Controls and limits

- The mapping is word-by-word. The full 16-word sentence has canonical GP rune count 61 and prime sum 2781; treating the total as one address gives p55 word 47, which is out of bounds because p55 has only 17 physical printed words.
- The repository's canonical transliteration uses `IA`, not an `IO` alias. The word “direction” therefore contributes nine runes and prime sum 337. Published 59-rune / 2819 calculations for this sentence require a different, undocumented treatment of the initial capital I and/or IO; this experiment does not rely on that segmentation.
- Zero-based page numbering is supported by the original 0–57 archive labels. Zero-based word indexing is not explicitly stated in the source, but it is the convention that produces the FOLD and END anchors. A one-based word interpretation selects the preceding words instead.
- Neighboring moduli do not reproduce both anchors: with 57, “the” selects p15 word 1 and “their” p0 word 2; with 59, they select p13 word 1 and p55 word 1. The original 58-page count is therefore material to this candidate.
- Most selected words remain opaque ciphertext. Do not call the 16-word output plaintext, and do not promote this to `results/` yet.

## Best next test

The absolute signed-message map selects the **only non-runic LP2 page** at the source word `lies`, while the newly tested cumulative alternative uniquely visits 16 pages and yields a 76-rune candidate. Their numerical coincidences are not interchangeable; an independent source cue must distinguish the two. In the stronger direct map, the full extension selects the table's 193 byte at `lies`. The immediate next question is whether the separately printed numerical-table fourth token `3D` / byte193 has an independently signaled, lossless operational role in a route that also uses the existing FOLD/END anchors. This would turn a semantic correspondence into a source-defined key, coordinate or decoder with a withheld original-cipher prediction.

A different possible clue is the signed word `the` mapping to `FOLD`, suggesting a literal fold of p32's 11×11 rune layout. A narrow vertical-plus-horizontal fold was tested independently: its 16 outer-quadrant perimeter groups of four runes match the 16 signed instruction-word GP-prime residues at **0/16** positions under additive superposition (GP-ordinal sum 1/16); 50,000 original-page shuffles show no special mirror-overlap concentration. This direct reading has no support (see [Issue #18 handoff](https://github.com/FlareZ123/liber-primus/issues/18#issuecomment-6785568489)). Further folds require an independently specified overlay rule. Do not sweep arbitrary target shifts, orientations, pad functions or postselected checksum hits.
