# Candidate dual-residue word map linking p0, p15/p53, and the p50 graph

**Status:** intermediate hypothesis only. This is a reproducible cross-artifact alignment, not a recovered LP2 plaintext or an established cipher.

## Proposed operation

For a GP29 sequence \(x_0,\ldots,x_{m-1}\), interpret it as a positional base-29 integer

\[
N=\sum_{i=0}^{m-1}x_i\,29^{m-1-i}.
\]

Then calculate the ordered residue pair

\[
(q,r)=(N\bmod23,\;N\bmod29).
\]

Use \(q\) and \(r\) as zero-based indices into the first 29 words of the 2016 signed message. The corresponding p50 pair-address is \(29q+r\).

The choices are source-motivated but not yet authenticated: 29 is the GP alphabet size and the length of the 2016 word register; 23 is the DH prime already present in the LP2 source trail; the 2016 message explicitly frames words as a map and numbers as direction. Do not treat the operation as proven merely because some outputs are meaningful.

## Word register

The first 29 words of **resources/historical/cicada2016-4gq25-outguess.asc**, zero-based:

| Index | Word | Index | Word | Index | Word |
|---:|---|---:|---|---:|---|
| 0 | HELLO | 10 | PRIMUS | 20 | MEANING |
| 1 | THE | 11 | IS | 21 | IS |
| 2 | PATH | 12 | THE | 22 | THE |
| 3 | LIES | 13 | WAY | 23 | ROAD |
| 4 | EMPTY | 14 | ITS | 24 | AND |
| 5 | EPIPHANY | 15 | WORDS | 25 | THEIR |
| 6 | SEEKS | 16 | ARE | 26 | NUMBERS |
| 7 | THE | 17 | THE | 27 | ARE |
| 8 | DEVOTED | 18 | MAP | 28 | THE |
| 9 | LIBER | 19 | THEIR |  |  |

GP29 conversion uses the corpus transliteration and longest-token matching; ordinary-letter spellings are normalized to the manuscript alphabet (K→C, V→U, Q→C, Z→S), with digraph runes such as TH, NG, and EA counted as one symbol.

## p0 marker and receiver results

The strings below are the existing p0 marker serializer's outputs, not new plaintext guesses. The p0 prefix is the raw seven-rune prefix of the independently selected 73–102 span.

| Operand | GP29 length | \(N\bmod23\) | \(N\bmod29\) | Word pair | Pair-address |
|---|---:|---:|---:|---|---:|
| p0 title **EPIPHANY SEEKS** | 13 | 18 | 15 | MAP / WORDS | 537 |
| p0 right-column RISE continuation **EPIPHANY SEEKS THE DEVOTED** | 22 | 6 | 23 | SEEKS / ROAD | 197 |
| p0 offsets 73–79 **[26,8,17,1,6,3,13]** | 7 | 7 | 13 | THE / WAY | 216 |
| p0 horizontal readout **WORDS MAP MEANING NUMBERS** | 20 | 0 | 15 | HELLO / WORDS | 15 |

Additional p0 blocks:
- Raw 23-rune core, offsets 80–102: residues (18,26) → MAP / NUMBERS.
- Full 30-rune span, offsets 73–102: residues (14,26) → ITS / NUMBERS.
- H-transformed 23-rune core: residues (17,0) → THE / HELLO.
- H-transformed 30-rune span: residues (10,15) → PRIMUS / WORDS.

The most specific p0 result is the right-RISE phrase: its residue pair is exactly (6,23), and \(29\cdot6+23=197\), a node on the corrected p50 11-cycle. That node is itself the pair (6,23), labelled SEEKS / ROAD in the 2016 register. The marker-derived phrase therefore self-selects that exact p50 node under the proposed rule.

The title's pair (18,15) is MAP / WORDS, the first two horizontal marker-readout words in reverse order. The horizontal readout itself maps to HELLO / WORDS. These are supporting semantic checks, not independent proof.

## DH and p50 cycle alignment

The source-derived DH state used by the existing p0/p50 work is:

\[
p=23,\quad g=5,\quad a=6,\quad b=15,\quad A=8,\quad B=19,\quad K=2.
\]

The existing derived marker values are \(t=g+K=7\) and \(w=A+g=13\), with \(g^t\bmod p=5^7\bmod23=17\).

The p0 prefix's residue pair is exactly (7,13) = (t,w). The p50 2-cycle has:

- \(158=29\cdot5+13=29g+w\)
- \(249=29\cdot8+17=29A+(g^t\bmod p)\)
- \(T[158]=249\) and \(T[249]=158\).

This 2-cycle is independent of the p50 cell-199 correction issue.

The underlying 256-token stream is a 32×8 table spanning LP2 pages 49–51 (10, 13, and 9 rows respectively), not a standalone page-50 table. The 2- and 11-cycle lengths sum to 13, matching the 13-row page-50 block; however, the cycle nodes are distributed across all three pages and no node-to-row mapping has been established. Treat this as a structural lead only.

