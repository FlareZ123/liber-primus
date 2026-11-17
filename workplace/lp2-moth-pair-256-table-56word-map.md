# Repeated moth pages as paired word and table registers (original LP2)

**Agent23, 17 November 2026. Classification: source-selected, *conditional* structural lead with failed direct receivers. No unknown plaintext, authentic page key, established cipher inverse or Cicada destination.**

## The strongest source-directed alignment

Original archive 70.jpg (physical LP2 p53) and 72.jpg (p55) reproduce nearly the **same moth illustration**; an earlier image-registered source census independently established this and traced the drawing to solved LP1 p05. The authors visibly selected both images. The p55 first rune is a single NG **continued from the last word on p54**; printed words cross physical page boundaries and should not be miscounted as two words. With that page-local carry treated as belonging to its p54 word, two genuinely existing original moth-bearing text registers have the following lengths:

| Original input | Complete local words | GP29 runes in those words | End mark | Rune-or-marker events |
| --- | ---: | ---: | --- | ---: |
| p53, original 70.jpg | **40** | **179** | one original red 13-dot mark after rune 179 | **180** |
| p55, original 72.jpg, excluding incoming NG | **16** | **75** | one original red 13-dot mark after rune 76 | **76** |
| Paired moth material | **56** | **254** | two distinct 13-dot marks | **256** |

The 56 donor words have a potentially meaningful target: the **56 unsolved physical pages p0–p55**, partitioned naturally into **40 pages p0–p39** and **16 final pages p40–p55**. The latter 16 pages share the floral chapter artwork. This is a source-visible matching of *counts*, not an instruction saying which word addresses which page.

Independently, original p49–51's 32-row by eight-column numerical table has **256** two-symbol cells. Its one-cell **outer perimeter contains 76 cells**, leaving exactly **180 interior cells**. The two duplicated-moth registers therefore match the table's inner/outer geometry *including their own printed terminal marks*, and their **40+16 word count** also matches the unknown page inventory. Physical pages p53+p55 are the **only unordered pair of the 55 rune-bearing unknown pages with exactly 255 total runes** (179+76); that less precise 255 count includes the p54 carried rune and excludes both terminal marks.

All four correspondences are mechanically checkable on original ciphertext and layout. Taken together, they nominate a **possible key-sharing and table-traversal route** that earlier isolated 180/76 hypotheses did not single out. This is not proof of deliberate encoding. It would require an independent authored rule about the event-to-cell map and how numeric cells transform runes.

The clear p57 PARABLE says to shed *circumferences*, followed by finding divinity *within*; the signed 2016 text says the book's words are the map and their numbers are the direction. Those are context for considering perimeter, interior and word inventories. Neither text explicitly commands this alignment.

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

### 2. All-secret, fixed byte-to-rune lookup

If the table is a fixed substitution from each numeric byte to a GP29 rune/13-dot event, the *same* byte must always correspond to the *same* event. This is a necessary condition independent of any undisclosed substitution table. On the fixed source-anchored alignment:

| Zone | Repeated byte occurrences | Contradictory rune/marker emissions |
| --- | ---: | ---: |
| Interior p53 | 53 | **50** |
| Perimeter p55 | 8 | **8** |
| Both zones sharing one lookup | 95 | **90** |

For example, the interior numeric value 198 occurs at paired event indices 12 and 25 but aligns to distinct source rune indices 3 and 19. Consequently **no** deterministic stationary byte→rune lookup can explain those aligned original events; even granting a separate arbitrary secret lookup per zone fails. This restriction applies only to the conjectural zero-anchored alignment and **stationary** mapping; an evolving cipher or a differently keyed receiver is still possible.

### 3. The 56 source words as independent physical-page prime starts

A separate consumer assigns the 40 p53 printed words to p0–p39 and the 16 p55 complete words to p40–p55. Each source word generates one **page-local starting offset** for the **authenticated p56 prime-totient inverse with non-consuming plaintext-F bypass**. Two historically motivated input types were frozen:

1. The sum of GP-prime values in the donor rune-word, used directly as a prime-sequence starting index. Among 55 rune-bearing recipient pages, **52 cannot be decoded even to a syntactically legal F-transparent rune stream**. Only p18, p49 and p55 survive; their best GP IoCs are 0.03558, 0.03776 and 0.03544.
2. Read the donor rune-word as a BASE29 integer modulo256, use that as a cell address in original row-major p50 table, and use its byte as the starting prime index. **54/55** rune-bearing recipient pages have no legal output. Only p32 survives, with best GP IoC 0.03650.

Legal survivors were enumerated under the original plaintext-F bypass. None reads as GP-native prose. These are two **complete source-sized mechanisms** disproved on unchanged original ciphertext. A key-word model involving a different operation is outside this gate.

## What this changes, and what remains unknown

There is now a **specific source-motivated, internally coherent pairing to investigate**: repeated moth graphics select p53+p55; whole-word handling gives 40+16 possible page tokens and 180+76 original page-level events; p50 supplies matching 180+76 cell zones and two 00 anchors. The paired word/register arithmetic is stronger than an isolated coincidence, because physical artwork picks the two donor pages before their sizes are examined.

Still, **no ciphertext-to-plaintext operation, authenticated key, typed payload, or downstream address follows from these equalities**. The zone clock and zero/sentinel equivalence are inferred, and direct original source input falsifies natural one-layer consumers. A productive successor would find an *independent original-authored instruction* determining a reversible word-to-page routing, a GP29 numeric transfer rule, or a byte decoder that uses the table zones. It should test a complete original passage and specify the success signature before tuning any additional phases. Repeating the arbitrary-pad/menu searches already retired elsewhere is not justified.

## Reproduction

- [Complete moth-page 256-cell geometry, two-zero coordinates, original additive inverses, and all-secret lookup contradiction](../sims/lp2_moth_inner_outer_zero_anchor_sft.cjs).
- [56-word source-to-physical-page prime-clock inverse and legal plaintext-F enumeration](../sims/lp2_moth_56word_primepage_sft.cjs).
- [Original p53/p55 moth pixel match and prior reused-pad scope](../im-results/lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md).
- Canonical inputs: \`resources/liber-primus/lp2-corpus.json\`, \`lp2-transcription.txt\`, \`lp2-ink-annotations.json\`, \`lp2-grid-256.json\` in the same source directory.

Every retained claim is a source count or a bounded original-cipher test. This note does not supersede the authoritative \`results/README.md\` statement that all 56 LP2 unknown pages remain unsolved.
