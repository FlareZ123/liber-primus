# Original p50 numerical bytes: bounded 2014 timestamp-seeded MT19937 gate

## Source observation and decision

The original LP2 physical p50 is a visible numerical 32×8 array, printed across pp49–51. The repository's image-adjudicated canonical two-character base60 transcription is `resources/liber-primus/lp2-grid-256.json`. Its first eight row-major decoded bytes are exactly:

```text
CB E7 A7 BA 61 ED 7E B7
```

The independently archived **2014 manuscript-distribution period** supplies a broad, finite clock window for testing the narrow possibility that an early-2010s PRNG wrote these bytes directly using a Unix-second seed. The May11 planted seed below is only a fixture and must not be mistaken for an authenticated publication instant.

**Prior-work boundary:** This is a small **C++ `std::mt19937` seed-initialization/readout complement** to the earlier and broader [April–May 2014 CPython MT timestamp tests](lp2-p50-2014-python-mt-seed-gate.md) and [keyless original small-state generator exclusions](lp2-p50-keyless-linearstate-prng-source-gate.md). The Python seed initialization is mathematically different from C++ `std::mt19937(seed)`; none of those exclusions select a table decoder. The original source already has extensive weak-PRNG exclusions, so this result is a minor remaining implementation-specific gate, **not a new strategic research direction**. The earlier 2013 participant-server `RAND [n]` command is only a weak hypothesis prompt: the six preserved requests total 21 bytes, and no source shows that this server emitted the p50 table or used MT19937. The exact random generator and byte extraction are unselected by the puzzle.

### Frozen finite operation

For all **3,628,801** inclusive integer Unix-second seeds from **2014-04-20T00:00:00Z** through **2014-06-01T00:00:00Z**, initialize the standardized C++ `std::mt19937` with that 32-bit seed. Test five fixed readouts of successive *full 32-bit generator words* as eight consecutive bytes: low eight bits, high eight bits, bits 1–8, bits 16–23, and bits 23–30. Keep the original table orientation; no output-skip, hidden key, seed-hash, byte sorting, or adjustable offset is admitted. The acceptance gate is **all eight identical original bytes**.

Reproduce with [the source-locked standalone C++17 program](../sims/lp2_p50_2014_mt19937_clockseed_gate.cpp), compiled with a C++17 standard-library compiler and run with no arguments.

## Original output and positive control

```text
prefix>=3: seed=1399571927 mode=1 matching_bytes=3
PLANT: 8/8 positive; ORIGINAL: 3628801 UTC-second seeds x 5 byte modes, 3-byte hits=1, 4-byte hits=0, complete hits=0
```

One chance three-byte high-byte prefix occurs at **2014-05-08T17:58:47Z**; its **fourth byte fails**. Under a rough independent-uniform model, five readouts across 3.6 million seeds generate about one three-byte accidental match, so this candidate is ordinary multiple-testing background. An independent synthetic eight-byte output generated with the same standard MT19937 from source-window seed **1399766400** (2014-05-11T00:00:00Z) exactly recovers the planted seed within a 21-second local search, validating the readout/seed protocol.

**Result:** No exact four-byte prefix, hence no eight-byte table reproduction and no key, unknown LP2 plaintext, or location under this **one explicitly frozen clock-seeded MT19937 direct-byte register**. The source supplies no MT19937 instruction, and alternate PRNGs, nonclock seeds, warm-up/skip conventions, hashed seeds, keyed stream ciphers or other table uses remain open. The finite negative is a guard against repeating this direct, tempting release-time seed guess; it does not solve or substantially explain LP2.

## Research decision

Do not expand this into a random seed or extraction-mode sweep without an **independent first-party selector for the PRNG, seed serialization, output framing and downstream cipher**. The next causal objective remains an original-selected inverse or long intact unknown-page plaintext. This bounded gate belongs in intermediate evidence rather than `results/README.md` because no mechanism was identified.
