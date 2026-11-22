# P55 moth / solved P57 instar: complete literal-crib word-shape exclusion

**Decision, 12 November 2026:** The moth image on original LP2 p55 (`72.jpg`) supplies a human-visible thematic link to the **already solved** p57 PARABLE (`74.jpg`), whose opening reads “LIKE THE INSTAR TUNNELING TO THE SURFACE”. The most literal plaintext-reuse hypothesis would copy one complete contiguous set of solved p57 words into the 76-rune p55 text under a cipher preserving visible word boundaries and glyph count per word. This precise crib hypothesis is **false on the original printed word boundaries**; it gives no p55 key or new plaintext.

The exact complete page strings were read from `resources/transcriptions/liber_primus_master.txt`, source master units **71** (p55) and **73** (p57), explicitly matching image `72.jpg` and `74.jpg`. Slash-separated physical line wraps are removed, `-` and `.` delimit words, and the recognized runes are counted without GP transliteration.

| Original source page | Runes | Printed words | Word lengths, original order |
| --- | ---: | ---: | --- |
| p55, moth/tree | **76** | **17** | `1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3` |
| p57, solved PARABLE | **95** | **20** | `7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6` |

**Exact discriminator:** p55 includes a **one-rune word** and a **13-rune word**. The complete p57 passage has **neither** length. All **four** possible consecutive 17-word p57 windows fail the entire p55 shape. A same-source positive control, the first 17 words of p57 sought inside p57, matches uniquely at word offset zero.

This is a **structural impossibility** for copying exact p57 words under a strictly length- and word-boundary-preserving substitution, transposition within words, or any bijective per-glyph cipher that keeps the punctuation positions. It does **not** exclude an independently keyed cipher that changes word boundaries/lengths, uses a different original plaintext elsewhere, or interprets the two moth/instar illustrations as instructions rather than a literal crib.

Original-page reproducibility: `node sims/p55_p57_instar_crib_sft.cjs`. This is a motivated cross-page negative with an explicit small source and a single predetermined check, **not a general plaintext-language exclusion**. No unknown LP2 plaintext, cipher mechanism or key is claimed.
