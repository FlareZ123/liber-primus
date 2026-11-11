# Source-aligned 8-byte grid-row pad per 13-dot fragment

**Classification:** bounded original-input negative for one direct, reversible source-key architecture. No unknown LP2 plaintext, authentic key, or destination recovered.

## Hypothesis

The original LP2 source supplies three unusually compatible structures:

- 31 thirteen-dot stencils delimit 32 consecutive rune fragments.
- The first 28 fragments contain exactly all 12,956 unresolved runes; the final four contain the solved-page controls.
- The p49–51 numerical table is 32 rows × 8 columns, with each row providing eight base-60-decoded bytes.

A simple direct use not separately covered by the existing AES/ChaCha nonce and DES-row-key tests is to pair each of the first 28 fragments with one table row and repeat its eight bytes as a local Vigenère-like pad. The 8-byte phase resets at each fragment. This is a deliberately small source-derived candidate, not a claim that the manuscript specifies Vigenère.

The strongest available row ordering is the existing five-dot LFSR/de-Bruijn construction, rotated so its zero state occupies the unique empty fragment following the black thirteen-dot mark on p7. The test compares that black-mark-anchored order with the ordinary printed row order; it does not search arbitrary row permutations.

## Exact source mapping

The reproducer reconstructs the 256 source events from the original ink annotation and canonical rune corpus, sorts them by physical page/rune offset with a punctuation mark before a rune at the same offset, and derives the 32 fragment boundaries. It asserts:

- 256 events = 225 red runes + 31 thirteen-dot marks;
- 32 fragment lengths, summing to 225 red runes;
- the first 28 fragments sum to exactly 12,956 unknown ciphertext runes;
- the black mark is the eighth thirteen-dot mark, with a red mark at the same p7 offset; the empty fragment after it receives LFSR state zero;
- the canonical base-60 table is exactly 32×8 bytes.

The complete fragment lengths are:

`13, 0, 16, 0, 3, 0, 11, 0, 0, 14, 12, 0, 9, 11, 0, 16, 0, 19, 0, 10, 0, 8, 0, 3, 0, 59, 9, 0, 5, 0, 7, 0`.

## Tested reversible family

For fragment `f`, let `R_f` be its assigned 8-byte grid row. At position `i`, use:

`k_i = R_f[(i - start_f) mod 8]`

and project byte `b` to the symbol register by either `b mod m` or `floor(m*b/256)`.

The test covers only 16 fixed variants:

- two row orders: printed and black-mark-anchored de-Bruijn;
- two output registers:
  - direct additive GP29: `P_i = (C_i - s*k_i) mod 29`;
  - the solved-page-style GP28 predecessor-exclusion register, with a fragment-local first-rune passthrough and repeated ciphertext symbols representing the transparent marker 28;
- two byte projections: remainder or proportional scaling;
- both additive signs.

No key byte, row, phase, fragment boundary, alphabet order, or ciphertext offset is fitted. The canonical base-60 byte reading is used; the source table's separate base-59 ambiguity and incomplete all-cell glyph audit remain limitations.

## Original-input result

All 16 variants decode and exactly re-encrypt all 12,956 original runes. That is a generic invertibility check, not evidence that any key is authentic.

The original ciphertext IoC is **0.0344783979**. The eight direct-GP29 outputs have IoC **0.0344495141–0.0345143954**, essentially the uniform 29-symbol baseline `1/29 ≈ 0.03448276`. Their leading transliterations are not readable prose. The strongest direct-GP29 IoC is the black-mark-anchored order, remainder projection, negative sign:

`NGPLELFUEANGTHLWMUEOEOEAEOTEOFHOSNGMOEXEONGPTAPXSONOXLNGOOXHPBCWYTJTAMNGICROEATMMEOELEAEOELUNPWIACRMAHWFOEWSHTETHMEREOHIATHSJ`

The GP28 outputs likewise show no readable prose. Their raw IoC is **0.0352532915–0.0353509173**; because the transparent marker is a distinguished 29th output, this raw value should not be treated as an ordinary uniform-GP28 language statistic. The strongest raw IoC is the black-mark-anchored order, scaled projection, negative sign:

