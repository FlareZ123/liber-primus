# Original p50 eight-column SHA-256/AES-256-CTR direct-consumer gate

**Agent26, 23 November 2026.** **Outcome: two direct interpretations of the printed 32×8 panel fail to recover unknown LP2 plaintext.** Original source column bytes are not the SHA-256 digests of their corresponding eight printed ciphertext sections under four fixed serializers. Treating each column as the AES-256-CTR key for the respective section instead produces nonlinguistic GP29 output on **all 12,956 original runes**, both signs, both historically candidate base59/base60 alphabets, and **all 1,024 source I/l readings**. This is a bounded original-input negative, **not** a statement about every possible table-derived key or sidecar codec; no original plaintext, authenticated AES opcode, or destination is recovered.

## Causal source hypothesis and strongest alternative

The intact original LP2 transcription contains eight genuine `$`-terminated sections covering physical pages **p0–2, p3–7, p8–15, p16–22, p23–26, p27–32, p33–39, p40–55**. Exact rune lengths are **[729,1145,1888,1744,1021,1433,1680,3316]**, sum **12,956**. Independently, the printed p49–p51 table is **32 rows × eight columns** of two-character numeric-looking tokens. An original player familiar with 256-bit digests/symmetric keys might hypothesize one 32-byte value per section, while a different interpretation could be a self-contained numerical message, pointer graph, unknown payload or independent key source.

These source features select the **number and width** of proposed operands but **do not select SHA-256, AES, CTR mode, initial counter, rune encoding, GP29 reduction, or encryption sign**. Consequently neither hypothesis merits a generic expansion to secret IVs and unrelated cipher families when this first typed experiment fails.

