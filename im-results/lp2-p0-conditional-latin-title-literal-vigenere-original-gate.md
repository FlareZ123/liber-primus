# LP2 p0 conditional Latin title as a literal historically motivated Vigenère key

**Agent10 · 22 November 2026 · original-input finite negative.** No original unknown-page plaintext or genuine key recovered. This is a newly executed bounded **direct title-as-key** consumer, independent of earlier tests using a **title-fitted *difference* pad** and the Latin `POMPEI` book-source branch.

## Source-selected input and weakness

The physical original p0 scan `17.jpg` prints a red first title of **13 GP29 runes**, in 8+5 rune-word groups, followed by a thirteen-dot marker. The source-positioned, geometrically derived (but still **unverified**) Latin-looking title candidate `SECUENDI RATIO` is documented in `im-results/lp2-p0-red-heading-sequendi-ratio-route-check.md`. Its direct one-Latin-character-per-GP-rune key is

`[15,18,5,1,18,9,23,10,4,24,16,10,3]`

and preserves the literal 13-rune print, with Latin Q represented by the conventional GP C rune. Historically, solved first-release `WELCOME` uses a title/keyword Vigenère under Gematria Primus, so applying a candidate red heading literally as its following black prose's repeating GP29 key is a plausible low-complexity **test**. The visual manuscript still does **not** independently authorize using this modern candidate title as its key, selecting the sign, or transferring it across chapters.

The original physical p0 black body is precisely **249 ciphertext runes after the red13**, and p3 is **217 independent ciphertext runes**. Under each sign, set key phase zero at the first rune in each original target. Exhaust exactly the two source-natural signs `P_i=(C_i±K_(i mod13)) mod29`, with every rune consuming one step. Freeze the 13 runes and use no phase fit, reset search, dictionary/crib score, byte file or source reinterpretation.

## Original runes, positive, result

| Original recipient | Sign | Full GP29 IoC | First actual transliteration |
|---|---|---:|---|
| p0 body249 | subtract | **0.033650731960** | `T OE U A J TH EA OE C W OE H R TH G I NG D U IA` |
| p0 body249 | add | **0.034233709030** | `B F J Y E L T P P Y AE EA I O P L D U M S` |
| p3 217 | subtract | **0.034988905957** | `C OE W W O AE H G NG T F R C U EO B X A A EO` |
| p3 217 | add | **0.032343403311** | `G F B N I X AE Y F G O A J TH M IA T TH P F` |

Original p0 body unmodified IoC is **0.034363259490**; ordinary clear GP29 p57 is substantially more concentrated. None of the original text recovers a coherent English/native-GP or Latin phrase. Every candidate re-enciphers the complete **249/217 original GP runes exactly**, as all repeating Vigenère keys necessarily do. An independent genuine **95-rune clear original p57** planted through both fixed sign encoders recovers **95/95** runes with the identical decoder.

The historically verified first-release **literal-plaintext-F bypass** supplies a stronger direct necessary gate: ciphertext F alone represents plaintext F and does not consume key, so a **non-F** ciphertext rune must never decode as F at its current advancing key phase. The four original title-as-key inverses violate this rule at fixed original positions:

| Target | Subtract first forbidden non-F→F | Add first forbidden non-F→F |
|---|---|---|
| p0 body249 | body local **32**, cipher N (after one transparent printed F), key N | body local **1**, cipher J, key E |
| p3 217 | local **10**, cipher T, key T | local **1**, cipher J, key E |

Every full title-as-key model with the actual transparently skipped F and these literal zero-start phases is therefore **impossible**, regardless of English scoring. The alternative direct no-skip interpretation is syntactically invertible but full-register random-looking. This negative is limited to using the unverified title candidate as a directly repeated 13-rune GP key; it cannot refute the heading itself or other source-selected cryptographic transformations.

**Reproduce:** `node sims/lp2_p0_conditional_latin_title_literal_vigenere_original_sft.cjs` with Node22. It checks the original p0 red13, exact black body/p3 clear-source lengths, all four original IoCs and exact first-failure offsets, GP29 reciphering, and full 95-rune original p57 plaintext plant. Independent of later claims of 27×27 heldout pages.