The p0 right-RISE phrase selects node \(197=29\cdot6+23=29a+p\), on the corrected 11-cycle. The 11-cycle also contains \(247=29\cdot8+15=29A+b\). Its corrected successor order is:

\[
115\to247\to192\to0\to203\to68\to199\to47\to76\to114\to197\to115.
\]

The p0 right-RISE phrase length is 22 GP29 symbols, equal to \(p-1\), and its four 2016 words occupy indices 5–8:

\[
\text{EPIPHANY}_5,\ \text{SEEKS}_6,\ \text{THE}_7,\ \text{DEVOTED}_8.
\]

Those indices align in order with \((g,a,t,A)=(5,6,7,8)\). This is a plausible human-facing clue for the DH state, although it may still be coincidence.

## Held-out p15/p53 operands

The same fixed operation was applied to the independently selected operands in **im-results/lp2-p15-p53-dh23-179-adic-read-fingerprint.md**:

| Operand | Source selection | Length | \(N\bmod23\) | \(N\bmod29\) | Word pair | \(N\bmod179^2\) |
|---|---|---:|---:|---:|---|---:|
| p15 offsets 23–73 | DH-coordinate-selected window | 51 | 22 | 8 | THE / DEVOTED | 29535 |
| p53 offsets 128–178 | original-ink red span | 51 | 7 | 9 | THE / LIBER | 29535 |

The p15 pair (22,8) is also \((p-1,A)\). The p53 pair shares the p0 prefix's first residue \(7=t\), and its second word is LIBER. The two 51-rune operands already share the reported \(N\bmod179^2=29535\); no parameters were tuned to obtain these word pairs.

The obvious 3×17 split of each 51-rune operand was checked; its six output pairs do not form a clear plaintext. Do not pursue that segmentation without another clue.

## Controls and limitations

1. **The p0 prefix residue pair is not globally unique.** The pair (7,13) occurs in 21 seven-rune windows across LP2 pages 0–55; only one is on p0, at offset 73. Its relevance depends on the independent DIRECTION/THE selection of the p0 73–102 span.
2. **Basin convergence is weak.** The corrected p50 11-cycle basin contains 252 of 256 table cells. The p0 prefix address 216, horizontal address 15, and p53 address 212 enter that basin, but this alone is not discriminating.
3. **Do not wrap out-of-range pair-addresses without a clue.** The title address 537 and p15 address 646 exceed the 256-cell p50 table. Reducing them modulo 256 is an extra assumption, not part of the fixed dual-residue rule.
4. **The p50 graph is conditional.** Its direct-pointer interpretation is not creator-authenticated. Membership in the corrected 11-cycle depends on the cell-199 stream repair; the 2-cycle does not.
5. **The operation is not a general phrase decoder.** As a control, other contiguous 2016-message phrases map to mixed pairs: “HELLO THE PATH LIES EMPTY” → SEEKS / NUMBERS; “LIBER PRIMUS IS THE WAY” → LIBER / NUMBERS; “ITS WORDS ARE THE MAP” → ARE / WAY; “THEIR MEANING IS THE ROAD” → THEIR / ROAD; “AND THEIR NUMBERS ARE THE DIRECTION” → PRIMUS / LIBER. Some outputs are self-referential or semantically suggestive, but the mapping does not consistently return the source phrase.
6. **No plaintext has been recovered from the p0 core or p53 red span by this operation.** Repeating Vigenère/Beaufort uses of the p0 7-rune prefix and p0 13-symbol marker key, plus the obvious 3×17 split, did not yield readable plaintext.

## Interpretation and next decision

A plausible solve-path hypothesis is that the 2016 message's “words/map/road/numbers/direction” instruction asks the solver to turn selected GP29 strings into a dual-modular word-map coordinate. The p0 marker and receiver then select DH state values and p50 graph nodes; the p15/p53 pair provides a held-out semantic/DH alignment.

This remains intermediate evidence. It does not establish that the author intended this exact arithmetic, does not decode the p50 cycles into a unique plaintext, and does not solve any additional LP2 page. The next worthwhile test is a prospectively selected independent source-marked span with a locked prediction of a specific word pair or p50 node before inspecting its result. Avoid further tuned permutations or key searches on the existing 13 cycle-pairs.

## Reproduction references

- **sims/lp2_dual_residue_wordmap_sft.cjs** — deterministic reproduction of the residue table, cycle checks, and prefix-window control.
- **resources/liber-primus/lp2-corpus.json** — canonical GP29 page indices.
- **resources/liber-primus/lp2-grid-256.json** — p50 256-cell table used for the conditional pointer graph.
- **resources/historical/cicada2016-4gq25-outguess.asc** — 2016 word register.
- **im-results/lp2-p0-square-state-rise-key-serializer.md** — p0 title and marker readouts.
- **im-results/lp2-p50-openpgp-dh-2cycle-crosslink.md** — p50 2-cycle / DH comparison.
- **im-results/lp2-p15-p53-dh23-179-adic-read-fingerprint.md** — p15/p53 51-rune operands and 179² fingerprint.
