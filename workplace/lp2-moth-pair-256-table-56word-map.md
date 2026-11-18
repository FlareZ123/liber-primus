# Repeated moth pages as paired word and table registers (original LP2)

**Agent23, 18 November 2026. Classification: source-selected, *conditional* structural lead; direct raw-table, zero-anchor, word-key and new p50/G 254-slot quotient receivers fail. No unknown plaintext, authentic page key, established cipher inverse or Cicada destination.**

## The strongest source-directed alignment

Original archive 70.jpg (physical LP2 p53) and 72.jpg (p55) reproduce nearly the **same moth illustration**; an earlier image-registered source census independently established this and traced the drawing to solved LP1 p05. The authors visibly selected both images. The p55 first rune is a single NG **continued from the last word on p54**; printed words cross physical page boundaries and should not be miscounted as two words. With that page-local carry treated as belonging to its p54 word, two genuinely existing original moth-bearing text registers have the following lengths:

| Original input | Complete local words | GP29 runes in those words | End mark | Rune-or-marker events |
| --- | ---: | ---: | --- | ---: |
| p53, original 70.jpg | **40** | **179** | one original red 13-dot mark after rune 179 | **180** |
| p55, original 72.jpg, excluding incoming NG | **16** | **75** | one original red 13-dot mark after rune 76 | **76** |
| Paired moth material | **56** | **254** | two distinct 13-dot marks | **256** |

The 56 donor words have a potentially meaningful target: the **56 unsolved physical pages p0–p55**, partitioned naturally into **40 pages p0–p39** and **16 final pages p40–p55**. The latter 16 pages share the floral chapter artwork. This is a source-visible matching of *counts*, not an instruction saying which word addresses which page.

Independently, original p49–51's 32-row by eight-column numerical table has **256** two-symbol cells. Its one-cell **outer perimeter contains 76 cells**, leaving exactly **180 interior cells**. The two duplicated-moth registers therefore match the table's inner/outer geometry *including their own printed terminal marks*, and their **40+16 word count** also matches the unknown page inventory. Physical pages p53+p55 are the **only unordered pair of the 55 rune-bearing unknown pages with exactly 255 total runes** (179+76); that less precise 255 count includes the p54 carried rune and excludes both terminal marks.

## Original red-ink boundary yields two equal 28-word, 128-event registers

A stronger *within-page* separator is already drawn in **70.jpg**. The black prefix of p53 contains exactly **28 complete words and 128 GP runes**, ending precisely where the original ink changes to red. That red suffix has **12 complete words and 51 GP runes**. Combining it with p55's **16 complete body words and 75 GP runes** gives a second set of **28 words and 126 GP runes**, and the two original terminal red 13-dot marks provide exactly two more events:

| Source-selected side | Complete words | Runes | Terminal-mark events | Total events |
| --- | ---: | ---: | ---: | ---: |
| p53 black prefix, ending at original red-ink boundary | **28** | **128** | 0 | **128** |
| p53 red suffix + p55 complete body | **12+16 = 28** | **51+75 = 126** | **2** | **128** |
| Total | **56** | **254** | **2** | **256** |

Unlike the inferred interior/perimeter mapping, the first **128-runic red-ink separator is an actual original source mark**, and it lands exactly on a printed word boundary after word28. **There is an independent authored operation behind both numbers:** the matched moth is copied from solved LP1 physical p05, whose accompanying visible SOME WISDOM instruction says *the primes are sacred* and *the totient function is sacred*. Euler's totient gives **φ(29)=28** for the 29-rune GP alphabet and **φ(256)=128** for the 256-cell table. Thus two halves each have precisely φ(29) complete words and φ(256) rune-or-marker events. This is a strong source-directed research **hypothesis**, while the counts alone still cannot prove author intent. This gives a second, independent *structural framing* for the same moth-pair source, with **28+28 word slots** and **128+128 events**. It could nominate a two-register operation, an explicit AES-128/256-bit key interpretation, or a 28-state alphabet, but no authored bit conversion, cipher family, polarity, key/IV or event order is yet supplied.

The first-party totient clue also selects a literal address partition: the `φ(256)=128` **units modulo256** are the 128 odd addresses 1,3,...,255, and their conventional Euler inverse permutation is `x^-1=x^127 (mod 256)`. The complementary 128 even addresses are nonunits. An exact original-cipher check assigns one 128-event text register to the 128 odd source-table addresses and the other to the even addresses, evaluating both register assignments, ± GP29 additive directions, and direct unit enumeration versus genuine modular inversion (eight source-typed variants). The strongest result is GP IoC **0.04035433** on the odd/unit channel and **0.03567913** on the even/nonunit channel, both nonprose. This rejects only these direct byte-pad consumers; the even side has no canonical Euler inverse, so the hypothesized full two-channel operation remains unspecified.

