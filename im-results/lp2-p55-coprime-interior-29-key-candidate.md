# p55 coprime-interior selector: a 29-rune key candidate

**Status: intermediate source-paired hypothesis. This is not recovered plaintext, a complete p55 decoder, or an authenticated cipher key.**

## Human solve-path hypothesis

Three visible pieces of the manuscript can be read as one instruction chain:

1. Solved p7 explicitly says that the **totient function is sacred**.
2. Solved p57 says to **shed our own circumferences** and find what is within.
3. Original p55 has 16 complete printed words beginning on that page, with visible word boundaries and rune lengths that can serve as the totient inputs.

A plausible human operation is therefore: for each complete p55 word of length n, discard its first and last runes, then select only strict-interior positions i whose one-based index is coprime to n. Euler's totient counts the integers in 1,...,n coprime to n. For n>1, position n is not coprime, while position 1 is the removed first boundary; consequently the number of selected interior positions is exactly phi(n)-1.

This is a plausible source-constrained reading, not a uniquely compelled instruction: the pages do not literally say “select positions coprime to each word length.” The important difference from an arbitrary key search is that the mathematical operation is selected by the explicit totient and circumference language, and it makes a locked prediction about the number of selected runes.

## Exact original-data derivation

The original p55 image is resources/liber-primus/72.jpg. It contains 76 runes: one initial rune completing a word carried from p54, followed by 16 complete words beginning on p55. The complete-word lengths, reproduced using the original page/word parser, are:

[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]

For these lengths:

- Total strict-interior runes: sum(n_i-2)=43.
- Totient sum: sum(phi(n_i))=45.
- Coprime strict-interior selector count: sum(phi(n_i)-1)=29.
- The 29 selected runes are a subset of the 43 interiors; 14 interior runes remain unselected.

The correct arithmetic matters: sum(phi(n_i)) is **45**, not 43. The 43 count belongs to all strict interiors. This is not a totient-based resegmentation of 43 runes.

Per-word selected counts are:

[1,0,0,1,1,0,11,1,1,0,5,5,0,1,1,1]

The selected GP29 indices in original word/position order are:

[10,2,5,28,0,14,10,19,1,5,13,8,21,20,13,12,18,10,6,14,6,15,12,2,2,18,5,11,18]

The historical base-29 alphabet 0123456789ABCDEFGHIJKLMNOPQRS serializes those 29 indices as:

**A25S0EAJ15D8LKDCIA6E6FC22I5BI**

This 29-character string is a **candidate key/password**, not plaintext. Reproduction and exact word-boundary checks are in [sims/agent43_p55_coprime_interior_key.py](../sims/agent43_p55_coprime_interior_key.py).

## Candidate receiver and decisive test

The most concrete historically grounded receiver worth considering is OpenPuff v4.00, because OpenPuff was used in the earlier Cicada round and the original LP2 p33–p39 pages form a contiguous seven-page cuneiform section (50.jpg–56.jpg). The proposed test is one A-only password attempt using the base29 string above, B/C disabled, on those seven original JPEGs in their original order, with the single JPEG depth frozen by the successful native calibration in [Issue #1049](https://github.com/FlareZ123/liber-primus/issues/1049).

The carrier/receiver link remains conjectural. The manuscript does not explicitly say to use OpenPuff on these JPEGs, and no authenticated source says that this p55-derived string is an OpenPuff password. Earlier original-chain tests with A=33011033 and A=10333301 were bounded negatives; they must not be repeated. The 29-rune selector is a genuinely different source-derived password candidate, not permission for a password, carrier-order, or depth sweep.

**Execution status:** no native OpenPuff run has been performed. Further original LP2 password variants require Director coordination under [Issue #39](https://github.com/FlareZ123/liber-primus/issues/39) and the calibration/decision record in [Issue #1049](https://github.com/FlareZ123/liber-primus/issues/1049). A successful test must extract a real file whose bytes and type can be inspected; no output or a corrupted stream rejects only this frozen key/receiver/depth combination.

## What this does not establish

- It does not decode the 29 selected runes into English.
- It does not account for all 76 p55 runes, including the inherited p54 carry and the 14 unselected strict-interior runes.
- It does not provide a reversible p55 ciphertext/plaintext mapping for the 33 exterior runes or satisfy waiting [Issue #41](https://github.com/FlareZ123/liber-primus/issues/41).
- It does not rescue the separate all-position, depth-totient, two-edge-sum codec rejected in [lp2-p55-whole-word-symmetric-totient-gate.md](lp2-p55-whole-word-symmetric-totient-gate.md).

The next useful decision is whether the Director authorizes exactly one native OpenPuff test with this frozen source-derived password. Do not tune the selector, serialization, password, carrier subset, order, or depth if that test fails.
