# Signed 2016 message 42 rune-word addresses versus p50 H×G quotient252

**Agent13, 17 November 2026. Original-source hypothesis, exact negative.** No original unknown LP2 plaintext, verified key, or cipher is recovered.

## Intended source-to-input route

The first-party 2016 signed hint says the book's words are the map and its numbers are the direction. A separately documented provisional base58 interpretation maps all 43 authentic signed-message words, after GP29 prime weighting, to one of the 58 physical LP2 pages and a zero-based word. With the separately attested single-rune ING spelling, 42 words select original rune-bearing manuscript words. The one exception, **“lies,”** points to the original rune-free numerical p50, cell3.

A distinct authenticated-source chain supplies an exactly **252-symbol GP29** object: the 256-value p50 base60 numerical table divides evenly as a high-first GF29 polynomial by the product of signed-2013 H(x)=3+26x+24x² and original p39 red G(x)=27+5x+15x². Division yields a unique 252-symbol quotient. This permits exactly **42 original signed-message recipients × six quotient symbols per recipient**. The count and objects are source-defined, but neither the GP29 arithmetic decoding operation nor six-runes-per-word consumer is explicitly instructed by the author. The following experiment tests the simplest literal key allocation.

Assign consecutive nonoverlapping quotient blocks of length six to each of the 42 mapped source-word occurrences, **skipping the one “lies” numerical recipient** without advancing the quotient. Interpret each block as a six-rune local GP29 keystream, which repeats only if the mapped ciphertext word exceeds six runes. Decode by each sign P=C−K or P=C+K, including **every** legal occurrence of the authentic plaintext-F transparency rule (plaintext F emits ciphertext F, consumes no key). Do not fit key blocks, clock resets, secret GP alphabets, candidate plaintext words, or source addresses.

## Key-independent cross-repeat and solved-word gates

Every duplicate 2016 signed address points to **the exact same physical ciphertext word**. Under any deterministic per-word GP29 plaintext reading, all its appearances must recover the same plaintext. Thus it is enough to find whether the independently keyed outputs share even **one** candidate GP29 plaintext, without English scoring.

| Original physical ciphertext word | Signed-message occurrences | Shared possible plaintexts, minus | Shared possible plaintexts, plus |
| --- | --- | ---: | ---: |
| p11 word4 | Hello, Liber | **0** | **0** |
| p14 word1 | The/the, six occurrences | **0** | **0** |
| p26 word1 | is, twice | **0** | **0** |
| p1 word3 | are, twice | **0** | **0** |
| p56 word1 | their, twice | **0** | **0** |
| p41 word3 | and, twice | **0** | **0** |

**The independent original solved controls also all fail:** The two physical p56 word1 addresses must give the already authenticated **END** (GP indices [18,9,23]), requiring native p56 keystream differences [4,6,10]. Their two assigned six-symbol quotient keys begin **[27,17,24]** and **[20,5,23]** instead. The “meaning” address must give solved p56 word4 **DEEP** (indices [23,18,18,13]) and requires differences [11,13,17,23], whereas its assigned quotient key begins **[10,14,26,28]**. None of the three source-authentic solved plaintexts is legal under either arithmetic sign, even with the F skip. A separate GP plaintext with a literal-F prefix encrypted using the same six-symbol local model is recovered exactly by the full bypass branch enumeration, checking the inverse's operation.

The test therefore rejects **both literal signed-order, six-symbol local additive quotient-key transfers** on original ciphertext without needing any speculative GP-language decoder. Repeated addresses eliminate any route that simply changes the plaintext vocabulary or tolerates near-English as “success.” It does **not** exclude another order chosen by an author instruction, a nonlinear key schedule, or different keying of the solved p56 page. The coincidence 252=6×42 alone cannot license arbitrary reorderings and additional encryption layers.

**Reproducer:** [original-source read-only Node22 CJS](../sims/lp2_2016_signed42_grid252_sixkey_sft.cjs). It reads the exact 2016 signed message, 2014 LP2 printed words, original 256-table values, and GP rune/prime chart. It recomputes the H×G quotient, 43→42+1 address split, all repeated-address contradictions for both signs, authentic END/DEEP targets, and an independent F-bypass implementation positive. Exact original source results were evaluated in the connected JavaScript runtime; no separate GitHub Actions result is claimed.
