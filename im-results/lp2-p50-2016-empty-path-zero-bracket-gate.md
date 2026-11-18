# Signed-2016 “path lies empty” versus the p50 zero-delimited interval

**Agent50, Director Issue #1631, 18 November 2026. Evidence class: authenticated-wording semantic gate plus exact original-table census. No plaintext, key, or new cipher operation is recovered.**

## Decision

The signed 2016 phrase **“The path lies empty; epiphany seeks the devoted.”** is authentic and the p50 table has a genuinely sharp conditional match: literal `00` occurs exactly twice, at row-major cells **192** and **229**, leaving exactly **36 nonzero cells** between them. Among every pair of equal printed tokens in the 256-cell table, this is the **only** pair with a 36-cell interior.

That does not make the phrase an independent selector for this interval. The source never says that “empty” means the token `00`, never names the pp49–51 table at this sentence, and never says that “path” means the row-major cells strictly between two equal tokens. The same signed message warns **“Beware false paths.”**

No authenticated source supplies a typed receiver for the 36 cells. Existing source-constrained receivers of this exact interval already fail independent known-text or typed-output gates.

Director #1631 therefore closes on its negative semantic-handoff fork. Preserve cells192–229 as an interesting original table bracket. Do not promote the signed phrase into an authored extraction instruction.

## Exact table census

The original table has:

- **256** cells;
- **161** distinct printed tokens;
- **69** token types occurring more than once;
- **127** unordered equal-token occurrence pairs;
- **95** intervals between consecutive occurrences of the same token;
- **49** token types occurring exactly twice.

For `00` specifically:

- occurrences: **[192, 229]**;
- separation: 37 cells;
- strict interior: **36** cells;
- no interior cell is `00`;
- the 36-cell sequence is exactly the previously preserved zero-bracket payload.

Across all 127 equal-token occurrence pairs, the `00` pair is the **only** one with strict interior length36. This is a real structural uniqueness result.

## Why “empty path” still underselects the object

The uniqueness above is conditional on two semantic choices that the signed sentence does not state.

### “empty” → literal token 00

The signed text uses ordinary English “empty.” It contains no word “zero,” no table token, no 192/229 address, no radix, and no pp49–51 reference.

Treating `00` as “empty” is compact and plausible. It remains an interpretation rather than an instruction.

### “path” → row-major interval

Once a table token is chosen, using the strict row-major interval between its occurrences is also compact. Yet the signed text never states that the numerical table should be flattened this way at this clue.

Moreover, “path contains no copy of its delimiter” is not special to zero. Every one of the **95 consecutive same-token intervals** is necessarily empty of another copy of that endpoint token by definition. So a weaker reading of “empty path” as “walk from one repeated token to the next without meeting it again” provides 95 table-native candidates.

The 36-cell uniqueness appears only after choosing literal `00` first.

## Source-native consequences already tested

The exact 36-cell interval has already received unusually strong receiver testing without producing an authenticated payload.

### 36 large-stop pairing

The manuscript has 36 large punctuation marks, giving a source-sized one-byte-per-mark candidate. The literal preceding-rune receiver is undefined for one mark at page offset0 and collides at a duplicated p7 mark. On the five independently solved/clear p56–p57 marked positions, the fixed additive receiver recovers only **1/5** known plaintext symbols under subtraction and **0/5** under addition.

### Adjacent post-table additive use

Using the 36 byte residues cyclically on the complete 170-rune passage immediately after the table produces ciphertext-like GP29 outputs under both fixed signs. A clear p57 plant round-trips exactly, so this is a functioning negative rather than an implementation failure.

### Known/clear terminal controls

The exact bracket was used to train a 36-byte repeating XOR pad on 36 already-clear p57 runes and then tested on **144** independent known terminal runes. It recovers only **1/144** exactly under each frozen GP representation. The planted positive recovers all held-out symbols.

### Typed historical formats

Already completed fixed receivers include direct RC4-key use, a 32+4 CRC/AES framing, whole-manuscript AES-CTR on source five-bit packing, and an OutGuess password reading. These fail their typed or known-source gates. They were source-motivated experiments rather than instructions present in the 2016 sentence.

The failure of those consumers does not prove the 36 cells are meaningless. It establishes that #1631 has no source-fixed receiver to run after the semantic selection.

## Relationship to stronger independent bracket routes

Separate work has reached cells192/229 using p57 DIVINITY arithmetic, signed 2013 numbers, p39 structure, and related p50/DH constructions. Those routes were explicitly excluded from #1631's selection test.

Their existence can strengthen the **table bracket as a structural object**. It cannot retroactively make the 2016 sentence a blind selector for it.

## Director fork

The conditional statement is now precise:

> If a solver independently decides that “empty” means the literal `00` token in the pp49–51 table and that “path” is the strict row-major interval between the two occurrences, the manuscript gives one unique 36-cell path.

The source does not supply those two decisions or a typed receiver. Accordingly:

1. close the 2016 semantic handoff;
2. preserve the exact zero bracket as an observed source feature;
3. do not use the phrase to justify new 36-byte cipher/file menus;
4. reopen only if an authenticated clue explicitly connects “empty/path” to the numerical table or names the receiver.

Reproduction of the table census and signed-wording assertions: `sims/lp2_p50_2016_empty_path_semantic_sft.cjs`.
