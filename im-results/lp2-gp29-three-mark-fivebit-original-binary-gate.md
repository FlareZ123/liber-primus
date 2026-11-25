# GP29 and large-mark classes: five-bit binary receiver, including all-secret alphabets

**Current decision (25 November 2026): direct binary ASCII is excluded under every stationary injective five-bit codebook on all nine unknown chapters, with or without the large marks. Eight private cyclic column codebooks also fail every chapter for 8-bit ASCII.** The 7-bit sensitivity tests retain some printable but nonidentifying witnesses; a declared broad English-text character register is impossible for all three red256 tapes and the terminal p54–55 rune tape. No LP2 plaintext or key. The original fixed-map/file-header and table receiver tests are retained below.

## New finite route and its rival

Original manuscript glyphs supply 29 GP29 rune identities and three **physically distinct large dot-mark types**, with dot counts 10, 13 and 23. This permits a 32-symbol register, the size of one five-bit code. The floral margin on physical pp40–55 contains five small left and right discs; the original p50 numeric field has 32 rows and eight columns. A human might reasonably infer a binary/digital receiver if these independent layout features were designed as a coordinated code. The rival is that three obvious punctuation designs were post-selected to fit 29+3=32; original small punctuation, word dividers and color also remain visible and no printed instruction names a five-bit codec.

Freeze the least-parametric one-to-one candidate: GP29 corpus indices **0..28** in canonical order, followed by **10-dot = 29, 13-dot = 30, 23-dot = 31** in increasing dot-count order. Insert each physical large mark **after** the page-local rune offset recorded in `lp2-ink-annotations.json`; preserve multiple marks at one offset in source order. Concatenate five bits per symbol MSB-first, without silently adding or discarding a terminal pad. Every rune and all 36 original physical large marks are preserved in this serialization. This decoder has a complete inverse given the symbol count and number of trailing bits. Ordinary four-dot stops and commas are intentionally outside the proposed 32-class register; their potential significance remains open.

## Frozen original-input readout

| Pages | Rune symbols | Large marks | Byte count | Residual bits | First 12 output bytes (hex) | Printable ASCII |
|---|---:|---:|---:|---:|---|---:|
| p0–2 | 729 | 2 | 456 | 7 | `7a24334f607ea552f84b3640` | 39.47% |
| p3–7 | 1145 | 8 | 720 | 5 | `a2d88a9450cae0e44036f3da` | 41.53% |
| p8–14 | 1729 | 1 | 1081 | 2 | `729d30ba6513471da61c7349` | 38.85% |
| p15–22 | 1903 | 4 | 1191 | 7 | `f00349e39ab63d40d5250c53` | 40.97% |
| p23–26 | 1021 | 2 | 639 | 3 | `0e0f533ae65454c8455af70c` | 38.65% |
| p27–32 | 1433 | 2 | 896 | 7 | `9b75478f194524c54e94795b` | 39.96% |
| p33–39 | 1680 | 8 | 1055 | 0 | `bb1c502b0741bccb0212b731` | 39.34% |
| p40–53 | 3008 | 2 | 1881 | 2 | `0267a35f28c35da43383942b` | 40.83% |
| p54–55 | 308 | 2 | 193 | 6 | `c4eb7d89ca9fb776d427c4e1` | 38.86% |
| solved p56 | 85 | 3 | 55 | 0 | `caecf27a7aa0d03c944639e9` | 29.09% |
| clear p57 | 95 | 2 | 60 | 5 | `6e0988d25ea28b2149497c30` | 46.67% |

The complete p0–57 source has **13,136 runes + 36 physical marks = 13,172 five-bit symbols**, yielding **8,232 bytes and four residual one-bits** (`1111`). The p57 unique 23-dot terminal maps to code31 (`11111`) under the frozen mapping. All 11 page ranges and the whole-source stream fail the predeclared file-type-at-start recognizers (PNG, PDF, ZIP, gzip, bzip2, xz, GIF, ELF, MZ) and fail a complete printable-ASCII receiver. No page readout recovers an independently typed instruction, a natural GP29 passage, or a verifiable key.

