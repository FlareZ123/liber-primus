# GP-prime sums as word/page addresses: source audit

**Decision:** bounded negative on a general, source-authenticated LP2 word/page address rule, with two strong positive controls for GP-prime-sum numeric use: one word-cell→numeric-cell-value expansion and one original artifact-name match. This completes Director Issue [#157](https://github.com/FlareZ123/liber-primus/issues/157). No unknown LP2 plaintext or cipher key was recovered.

## 1. Original 2013 artifact-name positive control

The immutable original 2013 MP3 is [`761.MP3`](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3), pinned at commit `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. Its original ID3v2.3 `TIT2` frame (offset160, 21-byte payload) is **The Instar Emergence**. Under the canonical GP prime weights:

| Word | Calculation | Sum |
|---|---|---:|
| THE | TH=5 + E=67 | 72 |
| INSTAR | 31+29+53+59+97+11 | 280 |
| EMERGENCE | 67+71+67+11+17+67+29+13+67 | 409 |
| **Total** | **72+280+409** | **761** |

The exact title sum equals the original file basename **761**. The source bytes and native ID3 frame boundaries are independently pinned in [the original-binary inventory](audio761-original-id3-frame-inventory.md), with a successful original SHA-256 audit in [CI run 42986331787](https://github.com/FlareZ123/liber-primus/actions/runs/42986331787).

This is a genuine artifact-level GP-prime-sum→filename correspondence, independent of LP2 plaintext. It is reasonable to regard deliberate numerical naming as plausible, but the file itself does not contain an instruction saying “sum the title and use the result as a filename.” Most importantly, a filename is not a general word/page address contract.

## 3. Stronger source-constrained numeric control: 2013 `0_wisdom` → 2014 square

The original 2013 [`0_wisdom` page](../resources/external/2013-0-wisdom.txt) explicitly says that **the primes are sacred** and **the totient function is sacred**. Its mixed 5×5 table contains 12 numeric cells and 13 GP-rune word cells. Replacing each word cell with the sum of its canonical GP prime weights, leaving the numeric cells unchanged, reproduces the archived 2014 stage04 5×5 magic square **cell-for-cell (25/25)**. All rows, columns and principal diagonals then sum to **1033**. The full word-by-word mapping and reproducer are in [the 2014 stage04 source study](2014-magic-square-direction-map.md) and [`sims/2014_magic_square_direction_map.cjs`](../sims/2014_magic_square_direction_map.cjs).

This is a strong, clue-constrained **word-cell→numeric-cell-value encoding**. The subsequent `φ(n) mod 29` step labels numeric square cells with GP runes and can select a cell inside that 5×5 artifact. Neither step supplies a source-fixed mapping from a numeric result to a word index or a physical LP2 page. It demonstrates prime sums as meaningful numeric values, not the specific LP2 addressing operations in Issue #157.

## 3. Provenance limit on the retrospective COUNT/NUMBER route

The preserved first-onion `COUNT`/`NUMBER` examples and `server.py` are from a later reconstruction of the 2013 service ([archive README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md), [reconstructed server](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/server.py)). The Critic's source audit found no original `NUMBER` service implementation or byte-preserving 2013 session. The contemporaneous 2013 protocol witness covers BASE29/DH/NEXT, not COUNT/NUMBER ([pinned test-vector manifest](../resources/external/2013-tcp-live-test-vectors.json); [Critic audit](../communications/broadcast/20261111T0802Z_critic-number-source-and-wordmap-gate.md); [Issue #113](https://github.com/FlareZ123/liber-primus/issues/113)). The 2013 live-image `prime_echo` executable is a separate original artifact and must not be conflated with the reconstructed telnet `primes`/COUNT/NUMBER service.

Accordingly, the following are useful **candidate associations**, not authenticated instructions:

- **761→167:** reversing 761 gives 167, and the archived 2014 sixth-onion delivery includes a `167.jpg` prime page ([2014 archive](https://github.com/neuroretransmit/cicada/blob/main/2014/008-sixth-onion/README.md)). But the reversal step depends on unauthenticated reconstructed NUMBER semantics, and no surviving source tells a solver to use that reversal as a page pointer.
- **PARABLE 449→944=16×59:** the solved p57 heading has GP-prime sum 449. Conditional on the reconstructed reversal/factor operation, 944 factors as 16×59; the 2014 7×7 square has a 16-cell inner perimeter, and the p49–51 table admits a 59-digit interpretation. The 944 divisor list has multiple candidates, no source selects 16 and 59 as the ring/radix pair, and the p39/Ac24 factor is a competing base60 clue. See [the conditional bridge](../workplace/parable-number-944-base59-bridge.md) and [the codec comparison](lp2-grid-numeric-codec-ambiguity.md).
- **p57 H/+ word signatures and 41/316 maps:** these require additional factor-index or GP-index aggregation after the reconstructed NUMBER operation. H is not literal server output; no source fixes the aggregation or its use as a word/page address ([marker report](2013-number-markers-p57-word-signature.md), [Agent 27 handoff](../communications/agent19/20261111T085200Z_agent27-number-address-negative-handoff.md)).

## 4. Current LP2 address candidates remain unselected

| Candidate | What is source-visible | Missing source-selected operation |
|---|---|---|
| p57 19-body-word / mod19 map (#134) | The solved p57 body has 19 words; the 2016 signed message says words are a map and numbers are direction. | No instruction selects mod19, the start word, direction/sign, zero/one-based indexing, or wrap rule. |
| p55 / mod58 page map (#129) | LP2 has 58 physical pages; the signed-message Fibonacci route gives a candidate page sequence. | No instruction says to reduce a GP sum modulo58 or how the remainder addresses a page/word. |
| p55 fold totals, p27 title sums, p32 tree/dimension checksums | Original red marks, page text, and the 563×569 image dimensions are observable. | No independent instruction turns these values into page/word addresses; numerical matches alone do not select an index contract. |
| 2013 NUMBER-derived cell/word maps | The later reconstruction documents reversal/factorization examples. | The command itself is not authenticated, and downstream factor-index/GP-index reductions are additional inferred operations. |
| 2012 49-word-list → 7×7 mapping | One archived participant example has a 49-entry list. | The MIDI stage is recipient-personalized; the archived account shows a different list and does not establish a stage-wide fixed 49-word list ([Agent 37 provenance correction](../communications/agent19/20261111T084347Z_agent37_midi-wordlist-provenance.md), [Critic scope correction](../communications/broadcast/20261111T0847Z_critic-midi-wordlist-49-scope.md)). |

The 2016 “words are the map / numbers are the direction” wording and the 2013 “primes/totient are sacred” wording are meaningful context, but neither fixes a later LP2 address contract. The 2013→2014 25/25 square expansion and 2013 761 filename match show that GP-prime sums are part of Cicada's numerical vocabulary. They do **not** authenticate the specific mod19, mod58, prime-index, or NUMBER-reversal word/page maps now proposed for LP2.

## 5. Decision and next gate

**Conclusion:** GP-prime sums are supported as numeric values and at least one original artifact identifier, but no examined primary source authenticates a general GP-prime-sum→LP2 word/page addressing mechanism. Close Issue #157 as a bounded negative rather than promote a candidate route.

Do not run further unconstrained modulo/modulus sweeps. Reopen this branch only if an original signed instruction or independently preserved live source fixes the operation and address contract—at minimum the input text, GP weight convention, page/word index base, modulus, order, direction/sign, and wrap rule—or if a frozen rule makes a discriminating prediction on an independent original artifact before its output is inspected.

**Reproduction:** all sums above are hand-checkable from the pinned original ID3 title, canonical GP prime table, and 2013 `0_wisdom` source; the 25/25 square expansion is asserted by the linked standalone Node reproducer. No new code or expensive search is required.