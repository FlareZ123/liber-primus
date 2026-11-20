# p50-derived totient and 2016 word-pair key-consumer gates

**Agent 2, 20 November 2026. Classification: bounded intermediate negatives.** No unknown LP2 plaintext, authentic key, cipher architecture, hash preimage, or continuation recovered. The exact tests are reproducible with **sims/lp2_p50_derived_key_consumer_sft.cjs**.

## Research question

The existing synthesis had rejected the literal row-major 256-token stream, fixed 256-phase substitution, direct H×G quotient consumers, and raw-table RC4 consumer, while leaving room for a first-party nonperiodic rule. Two narrower source-motivated consumers had not been tested:

1. The LP1 p05 passage explicitly says the primes and totient function are sacred and that things should be encrypted. Could Euler's totient applied to the LP2 p49–p51 numerical table provide a one-use GP29 key for the two complete sentences flanking that table?
2. The p50 functional-graph candidate maps its source-oriented 13 cycle nodes to pairs of words in the first 29 words of the signed 2016 message. Could the difference or sum of those words' GP0 values provide the 13-symbol key suggested by the p0 13-dot marker?

Both are deliberately narrow tests. The source does not explicitly select either transfer, so a negative result retires only the stated consumers.

## Gate A — Euler totient of the 256-cell table

### Frozen hypothesis

- Input: the 256 values in **resources/liber-primus/lp2-grid-256.json**, in printed row-major order across p49–p51.
- Numeric interpretation: the file's conventional base-60 byte rule, 60*d1+d2. The grid metadata explicitly marks this byte interpretation as a hypothesis, not an authenticated legend; only a subset of table glyphs has separate original-image adjudication.
- Key derivation: K[i] = φ(byte[i]) mod 29.
- Receiver: either complete table-flanking sentence, with the key restarted at cell 0:
  - pre-table: final 72 runes of p48 + all 66 runes of p49 = 138;
  - post-table: all 92 runes of p51 + first 78 runes of p52 = 170.
- Test both arithmetic signs, both direct one-use GP29 addition/subtraction and the only established special handling from LP2 p56: plaintext F is transparent and does not consume key state. No phase search, reordering, repetition, or fitted exception.
- There are two zero-valued table cells, at indices 192 and 229. Strictly omitting them gives a 254-symbol key; extending φ(0)=0 gives 256. Both produce identical tested prefixes because neither zero occurs in the first 170 table positions.

### Original-cipher results

| Receiver | Inverse | Direct IoC | F-transparent full paths | Best F-transparent IoC |
|---|---|---:|---:|---:|
| p48–49 pre-table | C−K | 0.03565006 | 4 | 0.03850629 |
| p48–49 pre-table | C+K | 0.03300540 | 0 | — |
| p51–52 post-table | C−K | 0.03383223 | 0 | — |
| p51–52 post-table | C+K | 0.03564219 | 0 | — |

The sole surviving F-transparent candidate is the pre-table C−K branch. Its best complete output is:

YIAOHREOSWSAJASIAEANGULLSTIMEOMSNGPIAEAIABFAEEOFMFTEAANGWSOREANGGNGSLINGCEAJAECSEOWAEASIAIANGXRXCPWRFIATHACOTHPLWTNBYTCLICXAENGAWNGEOXTTHPFEAJLOEEONTHHSXBBCAEJASRMCMLNITNRAEOIAIEO

It is not coherent GP29 prose. The best IoC is far below the clear p57 PARABLE control (0.06270997); the direct outputs also remain near the uniform GP29 baseline. The post-table sentence has no full-length legal inverse under either sign.

**Positive control:** for every tested sign, the exact same F-transparent encoder/decoder was exercised on a synthetic p57 PARABLE ciphertext. It recovered all 95 planted original symbols. This validates the implementation, not the historical hypothesis.

**Decision:** reject the specific one-use φ(base60(table byte)) mod 29 key on the two complete table-flanking sentences, under both signs and both direct/F-transparent consumption rules. This does not exclude other source-selected transforms or other table receivers.

## Gate B — 2016 word-pair GP0 difference/sum as a p0 key

### Frozen hypothesis

The source-oriented 13-node order from the current p50 functional-graph report is:

[158,249,115,247,192,0,203,68,199,47,76,114,197].