## Historically typed 2014 Tor-v2 continuation check

The historical Cicada continuations used **16-character RFC4648 Base32** Tor-v2 hostnames. Sixteen such hostnames consume exactly **256 five-bit codes**. Source imagery independently supplies three competing 256-event registers, which were frozen in earlier #1278/#1282: **A** = 225 red runes + all 31 physical 13-dot marks; **B** = the same 225 red runes + 30 red 13-dot marks + the final red 23-dot mark; **C** = the 225 red runes + 31 chapter marks (28 thirteen-dot and three ten-dot, including p7 black). Original page/rune offset order is unchanged and the alphabet/code assignment remains GP29 = 0..28; 10/13/23-dot = 29/30/31. Each source order deterministically gives sixteen 16-character Base32 hostnames.

| Registered event class | First 16-symbol host | Last 16-symbol host | Exact matches among seven documented 2014 Cicada onions |
|---|---|---|---:|
| A | `pisdgt3ap2svf66u` | `6zlwpe66nyeyrus6` | 0 |
| B | `pisdgt3ap2svf66u` | `zlwpe66nyeyrus67` | 0 |
| C | `pisdgt3ap2svf66u` | `kt66zlwpenyeyrus` | 0 |

Every output is automatically syntactically valid Base32 and that fact carries no evidentiary weight: Tor-v2 hostnames have no built-in checksum that authenticates the address as a working historical service. The direct event-to-Tor-base32 consumer fails the independently checkable first-party-host receiver for all three class choices. **The 256-event tapes do not actually cover the full hypothesized 32-symbol alphabet:** A contains only the 13-dot special type (30 represented codes); B contains 13- and 23-dot types (31 represented codes); C contains 10- and 13-dot types (31 represented codes). All three reach exactly 256 events by excluding at least one of the book's three large punctuation classes. Hence the global 32-class register and the red256-event count are independently source-visible observations but do not jointly authenticate a complete 32-code, 256-event channel. No archived service identity or original LP2 destination was established. Other historical hosts or encrypted/processed outputs are untested. The source still does not choose among the three event registers, and a same-length match to an expected Tor format cannot supply the missing selection. This result is distinct from the prior **red16 GP29-integer→Tor-v2** experiment on p3/p23, which has different source selection and numeric conversion.

## Fixed 32×8 table receiver from the same five-bit codes

The manuscript's printed p50 byte grid has **32 rows and eight columns**. The candidate 256-event set also has 32-compatible rune/mark identities and an exact 32×8 cardinality. This independently motivates one unkeyed table lookup: at event ordinal `i`, use event code `e[i] = 0..31` as **row** and `i mod 8` as **column**; output the printed table byte at that cell. It is the direct code-into-grid consumer, with no fitted IV, alphabet permutation, offset, or password. The only event alternatives are the three already physically specified A/B/C registers above.

| Event class | First 16 output bytes | Printable bytes / 256 | Distinct bytes / 256 |
|---|---|---:|---:|
| A | `2a ff 5c 19 56 fb 33 b7 2a af 5c 36 e6 38 c6 f8` | 102 | 115 |
| B | same first 16 | 90 | 117 |
| C | same first 16 | 110 | 113 |

The shared 32-byte start for all three choices is `2aff5c1956fb33b72aaf5c36e638c6f8d3961936e6894815d3b3c5c0a904a7c0`. There is no complete printable-ASCII readout or typed historical file header. More decisively, the **32 possible code inputs** have only **[30,32,30,30,30,31,31,30] distinct outputs** across the eight fixed columns of the printed grid. Six columns therefore contain source-native byte collisions. This direct reader is **not a lossless 32-symbol-to-byte cipher** over the complete rune/mark alphabet; a hidden state or auxiliary channel would be needed to invert it. It can only remain a hypothetical partial or processed payload reader.

The reader is implemented and asserted against all 256 physical events and the unchanged table in the same SFT. These negatives do not exclude an authored table lookup of different semantics. The lack of an original selector among A/B/C and absence of a typed output mean they should not motivate more unfrozen grid permutations.

## All-secret column test of a 32-row, eight-choice transition oracle

