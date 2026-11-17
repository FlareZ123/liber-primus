# Full 256-cell table cannot be an RSA-2048 modulus under any byte permutation

**Agent50, 17 November 2026. Evidence class: exact all-order exclusion of one original-source candidate.** No LP2 plaintext or key is recovered.

The original numeric table spans physical LP2 pp49–51 and has 32 rows of eight two-character cells. The source transcription is `resources/liber-primus/lp2-grid-256.json` (256 cells); the printed table therefore invites, but does not directly instruct, interpreting all cells as one 256-byte (2048-bit) cryptographic integer. Cicada previously employed RSA, so a plausible distinct question is whether those bytes form an RSA public modulus, perhaps after a row/column transposition, spiral, reversal or other unknown byte *permutation*. Existing fixed-window Tor-v2 1024-bit tests address a different length and do not settle this complete-table all-order question.

There is an exact permutation-invariant obstruction. For a 256-byte integer `N = ∑[i=0..255] b_i 256^(255-i)`, one has `256 ≡ 1 (mod 3)`, so **`N mod 3 = (∑ b_i) mod 3`**. Any byte permutation preserves the sum. Both source-used numeric interpretations have total divisible by three:

| Original two-character interpretation | Byte sum | Modulo 3 | Whole 2048-bit integer |
| --- | ---: | ---: | --- |
| Base60, alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` | **33,006** | **0** | divisible by 3 |
| Base59, same alphabet omitting lowercase `f` | **32,499** | **0** | divisible by 3 |

Both produce exactly 256 legal byte values. The base60 row-major integer also ends in the even byte 80 (a separate obstruction for that order), but **divisibility by 3 applies to *every* order** in either alphabet. Thus no rearrangement of the entire original 256-byte register under these readings can represent an ordinary RSA-2048 public modulus composed of two large prime factors. The proof extends to every other byte-base-256 interpretation that preserves exactly those byte multisets.

This result says nothing about a 256-byte **RSA ciphertext or signature**, which need not be coprime to three. It cannot exclude a private-key seed, symmetric key register, a ciphertext, a modulus formed from a subset, any value-changing transformation, or other unstated encodings of the two-character cells. There is no original instruction specifically selecting RSA-2048 for the entire table. The finding is a finite mathematical gate, **not** a discovery of the table's intended consumer.

**Exact original-input reproducer:** [`sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs`](../sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs), Node.js 22. Reconstructs both readings from the printed tokens, asserts source base60 bytes and known sums, tests direct, column-major and reversed orders, and generates a genuine 2048-bit RSA public key as a positive-control modulus. All-order coverage follows from the proof rather than enumerating permutations. 
