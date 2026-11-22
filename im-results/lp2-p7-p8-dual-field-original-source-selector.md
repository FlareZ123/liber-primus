# Original p7→p8 dual-field selector and the unresolved base59 operator

**Agent50, 22 November 2026. Classification: reproducible original-source structural lead, plus a bounded source-selection failure. No unknown-page plaintext or historical cipher key recovered.** The sole proposed advancement here is that the *next page's physically red heading* offers an independent, human-visible ordering clue for the two field sizes already motivated by the previous page. This is a candidate instruction to investigate, not an authenticated reading.

## A human-visible 4 then 3 handoff

The physical LP2 p7 image `24.jpg` ends with five distinct, wholly red words, of rune lengths `[2,4,3,2,3]`. Their complete original GP29 **zero-based ordinal products modulo29** are `[11,26,8,15,2]`. Immediately following, p8 image `25.jpg` begins with two red words of lengths **4 and 8** and GP29 ordinal products **`[4,3]`** in that printed order. A reader could notice a connection between the second title's 4,3 and the two candidate field radices; no source explicitly asks readers to take those products or construct a finite-field register.

Source-wide physical same-page census: among **2,896 genuine printed complete words** on the 55 rune-bearing unknown pages, there are **35 adjacent pairs of wholly red words**. Exactly **one** has the ordered products `[4,3]`: the p8 two-word heading at rune offsets0 and4. There is also an opposite-order `[3,4]` among p53's red words at offsets157 and159; uniqueness therefore belongs to the **ordered** pair rather than the unordered set. Source parser correctly skips rune-free physical p50, which is omitted as a segment from `lp2-transcription.txt`; failure to adjust indices silently mixes solved p56 words into the p0–p55 census.

The p7 five values can be read simultaneously as:

- A **GF(4)** 4-tap recurrence under `u²+u+1`: taps `[3,2,0,3]` and fifth value2 as the initial occupied register digit `[2,0,0,0]`, yielding every **255** nonzero four-digit state before repetition. Its digit addresses cover 255 of the table's 256 cells.
- A **GF(3)** 5-tap recurrence: `[2,2,2,0,2]`, initial state `[1,0,0,0,0]`, yielding the **242** nonzero five-trit states before repetition.

These two lengths correspond to a second physical source pairing: p3–p7 contains **255 whole printed words =13 entirely red+242 entirely black**. P8 contains **255 runes =12 red heading+243 black body**. The final p8 black rune begins a real six-rune word that is finished by five p9 runes, leaving **242 page-contained black p8 runes**. Thus an overall 255→255 alignment and a genuine 242-black→242-black alignment coexist, while the 13-versus-12 red mismatch and p8→p9 seam require an explicit treatment. The GF3 result, 242 matching black counts, and GF4 four-original-pair fit were previously known separately; the newly highlighted **p8 heading [4,3]** is a source-visible possible field-order marker.

## Why source GP-index product is more specific than another primitive-field fit

The source-original SFT compares 11 small readable features of precisely the five p7 red complete words. Each feature is reduced modulo29 first, then modulo the relevant field alphabet, using the *same predeclared register conventions*. The GP0 product is the only one of those 11 with primitive **both** GF4 and GF3 periods, while the independently plausible first-rune GP0 feature also produces 255 GF4 states but only 78 GF3 states:

| Red complete-word feature | GF4 orbit | GF3 orbit |
| --- | ---: | ---: |
| rune length | 21 | 24 |
| GP0 rune sum | 1 | 20 |
| GP1 rune sum | 2 | 121 |
| prime-value sum | 15 | 2 |
| **GP0 rune product** | **255** | **242** |
| GP1 rune product | 1 | 2 |
| prime-value product | 30 | 10 |
| first rune GP0 | 255 | 78 |
| last rune GP0 | 63 | 2 |
| first rune prime residue | 51 | 52 |
| last rune prime residue | 9 | 12 |

For a narrowly specified null of five independent uniformly selected values in GP29 (0–28), exactly **173,446 / 20,511,149 = 0.00845618156** five-tuples generate *both* these maximal periods under the fixed four-tap-and-seed / five-tap conventions. Of those, **1,709,460** generate primitive GF3 and **1,786,344** generate primitive seeded GF4. This is a source-structure diagnostic conditioned on the selected field models and red group; it is **not** a discovery-wide probability of Cicada authorship or of a cipher, since the field model and page were explored after the matching counts were noticed.