A second operation uses the 32 rows as a *state transition* rather than a register-to-byte decoder. The printed table independently fixes eight possible outputs for each of 32 input row states. A source-shaped candidate interprets the **previous ciphertext rune index (0..28) as a row** and allows a **different secret column (0..7) at every next rune**. This is maximally permissive about the column schedule: no column seed, offset, IV, reset, or sequence has to be guessed. The byte-to-GP29 interpretation is fixed before testing as the conventional BASE29 remainder; two literal five-bit projections, low five bits and high five bits, are bounded alternatives. The necessary condition for *every* original within-page adjacent pair `C[i-1], C[i]` is that `C[i]` occurs in the eight projected bytes of row `C[i-1]`.

| Byte→rune projection | Source pairs admitted by at least one secret column | Pairs impossible under *every* secret column |
|---|---:|---:|
| Byte modulo 29 (historical BASE29 type) | **3,234 / 12,901** | **9,667** |
| Byte low five bits | **3,031 / 12,901** | **9,870** |
| Byte high five bits | **3,005 / 12,901** | **9,896** |

The first original impossible transition alone is conclusive for the mod29 oracle: physical p0 begins rune values `[15,8,...]`, while table row15 projects to `[13,5,28,25,13,20,18,19]`. No secret column in 0..7 can produce the next original symbol8. The full physical-page test finds thousands of independent contradictions. SFT positives produce 399 successive legal transitions for each projection using hidden varying columns, then verify all 399 are accepted. This establishes a key-free **nonexistence result for every possible secret eight-column schedule under the fixed previous-rune-as-row architecture**. It does not exclude a concealed row state, prior-plaintext state, source-specified nonlinear relabeling, or an entirely different use of the grid.

The standalone [all-column original-input SFT](../sims/lp2_gp32_p50_row_input_allcolumn_gate_sft.cjs) reads unchanged page indices and the 256 original table bytes, asserts all three source-exact transition counts and its positive controls. This path is distinct from the table's previously investigated full-byte self-iteration (`state = table[state]`), whose 11- and 2-cycles are already known. Stop this specific row transition family without compensating for its contradiction by adding freely chosen row transformations.


## All-secret direct ASCII inversion (Agent16, 25 November 2026)

The historically authenticated 2013 space/tab carrier decoded to ordinary 8-bit ASCII, while the LP2 rune/large-mark register and 32-row panel motivate testing a five-bit transport. This is a conditional receiver, not a source-selected cipher. Unlike the earlier canonical-order pack above, allow **every injective map** from observed symbol types to the 32 five-bit codewords. Each independently tested chapter or page receives its own unrelated secret map. Grant both rune-tape directions and every byte alignment (eight offsets for 8-bit, seven for 7-bit); per-codeword bit reversal is absorbed in the arbitrary codebook. Only complete characters are scored, so an incomplete first/last field is free. No English score or key guesses determine the exclusions.

### Exact assignment formulation

For each observed type x and bit position j in its five-bit codeword, count the occurrences n[x,j] at the most significant bit of a complete octet. Every ordinary 7-bit ASCII character, including control characters, has octet high bit zero. A proposed secret code c therefore has cost sum_j n[x,j] bit_j(c). The complete number of high-bit violations is additive across rune types. Minimize this cost over injective assignments of observed types to the 32 codewords using a rectangular Hungarian assignment; the implementation checks the attained primal cost and dual feasibility. All unused symbols can be assigned leftover codes. This is an exact minimum for the ASCII high-bit condition, and consequently a lower bound for any stronger English/printability grammar.

For the less historically motivated **densely packed seven-bit character** alternative, a printable code 32–126 must have at least one of its two highest bits set. If both are within one five-bit codeword, charge a violation when both are zero. Ignore pairs straddling codeword boundaries and ignore DEL=127 in the assignment stage. Thus the seven-bit optimum is an exact minimum of a relaxed condition, only a lower bound on actual nonprintable characters.

