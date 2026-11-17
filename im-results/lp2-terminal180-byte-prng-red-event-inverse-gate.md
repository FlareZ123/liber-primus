# LP2 terminal 256-cell table: known-180 original byte-stream inversion gates

**Agent 40, 17 November 2026. Supporting cryptanalytic exclusions. The 56 unknown pages remain undeciphered.**

## Original-source hypothesis

The original physical pp49–51 contain a 32×8 numerical rectangle, 256 two-character cells. Its top-left clockwise outer perimeter consists of **76 cells**, equal to the 76 unknown GP29 runes of p55; the **interior consists of 180 cells**, equal to the 85 authenticated prime-totient-deciphered p56 runes plus 95 clear GP29 p57 runes. A motivated human might try the 180 known terminal symbols as a key-recovery receiver to unlock the 76-cell perimeter. This numerical relation is an independent source-visible *hypothesis*: no original command authenticates the table-to-terminal association, byte radix, key clock or cipher.

Immutable original-derived inputs: resources/liber-primus/lp2-grid-256.json; lp2-corpus.json; lp2-ink-annotations.json. Original images are 66.jpg–68.jpg (numerical table) and 72.jpg–74.jpg (p55–57). The solved p56 is reversed by the authentic prime-totient stream and plaintext-F transparent bypass (at index 56), consuming 84 key advances. The complete asserted solved plaintext is ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE.

The frozen original receiver matrix has **four** interior-cell readings (row-major, column-major, clockwise inner spiral, reversed inner spiral), **two** p56 registers (known plaintext or original ciphertext, each followed by clear p57), and **three** byte operators (XOR, subtraction modulo256, addition modulo256). These 4×2×3 = **24** source-readable registrations each imply a 180-byte key. The p55 76-rune candidate is completely held out. Real plaintext recovery would still require independent source key selection, a coherent 76-rune output and exact original-cipher forward reconstruction.

## Gate A: recover a complete short-state key schedule from known180

For each of the 24 derived original key streams, test all 256 multipliers of affine Z/256Z recurrence (deducing b from first two bytes), all 256 multipliers of affine GF256 recurrence (AES reduction polynomial 0x11b), fixed two-term additive/XOR recurrence, and 32-bit binary LFSR feasibility (Berlekamp–Massey on 1,440 serialized bits).

| Original 180-key-byte test | Best original observation | Exact success condition |
| --- | ---: | ---: |
| Affine byte recurrence modulo256 | **7/179** transitions | 179/179 |
| Affine byte GF256 recurrence | **6/179** transitions | 179/179 |
| Fixed previous-two byte sum | **2/178** transitions | 178/178 |
| Fixed previous-two XOR | **3/178** transitions | 178/178 |
| MSB-first binary linear complexity | **719–722** (of 1,440 bits) | ≤32 for 32-bit LFSR |

A *complete original-shaped synthetic positive* plants the authentic known180 and 76 withheld GP29 target runes into a 256-byte table under a secret affine 8-bit LCG. The inverse uses only known180, recovers LCG parameters a=109,b=89 with **179/179** matched transitions, reverses the state and decodes all **76/76 hidden target runes**. The separate GF256 affine plant achieves **179/179** and the 32-bit serial LFSR plant has linear complexity ≤32. The authentic solved p56 positive is checked at all 85 positions.

**Scope:** these fixed simple byte-stream families fail the 24 explicit original terminal registrations. Nonlinear, alternate-state, alternate-input, different-radix, changed alignment or different textual receiver hypotheses remain open. A model's synthetic invertibility alone is no evidence of authentic cipher use.

Reproducer: [source-native CommonJS single-file original and plant test](../sims/lp2_terminal180_prng_original_gate_sft.cjs).

## Gate B: arbitrary source red-event type→byte key, even secretly permuted

A separate first-party count supplies **225 original red GP29 rune events plus 31 original thirteen-dot symbols = 256 events**. This candidate A-class tape contains **29 possible red rune types and one 13-dot stencil type**, hence at most **30 distinct symbol classes** across 256 original events. Allowing color-separated or alternative ten/twenty-three-dot types still yields at most **32** classes in the relevant 256-event selections. The source image census establishes event counts; no original instruction selects this A-class tape as the numerical table's key.

Permit an arbitrary hidden lookup mapping each symbol class to *any* byte 0..255 and an **arbitrary permutation of the entire event tape**. A necessary mathematical invariant is that its output stream still has **no more than 30 (or at most 32)** distinct byte values.

The original table and authentic known180 GP indices require **119–138 distinct key-byte values** across the same 24 registered XOR/add/subtract receivers. Every one exceeds the **maximum 32**. Therefore *every possible secret static codebook and every event reordering* fails as a direct bytewise terminal-table key, without needing to guess a single secret map entry.

**Source-shaped blind plant:** assign an arbitrary secret 30-type byte codebook to the actual 256 red-rune/13-dot source event identities. Construct a synthetic table from 76 hidden GP29 target runes followed by the real 180 known terminal runes. Every type occurs in the 180 revealed positions. The inverse learns all 30 secret byte assignments from known180 and recovers **76/76** hidden target runes exactly. Thus the same procedure works on data actually generated by the hypothesis.

**Scope:** excludes the *direct 24-register bytewise table/terminal consumer with a fixed event-type→byte lookup*, even with any event permutation, not a value-changing event-driven key generator or table-as-address map. It extends the earlier single frozen red-event GP-prime/XOR test to an entire all-secret codebook family.

Reproducer: [all-secret symbol-codebook source and plant SFT](../sims/lp2_terminal180_red256_codebook_gate_sft.cjs).

## The next decision

The 256 perimeter/interior geometry remains suggestive but underdetermined. The missing ingredient is an independently readable original opcode, key-expansion mechanism, source-authenticated 180-rune alignment, or a coherent original p55 inverse with exact forward reconstruction. Do not add arbitrary generator families merely to reproduce numerical equality; continue source-led search or pursue structurally independent original-cipher routes.

**Run:** [Manual Windows Node22 workflow](../.github/workflows/agent40-terminal180-prng-manual.yml) executes both single-file original-source and planted-positive tests; the first queued job [44042015127](https://github.com/FlareZ123/liber-primus/actions/runs/44042015127) was dispatched before adding the second SFT. Check actual CI status rather than inferring completion from dispatch.