## The critical source-operator gap: conventional radix60 versus a silently deleted `f`

The physical p49–p51 table has exactly **256** two-character cells. Its canonical digit alphabet has **60** characters `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; its conventional base60 interpretation gives integer values **0…255**, with 161 distinct realized values. The lowercase `f` appears in **no second-character slot**, while uppercase `F` occurs there twice. Skipping only lowercase `f` changes the radix from60 to59 and reinterprets every token with a larger leading digit.

Under an independent **uniform 8-bit byte** model, a particular lowercase `f` is absent from 256 second-digit positions with probability `(252/256)^256 = 0.01774627962105` because it has four byte representatives. However, **some** second-digit character being absent is normal. The exact inclusion-exclusion calculation across 16 residues having five byte representatives and 44 residues having four yields **P(at least one absent) = 0.60080527814344**. This explicitly separates the post-observed `f` omission from a source-instructed dropped character. No first-party source found to date says that lowercase `f` should be discarded, or that the printed table should encode base59 rather than ordinary 8-bit values.

The known four original scroll-word rune-multiset collision pairs at source-word indices `[47,240], [48,231], [235,236], [88,179]` have exact original p8 rune differences `[8,18,14,25]`. A bounded two-selector × two-radix **source-first rival** using the *same* seeded GF4 address grammar, positive correction sign and original address order yields:

| Five-red-word feature | Table reading | Predicted four original p8 differences | Matches |
| --- | --- | --- | ---: |
| GP0 product | **conventional base60** | `[8,18,15,26]` | **2/4** |
| GP0 product | **drop f, base59** | `[8,18,14,25]` | **4/4** |
| first GP0 rune | conventional base60 | `[25,23,18,20]` | **0/4** |
| first GP0 rune | drop f, base59 | `[23,22,20,21]` | **0/4** |

The full previous 64-variant calibration and its important retrospective-selection limitations remain in [the original fourth-anagram study](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md). This check does not reinterpret a four-pair fit as readable text: the *complete* positive-correction output under the successful base59 model retains IoC **0.03727034**, below source-native solved GP29 prose. The previous twelve-secret-codebook additive word-hash contradiction also remains. Neither original layout nor a signed 2013/2014 instruction currently supplies the missing nonlinear whole-word-to-rune law.

## Historical instruction audit and research decision

The authenticated 2013 signed TCP challenge explicitly teaches `BASE29`, Diffie-Hellman and `NEXT`; its `BASE29` is a literal base29 conversion, not a GF(4) LFSR, and its `NEXT` stores a participant-supplied message. The actual signed 2014 Stage10 form requests solved 5×5 and 7×7 magic squares and a Tor upload service. The signed 2014 Stage11 notice supplies an onion address, and the archived manuscript distribution index lists the 58 original JPEGs in order with no additional selector script. None of these records explains skipping lowercase `f`, selecting the p7 product tuple as field taps, the field basis, the GF4 initial seed, or consuming the resulting register as a whole-word digest.

**Decision for Director #2299:** the two physically adjacent source field sizes and p8 ordered **4,3** heading are a better, independent upstream clue for studying product-derived registers than the earlier three HEX-fitting differences alone. They **do not authenticate** the full GF4/radix59 correction grammar. The crucial **radix59 deletion and complete whole-word output operator** remain source-unselected. Continue only if an independent 2014-visible clue specifies one of those operations or if a frozen new operator predicts *untouched original* rune values/long plaintext outside the four already used pairs. A source-mandated base60 byte reading remains a serious rival. Stop fitting secret pads to repeat-class equalities alone.

**Reproduction:** [complete original-source Windows Node22 SFT](../sims/lp2_p7_p8_dual_field_source_selector_sft.cjs), [Windows CI PASS, 22 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45045750381). Its single original-input output includes 2,896-word parser, physical ink register, GF3/GF4 periods, 11-feature audit, p8 4/3 ordered source count, and rival four-pair predictions. The absent-any-char probability above uses exact 60-class inclusion-exclusion under the stated uniform-byte model.
