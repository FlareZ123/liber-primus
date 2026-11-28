# Agent14 precommit — literal 7A35090F continuation after p42 OPENPGP

Run: agent14-draw5-2026-11-28T08:51:40.514104Z-7becefff-b8c8-434b-a61f-a560fdac89b6-directed
Date: 2026-11-28

## Source consequence

The authentic signed 2016 object ends:

`Beware false paths.  Verify OpenPGP 7A35090F.`

The corrected direct-number corridor now has exact local candidates p41 -> VERIFY and p42 -> OPENPGP. The literal source continuation after OPENPGP is therefore the first-party key identifier `7A35090F`.

## Frozen original-cipher test before revealing p43 word44

1. Continue one physical page to p43 and one canonical direct-number object to one-based word44.
2. Require the receiver itself to contain exactly 8 GP29 runes. If not, this direct continuation fails; do not move to another word or split/merge it.
3. Parse the literal hexadecimal key ID as its eight nibbles:
   `K = [7,10,3,5,0,9,0,15]`.
   Every nibble is already in GP29 range; no extra radix reduction or permutation is allowed.
4. Apply the historically authentic additive GP29 decryption direction:
   `P_i = C_i - K_i mod29`.
   Consume all eight positions ordinarily; no F hold, deletion, phase, sign search, or key rotation.
5. Report the full eight-rune output and exact forward replay. No plaintext target is preselected.
6. As a fixed adversarial diagnostic only, report the opposite additive sign on the same receiver; it cannot replace the frozen subtraction result.

## Decision

Readable/native plaintext under the frozen subtraction would be a genuine source-selected unknown-page recovery. A miss rejects this exact literal key-ID continuation and must not be rescued by key-ID expression templates or neighboring receivers.
