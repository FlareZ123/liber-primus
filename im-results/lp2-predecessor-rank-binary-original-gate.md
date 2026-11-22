# Original LP2 predecessor-exclusion rank stream: direct compressed-file header gate

**Agent35, 13 November 2026. Experimental negative, exact original-input scope.** No unknown plaintext, selected key, historical encoder, decrypted file, or continuation endpoint was recovered.

## Causal idea

The ciphertext's unusual shortage of adjacent equal runes makes a *predecessor-excluding radix* a natural alternative to ordinary GP29-as-integer conversion. At each position, the encoder could choose any of the 28 current GP29 symbols except the preceding symbol; the apparent 29-symbol ciphertext could thereby transport uniform-looking base-28 digits. Prior Cicada rounds really did use numeric alphabets and BZip2-compressed binary stages. Neither historical source, however, explicitly chooses this LP2 transport, its initial state, or how to handle the 86 original repeat events.

This is distinct from the direct untransformed GP29-to-file test in [the integrated challenge](../workplace/integrated-original-inversion-challenge.md) and from GP28 *English substitution* gates. It tests a specific reversible route to **file bytes**, without English-language scoring.

## Frozen input and transforms

Read [canonical LP2 source transcription](../resources/liber-primus/lp2-corpus.json) unchanged, preserving all 12,956 unknown runes. Exactly **65 source-visible domains**: the 55 rune-bearing original physical pages p0–p55 (p50 is runeless), nine visual chapters with cuts p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55, and the complete unknown book.

For each domain, invert the predecessor-excluding alphabet in four natural orders: absolute increasing/decreasing GP index order and cyclic increasing/decreasing from the preceding symbol. Test two initial states: first rune as an IV, or an explicitly fixed GP rune F/index 0. Two repeat policies distinguish **skip the exact repeat** from **encode it as rank 28 in base29**, while all ordinary successors have ranks 0–27. Convert the full resulting radix-28/29 integer to *minimal big-endian bytes*, without guessing padding, byte rotations, key material or password. Search the resultant byte streams at exact byte alignment for BZip2 levels 1–9, gzip, XZ, PNG, ZIP, PDF, 7Zip, ELF, WebAssembly, SQLite, empty ZIP and JPEG signatures. Testing signatures anywhere within each stream also includes an embedded file header at a nonzero byte offset.

## Observed original result and control

| Measurement | Result |
| --- | ---: |
| Original source domains | 65 |
| Rank/exception/IV variants per domain | 16 |
| Full streams tested | **1,040** |
| Total resulting binary bytes scanned (variants counted separately) | **374,438** |
| Matching tested container magic at any byte-aligned location | **0** |
| Native positive plant | Exact inversion of a gzip-header integer encoded by cyclic no-repeat rank28 |

The positive plant proves the encoding/decoding implementation preserves the chosen file signature, including its integer representation. The original corpus produced no positive file-header result in this frozen family. This is a bounded direct-container *negative*, **not** a proof that ciphertext carries no binary data; encrypted/compressed-raw bytes, other transport grammars, unknown state, additional stages, and historically missing key sources remain possible. The natural GP28 mapping is source-motivated by the repeat deficit but not creator-authenticated.

**Reproducer:** [read-only, deterministic CommonJS original-input SFT](../sims/lp2_predecessor_rank_binary_original_sft.cjs). No CI job or new workflow was needed.

## Research decision

Do not continue broad unselected byte-rotation/file-header sweeps. Reopen the direct-file branch only if a clue supplies a particular predecessor-rank grammar, repeat handling, start state, or file framing. The absence of a header does not alter the larger unknown-LP2 solution status.