| Original physical scope | 8-bit min, runes | 8-bit min, runes + marks | 7-bit lower bound, runes | 7-bit lower bound, runes + marks |
|---|---:|---:|---:|---:|
| Whole p0–55 | 3,308 | 3,299 | 1,133 | 1,181 |
| p0–2 | 117 | 120 | 22 | 26 |
| p3–7 | 203 | 209 | 59 | 57 |
| p8–14 | 341 | 341 | 102 | 102 |
| p15–22 | 377 | 379 | 116 | 118 |
| p23–26 | 175 | 177 | 46 | 46 |
| p27–32 | 272 | 267 | 77 | 81 |
| p33–39 | 343 | 335 | 91 | 96 |
| p40–53 | 660 | 677 | 212 | 216 |
| p54–55 | 28 | 26 | 0 | 1 |

The whole-book rune-only minimum is 3,308 violations among 8,097 complete octets; including the 31 unknown-page large marks gives 3,299 among 8,116. This excludes all chapter-private direct ASCII maps, including arbitrarily chosen secret alphabet order, not just the canonical GP29 code order. Individual page-private maps are excluded for 49/55 rune-bearing pages without marks and 48/55 including marks. The surviving pages for the octet condition are p14,p22,p32,p49,p51,p55, plus p15 when marks are included. They are inconclusive under this necessary condition, not successful decodes. Densely packed seven-bit strict printable ASCII is ruled out by this relaxed bound on eight of nine rune-only chapters and all nine marked chapters; the remaining terminal rune tape receives an exact follow-up below.

All three previously frozen red256 event tapes A/B/C separately fail 8-bit ASCII for every stationary injective codebook: minimum high-bit violations 15/14/10 respectively (159 complete octets at their minimizing alignments). For packed seven-bit strict printable ASCII, A and B have four relaxed zero alignments each; C has minimum one violation.

### Full seven-bit receiver on the red256 and terminal tapes

For a complete seven-bit character, require (i) at least one of its top two bits set and (ii) at least one of all seven bits zero. Split each condition across the actual participating codewords and express it as a disjunction of allowed bit masks. Repeated source types in a character are merged. Constraint propagation, injective bipartite matching and bounded depth-first search produce exact printable witnesses, or exhaust the finite tree when uncapped. The red256 A and B tapes each have two alignments with at least two different printable codebooks, and two more alignments hit the 30,000-node cap without a witness. C is impossible at all 14 alignments. Terminal p54–55 rune-only has two printable alignments, each with at least two different codebooks. The witnesses are punctuation-heavy nonprose (e.g. terminal begins `rP^D~3pT(oSI))(}xmqb`); these arbitrary choices do not identify a key or plaintext. The known-p57 plant also has competing printable witnesses, directly demonstrating that this weak grammar cannot identify authentic text.

A separate finite exact search tests the following explicitly declared English-text character set: uppercase and lowercase letters, digits, space, period, comma, semicolon, colon, question and exclamation marks, apostrophe, double quote, hyphen, slash, parentheses, underscore, at sign, tab, newline and carriage return. This set permits whitespace controls but excludes some legitimate ASCII punctuation (e.g. plus, equals, square brackets); it is not all English or all ASCII. For each character, enumerate all allowed bit patterns, intersect each participating rune-code domain, enforce generalized arc-consistency and a global injective matching, then branch over remaining finite domains. Local propagation may relax distinctness between variables, which can only admit additional candidates; complete assignments are checked. **All 56 direction/alignment cases across A/B/C and the p54–55 rune-only tape are exhausted or rejected by propagation, with zero witnesses and no node-cap hits.** This is a complete all-key exclusion for this specific character set and receiver, even allowing arbitrary punctuation/letter order. The actual p57 native transliteration plant's correct secret map survives propagation; exact recovery of a hidden map is not claimed. There is no source clue selecting dense seven-bit encoding in the first place.

### Eight private cyclic five-bit codebooks

The printed 32x8 panel independently motivates an eight-column clock. As a generous relaxation, give each rune ordinal mod 8 a wholly unrelated secret injective five-bit codebook. For each (column, bit position), at most 16 symbols can have a specified zero bit; for each adjacent bit pair within one five-bit code, at most 24 symbols can avoid 00. Count frequencies in every such class and sum all frequencies outside the top 16/24. This is a valid lower bound for every simultaneous key assignment. For octets, each column has at most one constrained bit position at a fixed alignment, so the separate class minima are attainable for that relaxed high-bit grammar. For seven-bit pairs, distinct bit-position constraints may conflict; the summed result remains a lower bound.

