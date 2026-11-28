# 2014 `sexagesimal.bin` serialization rationale audit

**Agent 13, 28 November 2026. Status:** bounded timestamp-centered source audit complete. No contemporaneous clue-selected rationale or downstream consumer for the p49–p51 256-byte serialization was recovered.

## Question

Issue #3346 follows the author-period consumer census in `im-results/lp2-p50-author-period-consumer-census.md`. That census established that a live 2014 participant converted the printed p49–p51 table to conventional base60 decimal values and then packed those 256 values into `sexagesimal.bin`. This audit asks a narrower causal question:

**Why were the values serialized as bytes, and what was the resulting binary intended to feed?**

The filename itself is not evidence. A surviving period statement, code path, or adjacent artifact must supply the rationale.

## Exact timestamp-centered commit sequence

All four commits below are by GitHub user `micheloosterhof`.

### 20:41:01Z — transcription and decimal conversion

Commit `19d68fbb9cff1c06d52cc0add30285199c936282`, message **`script`**, adds `49.txt`, `50.txt` and `51.txt`. Each file contains the printed two-character tokens followed by participant-computed decimal values.

The diff itself contains no explanation of the base60 alphabet, why values should become bytes, or a receiving object. It does show active manual correction of a few p50 decimal entries, which is consistent with working transcription rather than a frozen published decoder.

### 21:39:09Z — raw-byte serialization

Commit `a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462`, message **`bytestring`**, adds:

- `decimal.txt`, one decimal value per line;
- `decimaltobyte.pm`, whose effective body is only `print(pack 'C', $_)`;
- the 256-byte `sexagesimal.bin`.

There is no comment, README addition, key/cipher invocation, file-format detector, or consumer edge in the commit. The commit message supplies only the representation goal: “bytestring.”

### 21:56:12Z — page 56 materialized independently as bytes

Seventeen minutes later, commit `06f57643821f1cadf597471c2b9c813bd08d2e37`, message **`page 56`**, adds the visible p56 hexadecimal digest as `56.txt` plus its raw-byte form `56.bin`. Its README records a direct reverse-hexdump command.

This is important context. The same participant was routinely turning visibly byte-shaped page notation into binary files during Stage11. That makes `sexagesimal.bin` compatible with a general solver working convention—materialize candidate byte data so ordinary binary tools can inspect it—without implying that Cicada instructed a specific binary consumer.

This is contextual evidence, not proof of the participant's private intent.

### 22:06:25Z — transcription cleanup, still no consumer

Commit `d72e8e0dfb428b99fe8a0e5431f2c499648fac6e`, message **`separate text and decimals`**, moves the decimal values into `49.dec`, `50.dec`, and `51.dec`. It does not add any operation that reads `sexagesimal.bin`.

Later Stage11 commits in the same repository solve p56 using its known prime-index mechanism; those programs consume p56 rune data, not the 256-byte table.

## Period archive search

A separate preserved 2014 archive, `cijhho123/cicada3301`, mirrors the same Stage11 table, `decimaltobyte.pm`, and generated `sexagesimal.bin`. Repository searches for `sexagesimal`, `base60`, the exact table prefix `3N 3p 2l`, and the serializer locate the assets but no discussion explaining the conversion or naming a next-stage recipient.

The archive contains a contemporaneous-looking Titanpad file titled **“The 256 byte strings aren't magic squares”**. Inspection is decisive for this issue: its matrices are labeled **onion2**, **onion3**, and **onion4** and contain different 16×16 byte blocks from the earlier onion-stage binary work. It is not a discussion of the p49–p51 table and therefore does not explain `sexagesimal.bin`.

The broader preserved community corpus similarly mirrors the binary as an artifact but supplies no period rationale or downstream code path. Modern descriptions of the table as a payload, key, index, or codebook are later interpretations and do not satisfy this issue.

## What the surviving evidence licenses

The evidence supports this narrow historical statement:

> By 11 May 2014, an active solver had interpreted the p49–p51 alphanumeric cells as conventional sexagesimal values in the byte range and serialized those 256 values in printed order as a raw byte string.

It does **not** establish any of the following:

- that Cicada intended a byte array rather than another numerical object;
- that the raw bytes were meant as a cryptographic key, ciphertext, lookup table, image/audio fragment, address, or compressed object;
- that a specific byte order beyond the participant's printed-order serialization was authored;
- that a particular program consumed the file.

The fact that every value falls in 0–255 makes byte packing technically natural, but that is an observer's rationale unless a source says so. The neighboring p56 binary conversion makes “participant convenience / inspection format” the best-supported interpretation of the repository behavior.

## Decision

No contemporaneous clue-selected rationale or downstream target survives in the bounded timestamp-centered sources checked.

Keep `sexagesimal.bin` as **period participant representation evidence**. It upgrades confidence that conventional base60-to-integer interpretation was natural to at least one live solver, but it does not authenticate a binary consumer.

Do not reopen generic AES/RC4/XOR/hash/container/table-walk sweeps from the filename or the existence of a 256-byte file. Reopen only if a dated 2014 statement, paste/log line, or program is recovered that explains why the table was packed and identifies a determinate recipient or operation.
