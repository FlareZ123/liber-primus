# Terminal 256-rune / 32×8 table circumference coincidence and direct-codec gate

**Classification:** exact original-source count concordance, with conditional original-input exclusions. This is **not** recovered ciphertext, a decoded original LP2 word, or evidence that the historical maker intended this geometric layout.

## Source-visible reason to examine the split

The independently solved LP2 physical page 57, `PARABLE`, includes the instruction-like words **“WE MUST SHED OUR OWN CIRCUMFERENCES”** followed by **“FIND THE DIVINITY WITHIN AND EMERGE”**. The physical LP2 pp49–51 numerical table has exactly **32 rows and 8 columns**, i.e. **256 entries**. Removing its one-cell rectangular circumference without rearranging source tokens gives:

- Perimeter `2(32)+2(8)−4 = 76` cells.
- Interior `(32−2)(8−2) = 30×6 = 180` cells.
- Whole table `76+180=256` cells.

The manuscript's **final three physical pages** independently have the exact rune counts **p55=76, p56=85, p57=95**, hence `76 + (85+95) = 256`. Thus the page-55 unknown ciphertext length exactly equals the table's perimeter, and the two already-solved final pages together have exactly the table's interior length. This is a *precise, previously unexploited possible known-plaintext framing*: the 180 solved rune positions could in principle constrain an operation applied to the remaining 76 unknown rune positions. The arithmetic alone does not select any byte/rune codec, key, orientation, or cipher.

Source inputs and exact parser: `resources/liber-primus/base60-grid.json` (the byte interpretation of the printed tokens remains conditional), `resources/liber-primus/lp2-corpus.json` (physical-page indices), and the published p56 solved-plaintext regression in `sims/authentic_lp2_p56_totient_regression.cjs`. Physical p57 is already printed in plaintext, while p56 is encrypted using a separately established prime-totient shift.

## Source-frozen first gates

[Reproducer](../sims/lp2_terminal_grid_border_ring_sft.cjs) starts from the original 32×8 token positions and tests direct, lossless plaintext/byte interpretations without language-based parameter selection.

**Border → p55, direct unknown byte lookup:** traverse the 76-cell perimeter from each of the four corners, clockwise or counterclockwise. Under each of these eight geometric orientations, the same 8 duplicate-byte occurrences must produce the same visible ciphertext rune if a *single fixed unknown byte-to-GP lookup* describes the p55 ciphertext. They do not: **at least 5 out of 8** duplicate-byte occurrences demand contradictory rune outputs in each orientation (the eight orientations have 0–3 consistent repeats). Thus *all eight direct substitution layouts* are mathematically impossible, regardless of the secret lookup table. This does **not** exclude a grid-derived additive pad or any stateful, position-dependent encoder.

**Interior → solved p56+p57, row-major:** the 30×6 interior yields **180 bytes, 127 distinct values, 53 repeated values**. The natural fixed row-major alignment to the solved 85+95 rune positions contradicts every single fixed unknown byte→rune lookup for:

| Proposed 180-rune output | Contradictions among 53 repeated bytes |
| --- | ---: |
| Published solved plaintext (p56 decoded; p57 clear) | 47 |
| Visible solved-page runes (p56 ciphertext; p57 clear) | 51 |
| Required GP29 additive shifts from plaintext to visible runes | 43 |

If the lookup depends only on a byte's **value modulo29**, the additive-shift interpretation conflicts at **140 of 151 repeated residues**. The most literal additive-key reading, `byte mod29` in the same row-major order, matches only **6 of 180** required shifts (uniform expectation **180/29 ≈ 6.21**). This first natural key reading is indistinguishable from chance. It is a *bounded negative* for this exact framing, not for the historical table in any other role.

The p56 known-plaintext input is the independently published `AN END…` passage with GP spellings `EUERY` and `SEEC`. For p57 the original 95 printed rune indices are themselves the solved cleartext. No missing English letters are inserted before rune alignment.

## Consequence for subsequent research

The strongest contribution here is a **geometrically prescribed 76/180 source split that matches the last three pages exactly**, alongside early eliminations that prevent a futile search for a fixed table-byte substitution key. The theme of removing a circumference supplies a plausible human solve-path *hypothesis*, but the instructions were recognized after examining existing materials, so the count match is not independent confirmation of an authentic cipher.

The next decision-grade test requires an **additional original clue** fixing a nontrivial operation connecting table cell values to GP runes or state, before p55 is used to select the rule. A proposed chain must explain why the 180 solved rune positions fit it and then predict the untouched 76 original p55 ciphertext runes or meaningful plaintext, with exact re-encryption and wrong-key controls. Without that independent operation, arbitrary border/interior transposition or pad searches would be postselected and low-value.

No unknown plaintext, authentic key, or final Cicada destination was recovered. The authoritative solved-status statement in `results/README.md` remains unchanged.