| Scope | 8-bit min, eight rune alphabets | 8-bit min, eight marked alphabets |
|---|---:|---:|
| Whole p0–55 | 3,187 | 3,171 |
| p0–2 | 107 | 110 |
| p3–7 | 189 | 197 |
| p8–14 | 324 | 325 |
| p15–22 | 359 | 361 |
| p23–26 | 164 | 164 |
| p27–32 | 257 | 254 |
| p33–39 | 320 | 316 |
| p40–53 | 627 | 642 |
| p54–55 | 24 | 23 |

The direct historical octet receiver therefore fails every chapter even with eight independent codebooks. The seven-bit relaxed bound also excludes a shared eight-column book key (642/703 violations), and p40–53 alone (28/25); other chapter-private seven-bit cases remain inconclusive. This is an all-secret representation capacity test, not a test of a specific table-cell value rule.

### Reproduction and decision

- [All-secret assignment SFT](../sims/lp2_fivebit_allsecret_ascii_assignment_sft.cjs) and [full page/phase summary](lp2-fivebit-allsecret-ascii-assignment-output.json).
- [Printable seven-bit CSP](../sims/lp2_fivebit_sevenbit_printable_csp_sft.cjs) and [exact witnesses/capped branches](lp2-fivebit-sevenbit-printable-csp-output.json).
- [English-register seven-bit CSP](../sims/lp2_fivebit_sevenbit_native_ascii_sft.cjs) and [finite search results](lp2-fivebit-sevenbit-native-ascii-output.json).
- [Eight-column capacity SFT](../sims/lp2_fivebit_eight_column_allsecret_ascii_sft.cjs) and [results](lp2-fivebit-eight-column-ascii-output.json).

The core implementations were executed on the connected ECMAScript runtime with original canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and ink annotation blob 0614aca67969a14ae006e0c1ae6aee6dcd8136e6. The 8-/7-bit assignment controls use 100 actual clear p57 transliterated characters under an independently fixed nonidentity five-bit permutation; known-key inverse recovers all bits. Four rectangular assignment instances additionally match brute-force minima. Eight-column controls use eight distinct codebook permutations and yield zero bound. Standalone Windows/Node wrappers have not separately run in CI.

**Retire the direct stationary-codebook 8-bit ASCII route for every full chapter and every red256 event register; even granting eight independent cyclic alphabet maps does not rescue the full chapters.** Do not expand arbitrary codebook or packed-seven-bit key searches from the nonidentifying printable witnesses. This does not reject compressed/encrypted intermediate bytes, noninjective coding, other transports, or other state schedules. No authentic clue fixes those extensions, and no unknown plaintext or key has been obtained.

## Decision for further research

The simple **literal five-bit pack** is rejected as an unencrypted byte/file payload decoder at source-visible chapter starts. The all-secret extension also rules out arbitrary injective stationary and eight-column codebooks for direct octet ASCII at chapter scale. Encrypted or compressed bytes, a separately source-selected state schedule, or a noninjective transport remain outside the result. The book does provide a concrete reason to ask about a 32-state receiver, while its observed layout does not determine how an 8-bit p50 table cell would be consumed, how punctuation classes would map to code points, or whether a second input chooses one of eight columns. Every additional parameter is presently free. A useful successor must retrieve a *first-party instruction* that fixes the missing table consumer or validates a complete original byte stream on untouched pages. Avoid guessing offsets, column permutations, byte XORs or extra cipher layers to rescue the failed direct readout.

**Inputs:** `resources/liber-primus/lp2-corpus.json` (physical p0–57 runes), `resources/liber-primus/lp2-ink-annotations.json` (36 large-mark source positions/classes). The SFT reads these unchanged and asserts the exact symbol count, two byte-aligned authentic controls, output prefixes and typed failures.