Each node is decomposed as n=29q+r; q and r select two words from the first 29 words of **resources/historical/cicada2016-4gq25-outguess.asc**. The GP0 value of a word is the sum of its rune indices under the repository's longest-match GP29 transliteration. Interpret the pair's direction as either:

- K[i] = (GP0(word[q]) − GP0(word[r])) mod 29, or
- the rival K[i] = (GP0(word[q]) + GP0(word[r])) mod 29.

Use the resulting 13-symbol key periodically, phase 0, on the 249-rune p0 body after the 13-rune title/marker boundary. Test both signs, direct inversion, and the p56-style plaintext-F-transparent rule. No offset, permutation, or alternative graph traversal is fitted.

The resulting keys are:

- word-pair difference: [6,24,14,21,15,0,9,6,8,22,12,17,17]
- word-pair sum: [4,6,25,9,11,22,2,14,18,18,8,22,9]

Neither equals the previously reported conditional p0 residual for the candidate title EPIPHANY SEEKS, [26,24,8,19,27,24,18,3,0,8,0,16,19].

### Original-cipher results

| Candidate 13-key | Inverse | Direct IoC | F-transparent full paths |
|---|---|---:|---:|
| word-pair difference | C−K | 0.03342402 | 0 |
| word-pair difference | C+K | 0.03449281 | 0 |
| word-pair sum | C−K | 0.03449281 | 0 |
| word-pair sum | C+K | 0.03374789 | 0 |

The p0 body has 13 ciphertext F symbols. None of the four exact F-transparent inverses admits a full-length path. Direct outputs remain ciphertext-like and do not approach the clear p57 IoC control (0.06270997).

**Positive control:** each candidate key/sign was used to synthetically encrypt p57 under the same periodic F-transparent rule; the inverse recovered all 95 planted symbols.

**Decision:** reject these exact GP0 word-pair difference/sum keys as p0-body consumers. This does not reject the p50 graph's structural observations or every possible use of the 2016 word pairs.

## Gate C — direct base-29 coordinate streams as a p0 key

A still simpler consumer uses the source-oriented graph decomposition n=29q+r directly, without converting the selected 2016 words to GP0 values. Use either the 13 quotients q or the 13 remainders r as a periodic phase-zero GP29 key on the same 249-rune p0 body. Test both signs, direct inversion, and the p56-style plaintext-F-transparent rule. This is the natural two-coordinate alternative to Gate B; no offset or reordering is introduced.

The two candidate keys are:

- quotient q: [5,8,3,8,6,0,7,2,6,1,2,3,6]
- remainder r: [13,17,28,15,18,0,0,10,25,18,18,27,23]

| Candidate 13-key | Inverse | Direct IoC | F-transparent full paths |
|---|---|---:|---:|
| quotient q | C−K | 0.03358596 | 0 |
| quotient q | C+K | 0.03416893 | 0 |
| remainder r | C−K | 0.03280865 | 0 |
| remainder r | C+K | 0.03520534 | 0 |

All four exact F-transparent inverses are empty. The direct outputs remain ciphertext-like. For each key/sign, a synthetic p57 PARABLE ciphertext under the same periodic F-transparent rule recovers all 95 planted symbols.

**Decision:** reject q and r themselves as phase-zero 13-periodic p0-body keys under the tested direct and F-transparent rules. This does not reject the graph's navigation interpretation or every possible downstream use of its coordinates.

## Overall conclusion and next decision

Both experiments close specific, motivated consumers without producing plaintext:

- φ(table byte) mod 29 does not decode either complete sentence adjacent to the table.
- The 2016 graph-selected word-pair GP0 difference/sum does not decode the p0 body.
- The graph's direct quotient/remainder streams do not decode the p0 body as 13-periodic keys.

The strongest objections remain upstream: the table's base-60 byte interpretation and the functional-graph interpretation are hypotheses; neither source explicitly commands the totient transfer, the word-pair subtraction/sum, or the selected cipher-consumer rule. These are not grounds for broadening into arbitrary offsets, permutations, phases, or further arithmetic fits.

The next useful decision remains the one in the authoritative synthesis: find a first-party instruction selecting a nonperiodic state update, extraction coordinate, or historically supplied key before scoring more unknown ciphertext.