Canonical test data: [original 58-page GP indices](../resources/liber-primus/lp2-corpus.json), [original table, image-adjudicated glyphs](../resources/liber-primus/lp2-grid-256.json), authentic solved p57 source-native positive; standalone [Node22 CommonJS reproducer](../sims/lp2_p50_8column_aes256ctr_original_sft.cjs). Original-input Windows Actions **[PASS #45113998153](https://github.com/FlareZ123/liber-primus/actions/runs/45113998153)**; an earlier implementation-only aggregation typo in an obsolete initial run was corrected prior to this passing run.

## Independent digest test: 64 fixed source comparisons

Freeze source section boundaries and corresponding eight table columns. SHA-256 over each original section under four explicitly specified original-ciphertext encodings:

- one unsigned byte per literal GP29 rune index `0..28`;
- UTF-8 encoding of the rune glyph string with no injected spaces;
- UTF-8 of the concatenated canonical GP29 transliterations;
- UTF-8 of comma-separated decimal GP29 rune indices.

Compare the resulting **32 actual digest bytes** position-by-position with either the section's **physical 32-byte column** or its equally long **contiguous row-major 32-byte chunk**. In each printed table cell marked I/l ambiguous, allow *either* of the two source-supported glyph readings, not just the canonical one. The **64 predeclared comparisons** have **maximum one matched byte out of 32** and **zero complete matches**. A SHA-256 known-vector `abc` positive passes in the same execution.

**Exact limitation:** this only rejects literal SHA-256 checksums of the printed **ciphertext under those encodings**. Unknown plaintext hashes, unsupplied salts, hash chains, non-SHA hashes, and other packaging are not tested. None is selected by the original table geometry.

## Fully reversible original AES-CTR test

For each section `j∈0..7`, read original literal row-major byte positions `8r+j` for `r=0..31` as an exact candidate 32-byte key `K_j`. Under either historical candidate radix spelling, use conventional AES-256-CTR with **16 all-zero counter/nonce bytes**, encrypt 0 bytes to generate keystream `Z_j`, and consume each GP29 rune `C_i` with one keystream byte modulo 29. For frozen sign `σ∈{+1,-1}`:

`P_i=(C_i−σ*(Z_j[i] mod29)) mod29` and `C_i=(P_i+σ*(Z_j[i] mod29)) mod29`.

The test uses no English-guided key fitting, resets exactly at authentic `$` section boundaries, and preserves all rune/word/page identity and register lengths. A **95/95 GP29 solved-p57 planted positive** and full **12,956/12,956 source forward re-encryption** pass exactly. Such round-trips certify software correctness, **not** a real historical key/cipher. The genuine solved p57 original plaintext gives **IoC 0.062710**, independent of its synthetic encryption.

### Original outcomes

With the canonical base60 table and either sign, source-section IoCs range **0.034229–0.034826**, with full manuscript GP29 IoC **0.034478** for `σ=+1` or **0.034503** for `σ=−1`. Both produce uninterpretable GP runs, and the full 12,956-rune plaintext E-glyph counts are **450 / 477** (only 3.5–3.7%). The genuine native p57 control has IoC0.062710.

The **ten actual I/l source-glyph positions** give exactly **1,024 globally possible binary readings**. Since each reading affects one of eight independent column keys, testing each distinct column interpretation factors this complete Cartesian family into **25 column-keys for each radix** (instead of needlessly recomputing 1,024 full books); both signs are tested for each. This is an **exact exhaustive comparison for the stated source-key family**.

| Section | p0–2 | p3–7 | p8–15 | p16–22 | p23–26 | p27–32 | p33–39 | p40–55 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| I/l ambiguities in its column | 0 | 1 | 3 | 0 | 0 | 2 | 2 | 2 |
| Highest section IoC, radix60, either sign | .034663 | .034820 | .034757 | .034425 | .034799 | .034826 | .034593 | .034623 |
| Highest section IoC, radix59, either sign | .034870 | .034690 | .034720 | .034550 | .034495 | .034813 | .034556 | .034547 |

**Global max 0.034870** even with separate original I/l readings and cipher signs chosen opportunistically per section. All original unknown-source candidates remain at essentially chance collision rate; **no 150-rune native prose or 200-rune independent holdout** emerged.

## Separate anti-repeat BASE28 → AES-256-CTR byte-reader

The direct AES→GP29 additive cipher could be the *wrong plaintext register*: original ciphertext has 86 adjacent-equal runes versus roughly 447 under a naïve stationary uniform 29-symbol stream. The source-compatible alternative is to interpret each nonidentical successor as a 28-way rank **excluding the previous ciphertext rune**, package the ranks as a **base28 integer**, and then decrypt those bytes under the eight candidate 32-byte table columns. Equal successors are kept as a source-position exception tape; the original 12,956-rune source reconstructs exactly from the seed rune, rank digits and exception coordinates.

The distinct [original-input read-only SFT](../sims/lp2_p50_rank28_base28_aes256_original_sft.cjs) fixes both natural predecessor-exclusion ranks (static GP order and cyclic mod29), both forward and reversed base28 digit serializations, both big- and little-endian byte orders, both candidate numeral alphabets, **all actual I/l source glyph choices**, the original eight section resets and a zero AES counter. Because original column keys are independent, all globally valid source keys reduce to **400 concrete section decryptions** (by section: 16/32/128/16/16/64/64/64). Both original GP29 rank inverses and round-trip byte AES CTR are exact.

The maximum proportion of printable ASCII bytes by section was **[0.408257, 0.404971, 0.405669, 0.388676, 0.413509, 0.409144, 0.405190, 0.396465]**—all close to the unstructured-byte baseline `95/256≈0.3711`. No one of the **400 tests** reached 60% printable text, and no plaintext or recognizable human instruction was obtained. The complete execution [Windows Node22 PASS #45114431565](https://github.com/FlareZ123/liber-primus/actions/runs/45114431565) includes all original readout values, paired source-run lengths and exact software round-trips.

**Scope:** this rejects specifically a readable **ASCII byte readout** of this exact BASE28/AES/zero-IV family. It cannot reject encrypted compressed/nontext payloads, an unrecorded exception code, unknown bit-packing conventions, or wholly independent keys. The original artwork supplies no authenticated instruction selecting AES, the base28 package or the printed 32-byte column as its key. Do not add invented serialization, IV or offsets solely to make the failed candidate look promising.

## Decision

**Retire the direct eight-column-as-AES-CTR-secret and eight-column-as-ciphertext-SHA256-checksum hypotheses.** Adding guessed IVs, private secret streams or non-source-selected serializers would only convert the failure into unconstrained key hunting. The unsolved problem now requires an **independently Cicada-selected table operation, actual external key/preimage, or a different lossless changing-state receiver**; the original source provides none in these two proposed mechanisms. This report belongs to supporting negative results, not to the authoritative list of recovered plaintext or established encryption methods.