Two elementary original-cipher reductions were tried without fitting parameters:

- Pair the two natural 128-event streams in order (or reverse the second), interpreting both original red 13-dot marks as GP index 0 or13. The eight GP29 additive **sum and difference** folds all have IoC **0.03137–0.03531**, with no ordinary GP text. The 128-event pairing reconstructs exactly, making this a bounded negative for the direct two-share receiver.
- A typed block-cipher check converted **56 printed donor words into a 56-bit DES key** using parity of either each word's GP prime sum, GP ordinal sum or rune length, inserted standard DES odd parity bits, and applied DES-ECB against the **256 original table bytes =32 blocks×8 bytes**. Three source-derived keys were tested in both encryption and decryption directions. All six outputs are nontext (only 80–112 of256 bytes printable, no recognized file signature). Separately, using one original GP-ordinal parity bit per **256 event** generates a 256-bit AES-256 key or two 128-bit AES-128 keys for the two 128-byte table halves; both fixed ECB decryptions remain nontext (104 and91 of256 bytes printable). GP-prime parity and ordinal-bit4 produce the same result under these two frozen AES modes. **DES and AES are independent analyst-selected ciphers**, so the tests retire only these direct parity-key examples, not all cryptographic uses of the matching bit counts.

The solved p56 contains a **128-hex-character SHA-512 target**, giving an independently printed literal 128-unit known plaintext. Using its 128 hex digits as GP29 ordinals against either 128-event moth stream, and cancelling a hypothetical reused positionwise additive GP29 pad, yields eight complete original other-stream outputs (both possible known-plaintext placements, ± key signs, both 13-dot-marker values 0/13); every output IoC lies **0.03395669–0.03592520**, with no native prose. A separate historically documented XOR-pad check treats the original 256 p50 table bytes as two 128-byte ciphertext halves, one hypothetically encrypting the **128 ASCII bytes** of the same known hash. Key cancellation (`C0 xor C1 xor hashASCII`) yields only **55 printable bytes of128** and no typed continuation. These bounded known-plaintext attempts do not recover an unknown key.

**Full-secret φ(29)=28 period key obstruction.** The moth's original LP1 source explicitly names Euler's totient, selecting a key-length test with **28 nonzero GP residues**. Grant an *arbitrary unknown deterministic GP29 substitution* at every one of the 28 residue classes, reused across the full 256-event pairing. Any such stationary per-phase secret mapping preserves equality of source symbols when it is bijective; even a many-to-one map can only add ciphertext equalities. The original complete source has only **39 matched GP29 pairs across 1,027 same-phase pairs** with physical markers occupying positions 179 and255. If markers are transparent to the clock, there are **34 across 1,026**. By contrast, 5,000 independent genuine GP29 English controls from each of Shakespeare/Gibran/Emerson, with the original 128+126 native-rune/two-marker geometry, have median **60/60/62** pairs. Only **19, 13 and 6 controls**, respectively, score at or below 39; and only **3, 2 and 0** score at or below 34 under the transparent-marker clock. A genuine 28-phase hidden-key planted English stream is decoded exactly and preserves these pair counts by algebra. Thus **even a completely undisclosed 28-position shared deterministic symbol substitution key cannot account naturally for ordinary English in this original paired register**. This is a key-independent source-native statistical obstruction, not a proof against changing-state, different plaintext registers, or authored exceptional events. [Original-input 28-phase SFT](../sims/lp2_moth_phi28_phase_equalpairs_sft.cjs).

The natural 128+128 source partition strengthens the inference that the two moth pages deserve joint inspection. It **does not establish cryptographic intent** without a reversible source-selected operation and identifiable plaintext or structured payload.

---

All four correspondences are mechanically checkable on original ciphertext and layout. Taken together, they nominate a **possible key-sharing and table-traversal route** that earlier isolated 180/76 hypotheses did not single out. This is not proof of deliberate encoding. It would require an independent authored rule about the event-to-cell map and how numeric cells transform runes.

The clear p57 PARABLE says to shed *circumferences*, followed by finding divinity *within*; the signed 2016 text says the book's words are the map and their numbers are the direction. Those are context for considering perimeter, interior and word inventories. Neither text explicitly commands this alignment.

### Related image-source context: Spon (1685)

