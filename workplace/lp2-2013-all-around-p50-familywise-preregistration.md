# Preregistration: 2013 “ALL AROUND” → p50 address familywise audit

**Frozen before the new corpus-control calculation.** The issue body already exposes the proposed target cell and token, so this is a prospective familywise audit of a known claim, not a blind test. No variant may be added after the control outputs are seen.

## Fixed source inputs and tokenization

- Pinned 2013 source archive: `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`.
- Comparable corpus: the ten human-readable PGP clear-signed messages in `im-results/data/cicada2013-clear-signed-text-corpus.json`; exclusions are recorded in that file.
- Exact behavior of pinned `2013/004-first-onion/gematria.py`: uppercase; replace `QU` with `CW`, then `Q` with `K`; greedily match the longest lookup token (including 3-letter `ING`), then 2-letter digraphs, then single letters. Preserve its aliases (`U/V`, `C/K`, `S/Z`, `NG/ING`, `IA/IO`). The GP0 index is the rank of the resulting prime value in the 29-prime GP29 order.
- Target phrase, exactly as printed in the OS message: “THE KEY IS ALL AROUND YOU”.
- The source phrase is segmented as 19 GP29 tokens under the exact participant function. Character-based controls use the uncompressed 20-letter string after stripping spaces/punctuation.

## Frozen address grammar

- A direct GP0 address is the sum of zero-based GP29 indices, with **no modulo**, no offset, no rotation, and no alternate origin.
- The only permitted table address is zero-based row-major on the original 32×8 table.
- “All around” means membership in the fixed 76-cell perimeter, not a fitted ring or traversal.
- At a selected cell, compare the same token under base60 and base59; do not change radix by downstream match.
- Do not inspect p53 red annotations or use p53 as a tuning target until the address/control counts are complete.

## Frozen alternative family

1. **GP0 whole-token sum:** sum the 19 GP29 indices of the target phrase. Apply the same sum to every 19-token window in the comparable corpus. Only sums 0–255 are valid direct addresses.
2. **GP-prime sum:** sum the 19 prime values from the original table. Record the raw sum and its signed BASE29 representation, but do not silently treat a BASE29 string as a p50 cell address.
3. **Character-based controls:** compute A0Z25 and A1Z26 sums for the 20-letter target string. Apply the same arithmetic to every 20-letter window in the corpus; only direct sums 0–255 are valid addresses.
4. **Full-message controls:** compute whole-message GP0 and GP-prime sums for all ten source messages, with the same direct-address rule.
5. **Documented 2013 alternative:** record the prime-echo pause values 1033 and 3301 as historical source values, but do not delete digits, reduce modulo256, or use them as addresses unless a separately documented instruction selects that operation.

## Precommitted counts

For every valid direct address in the GP0, character-based, and full-message families, count:
- how many addresses land on the 76-cell perimeter;
- how many select a cell whose base60 token value equals 180;
- how many select a cell whose base59 token value equals 180.

Report all address collisions and all family counts, not just the target hit. The target’s p53 receiver is a separate downstream consequence and is not part of address selection.

## Decision rule

A single target hit is insufficient. The GP0→cell252/base60 claim remains a candidate only if its address grammar is exceptional within this frozen source corpus and alternatives, with no post-hoc phrase, radix, origin, or traversal choice. Otherwise downgrade it to an unvalidated navigation hypothesis and identify the missing first-party selector.