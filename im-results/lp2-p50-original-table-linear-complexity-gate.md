# Exact binary and byte-level linear complexity of the original LP2 p50 table

**Agent11, 22 November 2026. Evidence class: exact restricted PRNG-generator exclusion, no unknown plaintext.**

## Original source and motivated direct test

The original 2014 Liber Primus numerical page p50, printed across physical scans49–51, represents **256 original 8-bit values** in a 32×8 rectangular table when decoded with its documented first-party base60 alphabet. A plausible, low-complexity human challenge design would reveal a **consecutive prefix of a short-state linear feedback shift-register generator** as a table, allowing a solver to reconstruct the linear recurrence and extend its keystream beyond the printed 256 bytes. A recovered short LFSR could serve as a creator-selected source for subsequent unknown ciphertext. The table contains no explicit LFSR instruction, so the experiment is hypothesis discovery with an exact strong condition, not a claimed intended operation.

This experiment asks an **answer-changing mathematical question**: is the complete table a literal consecutive output of any *short* linear recurrence, with byte or bit order prescribed by natural original table geometry?

Original resource: `resources/liber-primus/lp2-grid-256.json`, SHA-256 `2a77dc623df45ddd126d10d2fffbafead4efd161d2acc07644809deac00a2089`. All 256 original two-character base60 tokens are independently re-decoded byte-for-byte before testing. Three physical byte readouts are frozen: direct printed row-major, printed column-major, and alternating serpentine rows. In the bit register, each uses either most-significant-bit first or least-significant-bit first, yielding **six exact 2,048-bit** sources. In the byte register, each physical readout is tested forward and backward as a **256-symbol GF(256) stream**, giving six source readings. No arbitrary shift, feedback parameter or postselected output transform is introduced.

## Exact minimal-degree results

The [source-pinned Windows CommonJS reproducer](../sims/lp2_p50_rawbit_gf2_linear_complexity_sft.cjs) implements the **Berlekamp–Massey** recurrence algorithm twice: over GF(2) on 2,048 original physical bits and over GF(256), with multiplication modulo `x^8+x^4+x^3+x+1`, on 256 original source bytes. The result for each stream is its exact minimum possible **linear feedback state degree** among *all* generating homogeneous linear recurrences over the specified field; there is no guessed polynomial or score cutoff.

| Original byte geometry | GF(2) degree, MSB/LSB | GF(256) degree, forward/reversed |
| --- | --- | --- |
| Printed 32×8 row-major | **1024 / 1024** | **128 / 128** |
| Printed 32×8 column-major | **1022 / 1025** | **128 / 128** |
| Serpentine printed rows | **1024 / 1024** | **128 / 128** |

The raw bit stream contains **1,017 one bits** of 2,048. Exact Berlekamp–Massey returned full/random-like degree on all 12 physical readouts. A genuine short-register generator, for example a 7-byte or 7-bit recurrence, would yield a degree of at most seven regardless of its unknown coefficients. Thus a direct **≤127-byte GF(256) LFSR** in any tested original order is mathematically impossible; direct **≤1,021-bit GF(2) LFSRs** are also mathematically impossible in every tested bit ordering. All 12 readings have the high complexity expected of unconstrained random-looking data. This observation does not *prove* cryptographic randomness or the table's actual purpose.

The reproducer includes two planted GF(2) recurrence positives, one with exactly seven bits of minimal feedback and a 127-bit nominal planted generator whose **actual minimal** degree is 124, and a planted seven-byte GF(256) feedback stream whose actual minimal degree is exactly seven. It recovers those short-dependency controls before evaluating source data.

**Windows Node22 PASS, full source test:** [run45002863706](https://github.com/FlareZ123/liber-primus/actions/runs/45002863706).

## Cryptanalytic decision

Retire the idea that the 256 printed table bytes directly expose a **short linear recurrent keystream prefix** in any of the six first-party byte/bit orders. The required state would be essentially half the observed sample, which provides no economical, uniquely recoverable **short** recurrence and predicts no usable GP29 text after extension.

This does not rule out nonlinear generators, compressed/encrypted keys, a different source-selected symbol mapping, unknown byte shuffles, a high-degree recurrence, or a table serving as ciphertext rather than keystream. No unknown LP2 plaintext, key or destination follows. Future attempts need an authored clue selecting a generator family or table operand before spending resources on new PRNG searches.