The LP1 p14–p16 sequence (corpse alone; two cicada-like insects above it; one cicada-like insect above it) is plausibly thematically compatible with Jacob Spon's adjacent Tables III–IV. LP1 p16's cicada-like insect above a reclining corpse is a plausible thematic adaptation of Spon's *Miscellanea eruditae antiquitatis* (1685), Art. III, printed p.7, Table IV, under “Papilio animae symbolum.” Spon explicitly identifies the depicted butterfly as the soul of a deceased man flying away; his Table III commentary also describes the butterfly's repeated worm-to-butterfly metamorphosis. The wording itself already echoes solved LP1 p3/4 (journey deep within, arrive outside; the instar emerges through going within); Spon supplies historical iconographic context, not a necessary textual source. Tables V and VI add a bird catching the butterfly and Cupid fastening the soul to a tree, but the p53/p55 moth illustrations are not established copies of those figures.

A tempting page7/TableIV → archive74 and TableV → 75 concatenation is **retired**: the original 2014 Stage11 index has only 58 LP2 images numbered 0–57. The apparent 74 is produced by a later combined archive that prepends 17 LP1 images; it is not a native LP2 address. The surviving numeric observation is page7/TableIV as row7/column4 in the p50 32×8 table: byte59 matches the GP prime weight of the first p53 red T, but the next cells do not extend the match. The source-derived Latin epitaph was tested as a direct key and through word-length/prime-sum block and ragged-columnar transpositions; none decrypted p55. The p50 row7/column4 coordinate was tested against relative-bytewalk, q+1 keypad and direct-pointer readers; none decrypted the p53 red span or flanking sentences. Full evidence and reproduction are in [the Spon source-route gate](../im-results/lp1-p16-spon-papilio-source-route-gate.md).

## Two rare 00 anchors, one in each proposed zone

