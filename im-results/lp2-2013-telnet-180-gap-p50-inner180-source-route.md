# Historical 2013 telnet 180-prime omission matches 2014 LP2 table's 180 interior cells

**Agent 12, 15 November 2026.** This is an independently source-motivated **candidate cross-round selector**, with an explicit negative direct transport. No unknown page plaintext, key or author-signed instruction is recovered.

## The two original-facing clues

The 2013 Cicada telnet command `primes` is preserved as a participant-era transcript in [the 2013 first-onion historical repository](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md#primes). The printed sequence goes directly from **71 to 1229**, omitting every prime **73 through 1223**, and then continues with 1231,1237,1249,1259 etc. The printed list also uses double spaces after 29 and 3257. The preserved transcript is not a signed direct source or live server binary; it could contain historical capture errors. The **exact omitted prime ranks** are one-based **21 through 200 inclusive**, hence **180** integers, with original order completely determined.

The 2014 Liber Primus source contains a **32×8 two-character numerical table** spanning LP2 pages 49,50,51 (original JPEGs 66–68). Under the existing source-derived byte interpretation in [the preserved grid resource](../resources/liber-primus/lp2-grid-256.json), the 256 table cells partition into **76 one-cell-thick outside-rim cells** and precisely **30×6 = 180 interior cells**. The source artifact fixes this printed geometry; using its 180 interior cells requires a selected one-cell boundary but no ciphertext-derived tuning.

The independent 2013 omission count equals the 2014 inner-table count **exactly**. This is a potentially useful human-visible way to select a *specific 180-entry prime tape* for the non-rim part of the 2014 table, distinct from unconstrained keyword hunting. The first prime of the gap, 73, was in the original 29 GP29 prime-weight alphabet (GP rune L, zero-based rune index 20), and 1229 also appears as an independently verified sum of a 2013 Instar Parable clause. Those further correspondences are contextual only; they do not specify a decoder. The omission could be historical output truncation or an unrelated 2013 staging choice.

## Frozen affordable direct consumer

To avoid creating a new unlimited prime-key search, the first trial uses the two most natural table/prime byte relations without adjusting their order to match the ciphertext:

1. Read the **180 interior bytes in ordinary printed row-major order**, row1–30, column1–6, from the 32×8 source table.
2. Read precisely the **180 omitted primes in strictly ascending order**, rank21–200.
3. Treat the prime's low eight bits as a possible byte mask. Test fixed inverses: **(table−prime) mod256**, **table XOR (prime mod256)** and the inverse sign **(table+prime) mod256**. Each is reversible byte by byte and needs no guessed parameters.
4. For each result, measure direct ASCII-readable byte fraction and GP29 low-residue index of coincidence. Compare against native text, without trying byte rotations, reverse primes, row reshuffles, free phase, or flexible text fits.

| Candidate 180-byte interpretation | ASCII-readable characters (printable or tab/LF/CR) | Verdict |
| --- | ---: | --- |
| Original 2014 table interior, untransformed | **73/180 = 40.56%** | not direct ASCII plaintext |
| Subtract omitted prime low byte | **70/180 = 38.89%** | not plaintext |
| XOR omitted prime low byte | **56/180 = 31.11%** | not plaintext |
| Add omitted prime low byte | **70/180 = 38.89%** | not plaintext |

The GP29 residue coincidences are likewise close to the uniform-rune regime, with no native English signal. A fresh 180-byte ASCII test message, byte-encrypted under both fixed prime-addition and XOR relations, is **exactly recovered** by both inverse implementations. The source-grid and omitted-prime counts are independently asserted before comparison.

## Decision

Retain the count alignment as a **conditional, separately sourced key-tape hypothesis**, not as an established cryptographic relationship. The direct row-major additive and XOR consumers fail to reveal plaintext; they do not rule out a selected transposition, higher-radix prime mapping, non-ASCII payload, or an operation involving the **76-cell rim**. A successor investigation is worthwhile only if an original image mark, authentic 2013 instruction, or dated contemporaneous solver account independently selects the prime-to-grid permutation or an explicit operator; this is the missing ingredient. This route is stronger than arbitrary number play in that **all 180 input primes are chosen by a concrete original-era omission and the 180 table positions by 2014 artifact geometry**, before any ciphertext scoring.

**Independent execution:** [Windows Node22 source SFT run 43767129552](https://github.com/FlareZ123/liber-primus/actions/runs/43767129552) completed successfully with the entire original-source program and both companion SFTs passing their assertions.

**Reproduce:** [read-only Windows Node22 CommonJS SFT](../sims/lp2_2013_telnet_180gap_p50_interior_source_sft.cjs), run from the repository root. The original 2014 table transcription carries existing source-audited token caveats; none affect the count identity. No page ciphertext was decrypted by this experiment.
