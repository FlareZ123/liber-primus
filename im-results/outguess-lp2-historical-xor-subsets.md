# Direct 2014-style XOR secret sharing cannot expose a signed PGP message from the 16 LP2 OutGuess arrays

**Evidence classification:** exact algebraic exclusion for one historically demonstrated source mechanism, with authenticated historical positive control and a complete original-ciphertext triple scan. Agent 40, 2026-11-10. No new LP2 plaintext or hidden key recovered.

## Source-selected hypothesis

In the historical Cicada 2014 OutGuess stage, **three separately extracted 991-byte pseudorandom payloads XOR to a complete readable PGP-signed message**. Their original hex arrays, signatures and historical reconstruction are pinned in [resources/cicada2014-outguess-hex.json](../resources/cicada2014-outguess-hex.json). The three arrays all have length991, and XOR of all three begins the exact 32-byte ASCII line marker **-----BEGIN PGP SIGNED MESSAGE-----**. That is a legitimate precedent for independently placed encrypted-looking image payloads being deliberate XOR shares.

Agent 42 later extracted 16 nominal 58,152-byte arrays from original LP2 JPEGs under OutGuess's default key. Before discarding them as false-header material, we tested the **historically demonstrated aligned, bytewise XOR-share operation**, taking any nonempty subset of those 16 outputs with common offset0 and exactly shared byte indices.

## Exact invariance excludes every directly aligned subset

All 16 original outputs share an **identical 1,417-byte prefix** and an **identical 1,554-byte suffix**, not simply identical reported metadata. The shared binary prefix starts in hex

    c0 a1 28 e3 46 d2 35 72 fe 62 82 2e 50 f7 0d 8a ...

By elementary XOR parity, if k extracted streams are combined bytewise, each position in the shared prefix yields:

- **Even k:** byte0, identically over all of the common 1,417-byte prefix.
- **Odd k:** the same original common binary byte at every prefix position.

The actual 2014 PGP-signed-message marker starts with ASCII byte0x2d ('-'), which differs from both possible results at byte0 (0x00 for even subsets, 0xc0 for odd subsets). Consequently **no nonempty directly aligned XOR subset of these 16 streams can begin with the historically authenticated PGP signed-message format**, regardless of subset size. This covers all **65,535 possible nonempty subsets** algebraically, not just a shortlist. In particular, the 560 distinct three-share choices all fail the marker; an exact program also reconstructs all 560 full 58,152-byte triple XORs and confirms the absence of the marker.

The most ASCII-printable triple, pages **21, 59, 61**, contains **38.941051%** printable/whitespace bytes, comparable to random-looking binary and nothing resembling the authentic historical signed text. The complete family of pair/quad arrays similarly begins with 1,417 null bytes. This result does not claim that an XOR of an even number of streams could not hold meaningful binary data *after* its zero prefix, or that an odd XOR could not hold meaningful binary data after its shared prefix. It excludes the **unaltered, properly framed PGP-signed-message reconstruction that actually occurred in the known 2014 puzzle stage**.

## Complete PGP substring search after possible common-envelope padding

Because all source streams share a 1,417-byte leading template, a hidden payload might have started **after** that prefix. To test this without fitted offsets, the same original-image input pass constructed the full aligned XOR for **every two-, three- and four-stream subset**, respectively **120 + 560 + 1,820 = 2,500 combinations**, then searched **every byte offset in the entire 58,152-byte XOR result** for either the literal signed-message PGP beginning (ASCII **-----BEGIN PGP**) or its standard base64 prefix **LS0tLS1CRUdJTiBQR1A**.

**Original results: zero raw PGP marker occurrences and zero base64 PGP marker occurrences anywhere in all 2,500 complete streams.** This covers cropped-leading-prefix signed-message candidates for k2/3/4 under the historically used direct byte alignment, without selecting a favorite offset. A separately performed scan found nine isolated 3-byte gzip magic sequences scattered through the combinations, consistent with incidental 3-byte binary matches, and did not identify authenticated decompressed data. Such tiny magic matches are not ciphertext solutions.

The extended scan was executed with the **same 16 original extracted arrays** in [successful GitHub Actions run 42783306685](https://github.com/FlareZ123/liber-primus/actions/runs/42783306685) and preserved in [machine-output artifact 13746658165](https://github.com/FlareZ123/liber-primus/actions/runs/42783306685/artifacts/13746658165) under xor-share-summary.json. Every claim is restricted to the two checked PGP signatures; arbitrary encrypted or compressed binary after the shared template remains possible.

## Full 65,535-subset all-offset closure

An exact Gray-code incremental XOR scan expanded the all-byte-position PGP check to **every one of the 65,535 nonempty subsets** of these 16 source arrays. For every 58,152-byte aligned XOR result, it searched all positions for raw **-----BEGIN PGP** and base64 **LS0tLS1CRUdJTiBQR1A**. **Zero occurrences** were found in the complete family. The genuine historical three-share PGP message and its expected rune-coded body remain the positive control.

The exhaustive local Python/NumPy computation completed in **1.793 seconds** on the preserved original arrays. [Exact runnable complete-family source](../sims/outguess_lp2_xor_graycode.py). The earlier 2,500-subset search was independently executed in GitHub Actions, but this final full-family extension was executed locally, without a separate Actions run. It is a bounded exclusion for the historical direct aligned XOR operation and these PGP markers, including after common leading padding. Unaligned combinations and other formats are outside scope.

## Controlled execution

[The exact runnable CommonJS test](../sims/outguess_lp2_share_xor.cjs) reads all 16 original binary outputs produced by [the authentic OutGuess source extraction](outguess-lp2-original.md), asserts their original lengths, computes the exact all-image common prefix and suffix, and recovers the true three-share 2014 signed-message positive control from the repository's independent stable 2014 source. It enumerates all **560** original three-payload XOR combinations, checks the exact PGP prefix and reports the maximum ASCII fraction. The 2014 reference positive **passes**, the LP2 PGP signature count is **0**, and the 1,417/1,554 shared-envelope invariants are checked.

Execution on the original 58 JPEGs and actual recovered OutGuess arrays completed successfully in [manual GitHub Actions run 42782379488](https://github.com/FlareZ123/liber-primus/actions/runs/42782379488) and expanded all-offset confirmation [run 42783306685](https://github.com/FlareZ123/liber-primus/actions/runs/42783306685). The XOR source, exact original raw-stream SHA-256 hashes and derived marker checks are logged there. Original binary arrays remain preserved as [the earlier source-image extraction artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42778841092/artifacts/13744788807).

## Consequences and limits

The known 2014 three-way XOR operation is a legitimate clue-defined key-recovery attempt rather than an unconstrained language guess. It fails deterministically to recover a direct PGP signed-message header from any subset of the default-key LP2 outputs. This supports treating those arrays as unvalidated outputs of the detector, especially after [independent payload-free JPEG false-header controls](outguess-lp2-keyed-source-headers.md) showed that successful OutGuess headers can occur with no actual message embedded.

Aligned bytewise XOR is the scope. A different offset, bytewise permutation, cropped common envelope, non-PGP binary format, an arbitrary key, or a legitimate payload extracted by some other procedure is outside this test. There is still no recovered LP2 cryptographic key, unknown plaintext, or verified destination.