Under the existing **provisional** base60 two-digit interpretation of the table, there are exactly two literal printed \`00\` cells:

- flat index **192**, row **24**, column **0** in zero-based 32×8 indexing: **perimeter**;
- flat index **229**, row **28**, column **5**: **interior**.

Thus one candidate reading, fixed *before* looking at decrypted outputs, uses each moth-page terminal 13-dot mark as the sentinel at its region's unique 00 cell. Treat the interior as conventional row-major 30×6 and the perimeter as clockwise from the upper-left corner. Start each cyclic read **immediately after** its 00 cell; 179 p53 runes and 75 complete-body p55 runes consume the other cells and the terminal mark returns to 00. This constructs an exact, one-to-one **event layout**, including both marker positions, over the 256 original table cells.

The zero-as-marker equivalence and cycle-start convention are **conjectures**. The markers physically contain 13 dots, and the table cells contain 00. Neither source asserts that a red 13-dot mark encodes zero, that page order supplies table orientation, or that table bytes are GP29 shifts. Table radix and the full 256-cell glyph transcription are also provisional. The two 00 cells alone are not a genuine decipherment key.

## Exact original-cipher inverse decisions

All measurements below use canonical physical LP2 GP29 rune indices. The candidate mapping was held fixed. Neither F-skip masks nor arbitrary key shifts were fitted to ciphertext.

### 1. Source-anchored direct table-byte additive cipher

Convert each two-symbol cell to a base60 byte, take its residue modulo29, and decode each of the p53 and p55 body runes by P = C − K or P = C + K. Every candidate exactly re-encodes the unmodified input under its corresponding inverse. The results remain far from ordinary GP-native prose:

| Moth recipient, zero-anchored zone | GP IoC before | GP IoC C−K | GP IoC C+K |
| --- | ---: | ---: | ---: |
| p53, 179 runes, 180-cell interior | 0.03351955 | **0.03521436** | **0.03615592** |
| p55 body, 75 runes, 76-cell perimeter | 0.03855856 | **0.03495495** | **0.04396396** |

The best p55 output, despite a slight IoC increase, is still an unstructured Latin-GP transliteration, beginning \`HOEEHXYABEAIAEOPIOEMRBNIAFFNOEEAE...\`. No recoverable GP-English words or key/instruction appear. This retires the **direct zero-anchored ± base60-byte GP29 pad**, not the entire motif relation.


### 1b. p50/G 254-slot polynomial quotient as a one-use key on the moth pair (Agent23, 18 November)

A separate direct receiver uses the **quadratic quotient**, not the raw table bytes or the nine-valued high-digit stream. The p39 red triad [27,5,15] defines the low-first factor G(X)=15(X−24)^2; p54's enlarged A is GP index24; the original row-major p50 polynomial has zero remainder on division by G. Its 254-slot high-first quotient (leading zero retained) therefore matches the 254-runic p53+p55 moth register after excluding p55's incoming NG carry.

Using the quotient once, in its printed coefficient order, as a GP29 additive key at phase zero gives:

| Direction | Whole-register IoC | p53 IoC | p55-body IoC | GP trigram score |
|---|---:|---:|---:|---:|
| C−quotient | 0.03457720 | 0.03521436 | 0.03207207 | −14.76873385 |
| C+quotient | 0.03541751 | 0.03533990 | 0.03603604 | −15.19402350 |

Both outputs are near the uniform 29-symbol baseline. Their GP trigram scores are more than 5.3 nats per trigram below the minimum of 3,000 fixed-seed native-English windows (held-out Shakespeare, Gibran and Emerson). The source-exact test also recovers both 254/254 p57-tiled positive plants and exactly re-encrypts the original pair.

This closes the **direct one-use additive quotient-key** interpretation only. It does not disprove an unspecified non-additive/stateful use of the table or prove that the count alignment was intended. Full derivation and controls: [intermediate report](../im-results/lp2-moth-p50-gquotient-254-direct-key-gate.md) · [source SFT](../sims/lp2_moth_p50_gquotient_direct_key_sft.cjs).

### Zero-anchored Euler/prime-ordinal and original historical XOR tests (Agent10, 18 November 2026)

The moth pair's **originally printed terminal red 13-dot marks** can occupy the unique zero cell in each proposed p50 table zone: p53's **179** GP runes occupy the other **179 interior cells**, and p55's **75 complete-body** runes occupy the other **75 perimeter cells**. The previously fixed original addressing starts immediately after each zero and ends at its zero marker. It removes the undefined `φ(0)` input that blocked the earlier clockwise-top-left p55 totient attempt. A repeated moth on LP1 p05 accompanies the author's explicit **Euler totient** clue; Cicada's solved p56 cipher uses prime-totient shifts, and the 2013 challenge uses bytewise XOR. Those historical mechanisms motivated the following genuinely executable direct consumers. They still require conjectural source-to-address and byte-to-key interpretations.

On **every original rune in both independently selected pages**, subtract and add (mod 29) either `φ(table byte)` or `φ(p_table-byte)`, with `p_1=2` and the table's nonzero byte read as a **one-based** prime ordinal. No start, phase, token boundary, exception or free alphabet was fitted. Complete direct inverses exactly reconstruct original ciphertext and recover independently encrypted solved-p57 native-rune plants, but the original outputs remain uniformly distributed:

| Original moth text | Source GP29 IoC | φ(byte), minus/plus | φ(indexed prime), minus/plus |
| --- | ---: | ---: | ---: |
| p53, 179 runes | 0.033520 | **0.033959 / 0.033394** | **0.032955 / 0.032327** |
| p55 body, 75 runes | 0.038559 | **0.032793 / 0.031351** | **0.033514 / 0.030991** |

All eight rune outputs are nonprose. This is a direct failure of the **source-zero-anchored Euler additive receiver**, rather than a rejection of the moth relationship or every possible totient cipher.

A separate authentic-history-motivated **bytewise XOR** uses each mapped rune's GP prime value, GP ordinal or GP prime's totient as a full 8-bit source key, and maps each physical terminal marker to the value **0 or its literal thirteen dots, 13**. This exactly covers all **256** table cells with no invented filler or repeated key positions. The six decoded outputs have **97, 99, 104, 106, 97, 99 printable bytes of 256**, respectively, against **106 printable bytes of 256** in the original table; none begins with a recognizable ordinary file header, and every XOR re-encodes byte-for-byte. These outputs provide no readable original content or authenticated typed object. A compressed or further encrypted payload cannot be excluded by an ASCII check.

**Decision:** retire only the eight direct zero-aligned Euler GP29 inverses and six simple prime/ordinal binary-XOR receivers. Their address mapping is itself hypothetical; no authentic unknown LP2 plaintext, creator key, or destination was recovered. [Single-file read-only Windows-compatible CJS reproducer](../sims/lp2_moth_zerocell_phi_xor_original_sft.cjs) contains exact original-input counts, source-zero addressing, positive roundtrips and numeric assertions. Neither report nor the broader p53/p55 image relation should promote a cipher claim from these negatives.

### 2. All-secret, fixed byte-to-rune lookup

If the table is a fixed substitution from each numeric byte to a GP29 rune/13-dot event, the *same* byte must always correspond to the *same* event. This is a necessary condition independent of any undisclosed substitution table. On the fixed source-anchored alignment:

| Zone | Repeated byte occurrences | Contradictory rune/marker emissions |
| --- | ---: | ---: |
| Interior p53 | 53 | **50** |
| Perimeter p55 | 8 | **8** |
| Both zones sharing one lookup | 95 | **90** |

For example, the interior numeric value 198 occurs at paired event indices 12 and 25 but aligns to distinct source rune indices 3 and 19. Consequently **no** deterministic stationary byte→rune lookup can explain those aligned original events; even granting a separate arbitrary secret lookup per zone fails. This restriction applies only to the conjectural zero-anchored alignment and **stationary** mapping; an evolving cipher or a differently keyed receiver is still possible.

### 3. Literal 56 donor words as page-local repeating Vigenère keys

A simpler reading of the historical **words** clue assigns each donor word to its corresponding physical LP2 page, then repeats its exact GP29 rune values as an ordinary additive GP29 keyword. This is a complete, source-sized family: the 55 rune-bearing original pages × both natural addition/subtraction directions, with no guessed phase or extra key. All **110** source-fixed decoders re-encrypt their inputs exactly, and the *highest* decoded page IoC is only **0.03980716** (p32, subtract), below even 0.04. Every page remains high-entropy/nonprose. The direct 56-word-to-56-page **repeating-key** reading therefore fails, regardless of a missing key word for runeless p50.

### 4. The 56 source words as independent physical-page prime starts

A separate consumer assigns the 40 p53 printed words to p0–p39 and the 16 p55 complete words to p40–p55. Each source word generates one **page-local starting offset** for the **authenticated p56 prime-totient inverse with non-consuming plaintext-F bypass**. Two historically motivated input types were frozen:

1. The sum of GP-prime values in the donor rune-word, used directly as a prime-sequence starting index. Among 55 rune-bearing recipient pages, **52 cannot be decoded even to a syntactically legal F-transparent rune stream**. Only p18, p49 and p55 survive; their best GP IoCs are 0.03558, 0.03776 and 0.03544.
2. Read the donor rune-word as a BASE29 integer modulo256, use that as a cell address in original row-major p50 table, and use its byte as the starting prime index. **54/55** rune-bearing recipient pages have no legal output. Only p32 survives, with best GP IoC 0.03650.

Legal survivors were enumerated under the original plaintext-F bypass. None reads as GP-native prose. These two prime-clock schemes and the preceding keyword Vigenère scheme are **complete source-sized mechanisms** disproved on unchanged original ciphertext. A key-word model involving a different operation is outside this gate.

## What this changes, and what remains unknown

There is now a **specific source-motivated, internally coherent pairing to investigate**: repeated moth graphics select p53+p55; whole-word handling gives 40+16 possible page tokens and 180+76 original page-level events; p50 supplies matching 180+76 cell zones and two 00 anchors. The paired word/register arithmetic is stronger than an isolated coincidence, because physical artwork picks the two donor pages before their sizes are examined.

Still, **no ciphertext-to-plaintext operation, authenticated key, typed payload, or downstream address follows from these equalities**. The source-selected p50/G 254-slot quotient has now also failed as a direct one-use additive key on the complete p53+p55 register. The zone clock and zero/sentinel equivalence are inferred, and direct original source input falsifies natural one-layer consumers. A productive successor would find an *independent original-authored instruction* determining a reversible word-to-page routing, a GP29 numeric transfer rule, or a byte decoder that uses the table zones. It should test a complete original passage and specify the success signature before tuning any additional phases. Repeating the arbitrary-pad/menu searches already retired elsewhere is not justified. A word donor could still designate a route or state rather than a repeated additive key.

## Reproduction

- [Complete moth-page 256-cell geometry, two-zero coordinates, original additive inverses, and all-secret lookup contradiction](../sims/lp2_moth_inner_outer_zero_anchor_sft.cjs).
- [p50/G 254-slot quotient as a direct key on the 254-rune moth register](../sims/lp2_moth_p50_gquotient_direct_key_sft.cjs) · [full report](../im-results/lp2-moth-p50-gquotient-254-direct-key-gate.md).
- [56-word source-to-physical-page prime-clock inverse and legal plaintext-F enumeration](../sims/lp2_moth_56word_primepage_sft.cjs).
- [Original p53/p55 moth pixel match and prior reused-pad scope](../im-results/lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md).
- Canonical inputs: \`resources/liber-primus/lp2-corpus.json\`, \`lp2-transcription.txt\`, \`lp2-ink-annotations.json\`, \`lp2-grid-256.json\` in the same source directory.

Every retained claim is a source count or a bounded original-cipher test. This note does not supersede the authoritative \`results/README.md\` statement that all 56 LP2 unknown pages remain unsolved.
