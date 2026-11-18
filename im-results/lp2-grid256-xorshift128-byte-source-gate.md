# Original LP2 p49–51 grid versus Marsaglia xorshift128: an exact state-recovery gate

**Status (18 November 2026):** The canonical 256-cell original numerical table, **conditionally interpreted as base60 bytes**, cannot be a consecutive single-byte-lane output of Marsaglia's four-word xorshift128 under any of the sixteen frozen original-print reading modes below. All 128 independent 32-byte block cases are inconsistent even when each block receives its own wholly unknown 128-bit initial generator state. This is an exact finite **negative** for that byte-output generator and convention. No original LP2 plaintext, authenticated key, or decoding rule is recovered.

## Why try this route

The 32×8 table printed across physical LP2 p49–51 has exactly 256 two-character tokens. Under the previously published conventional base60 character mapping it produces a plausible 256-byte register, which might hold reproducible generator output or key material. A 2014-era human could implement a familiar xorshift generator cheaply, then publish one byte of successive outputs as a table. If all 256 bytes belonged to a fixed generator, a short prefix would reveal the internal state through binary linear algebra and the expanded stream could supply a testable ciphertext key.

The **creator does not independently select** Marsaglia xorshift128, base60, byte lane, row/column orientation, or the use of the expanded stream as a cipher key. This is a bounded hypothesis motivated by a typed 256-byte object and a historically available simple PRNG, not a claimed historical instruction.

## Fully specified inverse model

Use the four unsigned 32-bit words `(x,y,z,w)`; at each output step set

```text
t = x XOR (x << 11)
(x,y,z,w) = (y,z,w,w XOR (w >> 19) XOR t XOR (t >> 8))
output = w
```

All shifts, XORs and updates are modulo 32-bit words, with logical right shifts. Interpret each base60 source token as one byte in `0..255`. Each emitted byte is one fixed 8-bit lane of consecutive updated `w` outputs, at shifts `0,8,16,24`.

Exactly four printed source orders are frozen: all rows left-to-right/top-to-bottom; reversed row-major tape; all columns top-to-bottom/left-to-right; reversed column-major tape. With four lanes, that is 16 fixed models.

Each output bit is a linear function of the generator's 128 unknown initial-state bits. Build its exact GF(2) equation by evolving each of the 128 one-hot state basis vectors. Solve each consecutive **32-byte** original slice independently with Gaussian elimination; there are 8 slices per order/lane, hence 128 original all-secret state-consistency decisions. The per-block reset weakens the tested assumption in the source model's favor: it grants eight separate independently secret generator states rather than imposing one unbroken 256-byte clock.

## Original data, authentic limits, and positive controls

Input: [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json) with `bytes[256]` and printed page-row split `10+13+9`. The table's 256 tokens and eleven separately image-adjudicated disputed positions are documented there. **Base60 is an interpretation; source evidence also leaves a radix59 convention open.** A different codec producing different integers is outside this gate.

The script generates 256 consecutive xorshift128 outputs from fixed planted initial words `0x12345678,0x9abcdef0,0x0fedcba9,0x87654321`. For all four byte lanes, every independently cut planted 32-byte block satisfies every equation. For the first low-byte block, the linear system reaches full rank128 and recovers the precise four planted state words by back-substitution. This validates the inverse on a nonzero full-state positive, not only its rejection path.

## Exact original-input result

| Printed traversal | Byte lanes tested | Per-mode incompatible 32-byte blocks |
| --- | --- | --- |
| Row-major | 0, 8, 16, 24 | 8/8 in each lane |
| Reversed row-major | 0, 8, 16, 24 | 8/8 in each lane |
| Column-major | 0, 8, 16, 24 | 8/8 in each lane |
| Reversed column-major | 0, 8, 16, 24 | 8/8 in each lane |

**Sixteen of sixteen frozen original-table models fail; all 128 block-system tests reject.** Each block is inconsistent no later than its eighteenth byte. Because the eight source blocks are disjoint, each fixed model would require **at least eight changed original byte values** before it could be made compatible with independently initialized source states. No key-search ranking, statistical significance estimate, English text scoring, or synthetic cipher fit is involved.

## Research decision

Retire the direct **xorshift128 successive-output/one-byte-lane** explanation for the canonical base60 table. Neither state recovery nor any candidate expanded key stream can follow from this literal generator. This gate says nothing about xorshift32, other PRNGs, nonlinear whitening, skip/subsample clocks, mixed byte lanes, alternate numeric alphabets, other source-selected row navigation, or an encrypted table whose output is not direct generator bytes. Such models need their own source selector rather than automatic follow-up parameter searches.

**Reproducibility:** [one-file CommonJS SFT](../sims/lp2_grid256_xorshift128_byte_state_sft.cjs), run with Node 22 against the repository root. [Windows Node22 manual CI PASS, run 44259617897](https://github.com/FlareZ123/liber-primus/actions/runs/44259617897), with all sixteen original models and planted positives printed in job logs.
