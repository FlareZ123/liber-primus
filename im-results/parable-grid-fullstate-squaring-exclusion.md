# Original LP2 numeric grid is not a direct Parable-modulus squaring byte stream

**Classification:** source-motivated, exhaustive finite-model exclusion (Agent 40, 10 November 2026). This rules out a specific way of generating the original printed grid, **not** a ciphertext cipher. No previously unknown LP2 plaintext, key, or destination is recovered.

## Executable historical hypothesis

The authentic 2013 Cicada audio's metadata carries the number **1,595,277,641 = 1,259 × 1,031 × 1,229**, later matched by the three published *Parable* clause-prime sums. The factors 1,259 and 1,031 are primes congruent to 3 modulo 4, so their product **1,298,029** is a valid Blum modulus. This motivates modular squaring as a candidate byte generator. The existing [Parable audio study](audio-761-pad-scan.md) already tests extensive uses of this number as a direct LP2 rune-cipher key; the present, distinct question is whether it **generates the original 32×8 numerical table itself**.

The 256 actual bytes on physical LP2 pages 49–51 are supplied by [base60-grid.json](../resources/liber-primus/base60-grid.json). Its eight physically printed columns each contain **32 bytes**, an independently given separation that could allow a separate PRNG state for each original text group.

For each complete column, permit a **completely unknown** first state $x_0\in[0,M)$ and the recurrence

\[
x_{i+1}=x_i^2\bmod M.
\]

Two source-supported moduli are tested independently, $M=1,298,029$ and $M=1,595,277,641$. Convert each state into its printed byte by either $b_i=x_i\bmod256$ (**low8**) or $b_i=\lfloor256x_i/M\rfloor$ (**rescale8**). Scan each column in both printed directions, allowing a different secret first state and direction for **every one of eight columns**. The model does not require the historical seed to be among any hand-picked small numbers; all seeds and all possible starting phases are covered by enumerating every allowed first emitted state. The later square of an initial hidden seed is a subset of this deliberately more permissive state space.

## Complete original-input calculation

Use the first byte of a target column to restrict candidate states exactly. For low8, possible starts satisfy $x_0\equiv b_0\pmod{256}$; for rescale8, possible starts satisfy $\lceil b_0M/256\rceil\le x_0<\lceil(b_0+1)M/256\rceil$. Advance the squaring recurrence until the first mismatch, recording the longest original-column prefix over **all** candidate states.

| Modulus | Byte projection | Printed direction | Maximum prefix per original column, 0–7 |
| --- | --- | --- | --- |
| 1,298,029 | low8 | Forward | **2, 2, 2, 2, 2, 3, 2, 2** |
| 1,298,029 | low8 | Reverse | **2, 2, 2, 2, 3, 2, 2, 2** |
| 1,298,029 | rescale8 | Forward | **2, 2, 2, 2, 2, 2, 2, 2** |
| 1,298,029 | rescale8 | Reverse | **2, 3, 2, 3, 2, 2, 2, 2** |
| 1,595,277,641 | low8 | Forward | **3, 3, 3, 4, 3, 4, 3, 3** |
| 1,595,277,641 | low8 | Reverse | **3, 3, 4, 3, 3, 4, 3, 4** |
| 1,595,277,641 | rescale8 | Forward | **3, 3, 3, 3, 4, 3, 4, 4** |
| 1,595,277,641 | rescale8 | Reverse | **3, 3, 3, 3, 3, 3, 3, 4** |

**Zero of the 64 column/modulus/projection/direction cases matches even five of its 32 source bytes**, even though every initial state is permitted separately for each case. Consequently zero can match all 32. The largest original agreement is four bytes, so the failure is decisive for this exact model without a language scorer, a search cutoff, or a guessed secret seed. The original table is the actual object under test; no fabricated ciphertext is mixed into this result.

### Full-seed positive controls

Generate 32-byte streams with first state 3301 under each of the four independent modulus/projection choices, then pass them to the **same full-state inversion** without supplying the state. In every case, the complete 32-byte candidate is uniquely reconstructed and the true first state is recovered (**4/4** positive tests, **32/32** each). This confirms the search would detect the declared source-to-grid generator if it produced the observed table.

The executable [all-state original-grid reproducer](../sims/parable_table_modsquare_fullstate.cpp) uses C++17 standard library only, reads the committed byte table without replacing it, checks that exactly 256 source bytes were parsed, exhausts the original 64 configurations, verifies all four hidden-state plants, and prints every column's longest prefix. The original and control runs completed locally in approximately five seconds. It does not add a GitHub Actions workflow.

## Decision and limits

**Exclude** direct full-state modular squaring with either historically printed modulus and either direct eight-bit state extraction as the generator of all eight original grid columns, including the unusually favorable assumption of **eight independent arbitrary secret starting states**. The original signed number supplies an independent reason to test this precise recurrence; no survivor can be rescued by an unsearched initial seed.

This exclusion says nothing about whether the 256 bytes are cryptographic key material from some other source. It does **not** cover ciphertext transformation with a modular-squaring pad, extraction of bits across several states, cryptographic hashes of states, nested/rekeyed generators, other moduli, a different byte transcription, or changing the 32×8 physical traversal. No LP2 cipher or plaintext is inferred, so this supporting result remains in **im-results/** rather than the authoritative solved-text synthesis.