`SIAEOHORIPIATDAEPTHIADAIYNEJEOGXAAECFEONYTSDXENJCXIACPEOYNGIAAEFPOAEHAEISBEOUFCYHMFSFIXNGEGYWNGITNPINGGDBATTFWUUEAMIATHWN`

The script also performs mechanics-only positive plants under both registers and verifies exact recovery for all row-order/projection/sign combinations. These plants validate the implementation only; they do not authenticate the manuscript key.

## Continuous global-column clock (Agent 37, 2026-11-11)

A distinct clock is to let the table column advance continuously across 13-dot fragment boundaries, rather than resetting to column zero at each fragment: for unknown-rune offset \(i\), use column \(i\bmod8\), while the row changes according to the printed or black-anchored fragment order. This is a natural alternative because the table has eight columns and the 13-dot marks are punctuation events rather than runes. It is not an instruction printed in the manuscript.

The full 58-page corpus has 13,136 runes (\(0\bmod8\)); the 12,956-rune unknown prefix ends at phase 4, and the 180-rune solved tail contributes the remaining four phases. This is a structural length relation, not proof that the unknown cipher's column clock continues through the solved tail.

The reproducer tests eight continuous-clock GP29 additive inverses: printed/black-anchored row order × byte projection \(b\bmod29\) or \(\lfloor29b/256\rfloor\) × both signs. The column order is the literal printed order 0–7; no LCG8 phase or seed is fitted. Every model exactly re-enciphers the original 12,956 runes and passes a mechanics-only planted control. Original IoC is **0.0344783979**; the eight outputs range **0.0344498954–0.0345268116**. With the fixed Shakespeare GP-trigram model trained on the first 190,000 control characters, the original scores **−6.188688** and the eight outputs range **−6.284172 to −6.166210**. The best output remains nonlinguistic (prefix: `SNAELAEXBLSIAAENAIATHYLEOFOBCOEFPMGCFEOUTPIAGLGOEEAEONGTDTHCOTHYWIWEAPXRPIEALAEGRJEOTHJGOEEOCOENYIASTHDR`).

**Decision:** the continuous clock is another bounded negative for direct table-row additive use. It does not supply the missing source instruction: total-length divisibility does not determine whether the 13-dot marks reset the column, whether the solved tail shares the unknown cipher, or how the bytes map to GP29. The global-phase variant is also within the already-established all-secret public fragment×8-phase substitution bound; do not expand it into a seed/phase sweep.

## Decision and scope

The direct 8-byte repeating row-pad interpretation is a **bounded negative** under both clock conventions now tested: fragment-local column reset and continuous global column phase. Neither the printed row order nor the strongest five-dot/black-mark row order yields language-like GP output. This closes the simple direct Vigenère-style use of one table row per thirteen-dot fragment under these byte projections and clocks.

The continuous clock is a source-motivated alternative, not an authenticated instruction. The manuscript does not say whether columns reset at a 13-dot mark, whether the solved tail shares the unknown cipher, or how table bytes become GP29 key values. The 31-mark/32-row correspondence and zero-state alignment remain structural clues, not proof that the maker intended this table as a cipher.

This does not exclude a nonlinear cipher, a distinct source-derived state evolution, an outer encoding, a different plaintext register, or a different table interpretation. It does not establish that the 31-mark/32-row correspondence was intended.

This result supplements, but does not replace, the broader original-input exclusions in [the 256-event/grid synthesis](red-256-event-grid-correspondence.md), which covers per-fragment AES/ChaCha row nonces, DES row keys, full-table pads, and all-secret feedback bounds.

## Reproduction

Run from repository root with Node.js 22:

```sh
node sims/fragment_gridrow_vigenere_inverse.cjs
```

The script reads only the canonical corpus, original ink annotations and canonical base-60 grid; asserts the source event and fragment counts; enumerates 16 fragment-reset and 8 continuous-global fixed variants; checks exact original re-encryption; and validates both encoders/decoders with synthetic plants. It has no third-party dependencies and makes no repository-source modifications.
