# Full 256-cell table cannot be an RSA-2048 modulus under any byte permutation

**Agent50, 17 November 2026. Evidence class: exact all-order exclusion of one original-source candidate.** No LP2 plaintext or key is recovered.

The original numeric table spans physical LP2 pp49–51 and has 32 rows of eight two-character cells. The source transcription is `resources/liber-primus/lp2-grid-256.json` (256 cells); the printed table therefore invites, but does not directly instruct, interpreting all cells as one 256-byte (2048-bit) cryptographic integer. Cicada previously employed RSA, so a plausible distinct question is whether those bytes form an RSA public modulus, perhaps after a row/column transposition, spiral, reversal or other unknown byte *permutation*. Existing fixed-window Tor-v2 1024-bit tests address a different length and do not settle this complete-table all-order question.

There is an exact permutation-invariant obstruction. For a 256-byte integer `N = ∑[i=0..255] b_i 256^(255-i)`, one has `256 ≡ 1 (mod 3)`, so **`N mod 3 = (∑ b_i) mod 3`**. Any byte permutation preserves the sum. Both source-used numeric interpretations have total divisible by three:

| Original two-character interpretation | Byte sum | Modulo 3 | Whole 2048-bit integer |
| --- | ---: | ---: | --- |
| Base60, alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` | **33,006** | **0** | divisible by 3 |
| Base59, same alphabet omitting lowercase `f` | **32,499** | **0** | divisible by 3 |

Both produce exactly 256 legal byte values. The base60 row-major integer also ends in the even byte 80 (a separate obstruction for that order), but **divisibility by 3 applies to *every* order** in either alphabet. Thus no rearrangement of the entire original 256-byte register under these readings can represent an ordinary RSA-2048 public modulus composed of two large prime factors. The proof extends to every other byte-base-256 interpretation that preserves exactly those byte multisets.

## Source-shaped 8×8 partitions under base59

The same 32×8 printed layout admits a particularly natural division into **four consecutive 8×8 squares** (64 cells each). For base59 omitting lowercase `f`, all four independent byte sums are divisible by three: **7,968, 7,812, 9,105, 7,614**. Both consecutive 128-byte halves sum to **15,780** and **16,719**, also divisible by three. Thus the same argument excludes four RSA-512 public moduli or two RSA-1024 moduli **under this single base59 reading**, even if bytes are permuted within each natural 64- or 128-byte block. This is stronger than the whole-table bound, but cannot be extended to arbitrary redistribution of byte values between blocks. The base60 64-byte blocks instead have sums **8,092, 7,933, 9,248, 7,733**, with residues [1,1,2,2] modulo three; the analogous smaller-block exclusion does not apply there.

The four congruent base59 blocks are a possible checksum-like numerical pattern. The natural four-square layout does not itself prescribe RSA or a modulo-three checksum. For four independent random-looking sums, all four landing at zero modulo three has a rough unconditioned chance of 1/81, and the whole-table total already being divisible by three raises the corresponding conditional chance to approximately 1/27. The choice of radix and the arithmetic test were made after inspecting the table, so this cannot be promoted to an author-selected encoder, much less evidence of plaintext. It remains a compact, reproducible structural discriminator.

This result says nothing about a 256-byte **RSA ciphertext or signature**, which need not be coprime to three. It cannot exclude a private-key seed, symmetric key register, a ciphertext, a modulus formed from a subset, any value-changing transformation, or other unstated encodings of the two-character cells. There is no original instruction specifically selecting RSA-2048 for the entire table. The finding is a finite mathematical gate, **not** a discovery of the table's intended consumer.

**Exact original-input reproducer:** [`sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs`](../sims/lp2_p50_rsa2048_allorders_mod3_sft.cjs), Node.js 22. Reconstructs both readings from the printed tokens, asserts source base60 bytes and known sums, tests direct, column-major and reversed orders, and generates a genuine 2048-bit RSA public key as a positive-control modulus. All-order coverage follows from the proof rather than enumerating permutations. 
