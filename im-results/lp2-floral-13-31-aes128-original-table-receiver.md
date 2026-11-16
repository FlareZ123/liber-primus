# Floral 13/31 as an AES-128 self-key in the original 256-byte table

**Decision:** A new, bounded **direct plaintext receiver** for the already authenticated floral-row selector is negative on the unmodified table. No unknown LP2 plaintext, key schedule, author-typed AES instruction, or continuation address is recovered. This report does not promote AES to a selected Cicada mechanism.

## Human-visible premise and strongest objection

The original floral frame on physical LP2 pp40–55 repeats a left five-dot pattern read **01101₂ = 13** and a right pattern **11111₂ = 31** (top-to-bottom, hollow=0). The numeric table printed on physical pp49–51 consists of **32 rows × 8 two-character base-60-coded byte cells**, hence 256 bytes. Reading 13 and 31 as *zero-based row addresses* selects two eight-byte rows and concatenates them into one **16-byte AES-128 key**. Omitting those two rows leaves 30×8 = **240 bytes**, or exactly fifteen 128-bit AES blocks; including them yields sixteen complete blocks.

This makes a finite, executable decryption attempt rather than expecting the selected 16 bytes to spell ASCII directly. It is an **exploratory source-constrained hypothesis**: there is no first-party author instruction selecting AES-128, ECB/CBC, zero versus one indexing, row order, or self-key extraction. The table's base-60 byte interpretation is also conditional. See [the prior original-image 13/31 decision](lp2-floral-13-31-original-direct-row-and-walk-gate.md) and the original [byte transcription](../resources/liber-primus/base60-grid.json).

## Fully fixed test

[SFT with original input, NIST AES-128 positive control, and complete 16-case output](../sims/lp2_floral_aes128_direct_sft.cjs) uses Node.js 22 built-in crypto only and no external dictionaries:

1. Read **all 256 unchanged source bytes** in the printed row order; verify SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
2. Select printed rows `13,31` as the primary zero-based 5-bit address reading; separately test conventional one-based rows `12,30`.
3. Concatenate the two eight-byte key rows in printed or reverse **row** order. Primary key is `7a3f1fda0eb82073719eace6b424bd50`.
4. Decrypt the printed row-major 256 bytes **or** the 240 bytes after omitting the two key rows; each length is an integral AES block count. Compare AES-128-ECB and AES-128-CBC with the all-zero IV, the only preselected IV-free/constant-IV conventions.
5. Demand a *typed plaintext receiver*: strict UTF-8 with at least 80% printable ASCII (including whitespace), or a direct one-byte-per-GP-index representation in which **every** decrypted byte lies in 0…28. Report counts and continuous readable run length. These are weak necessary gates, not a general test for all possible binary payloads.
6. Independently verify AES using NIST SP 800-38A AES-128-ECB ciphertext `3ad77bb40d7a3660a89ecaf32466ef97`, key `2b7e151628aed2a6abf7158809cf4f3c`, expected plaintext `6bc1bee22e409f96e93d7e117393172a`.

## Original-cipher outcome

All **16/16** fixed source-table decryptions failed **strict UTF-8**, and none emitted a direct GP-index-by-byte stream. Their longest run of ASCII letters/spaces was **≤4 bytes**; readable-ASCII/whitespace proportions were **76–102 bytes per 240/256-byte result**, no qualifying instruction. The natural primary case, zero-based row13 || row31 as AES-128-ECB key, remaining 240 rows as input, gave:

| Measure | Actual result |
| --- | --- |
| 16-byte key | `7a3f1fda0eb82073719eace6b424bd50` |
| First 16 decrypted bytes | `67c2c01810acb32aec58c636093efd40` |
| Printable ASCII or tab/LF/CR | 86/240 |
| Bytes in GP index range 0…28 | 28/240 |
| Longest contiguous alphabetic/space run | 2 |
| Strict UTF-8 | **False** |

The **NIST AES-128 control passes** and the pinned original-table hash passes, so the result is a test of the specified source-derived AES receivers rather than a broken cipher implementation. It does not test unknown AES IVs/modes, another byte order, page-wise cipher serialization, or a second encryption layer. No such additional choice currently has an author-supplied selector.

**Next cryptanalytic decision:** Require an independent clue that selects an AES operation and a typed receiver before exploring variant IVs or other key derivations. The 13/31 image reading remains meaningful source geometry and a potential row address, but it has not produced the plaintext needed to advance LP2.
