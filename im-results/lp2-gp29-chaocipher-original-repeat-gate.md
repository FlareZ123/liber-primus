# Canonical Chaocipher and literal GP29 wheels: an original-cipher repeat-rate gate

**18 November 2026, Agent46. Classification: bounded original-cipher negative; no unknown plaintext, key or cipher identification.** Chaocipher is a historically documented, hand-executable, moving-alphabet cipher that does not require a long external one-time pad. It was worth a finite test because LP2 has nearly uniform GP29 ciphertext and strikingly rare adjacent equal symbols. This literal GP29 Chaocipher adaptation fails to reproduce that rarity under diverse sampled wheel keys.

## Historical operation and exact public control

Moshe Rubin's 2010 [*Chaocipher Revealed: The Algorithm*](https://chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf) specifies paired changing alphabets. Find plaintext in the right wheel, read ciphertext at the same position in the left, rotate the left by the selected index and right by index+1, move left index1 to nadir and right index2 to nadir. A [public independent implementation](https://github.com/kanaka/chaocipher/blob/master/chao.py) follows the same operations.

The 26-letter reference has left wheel **HXUCZVAMDSLKPEFJRIGTWOBNYQ**, right wheel **PTLNBQDEOYSFAVZKGJRIHWXUMC**, plaintext **WELLDONEISBETTERTHANWELLSAID**, and exact ciphertext **OAHQHCNYNXTSZJRRHJBYHQKSOUJY**. The source test pins this independently replicated vector and decrypts it completely. The 29-rune adaptation assigns one GP29 symbol to every slot in each disk and tests three central nadir positions, zero-based **13,14,15**. No original Cicada clue selects the Chaocipher operation or either wheel key.

## Exact source and results

The [canonical original 58-page corpus](../resources/liber-primus/lp2-corpus.json) contains **12,956 unknown runes on physical pp0–55**. Exactly **86 of 12,955** consecutive source pairs are equal. For a bona fide native-English input, repeat the entire known clear p57 PARABLE 95-rune source in its original sequence to exactly 12,956 symbols. That control has **137** adjacent equal symbols.

For each of three 29-wheel nadir positions, generate **48 pseudorandom pairs of initial 29-permutation wheels** using fixed xorshift32 seed 3301 and Fisher–Yates. No wheel key was chosen by its output. All **144** resulting full-length GP29 ciphertexts are perfectly decrypted using their own wheel keys, recovering **12,956/12,956** native clear runes.

| Nadir (0-based) | Independent wheel-key pairs | Mean adjacent ciphertext equals | Min–max |
| ---: | ---: | ---: | ---: |
| 13 | 48 | 453.6042 | 397–509 |
| 14 | 48 | 460.4167 | 411–520 |
| 15 | 48 | 459.0000 | 407–515 |
| **Original unknown LP2** | source | **86** | n/a |

All 144 tested original-length outputs have at least **397** adjacent ciphertext equality sites; authentic ciphertext has **86**. The historical self-modifying disks alone therefore do not explain this central source statistic. Searching for unmarked wheel keys that rescue the observed scarcity would introduce an unconstrained fitted assumption.

This is **not an all-key impossibility theorem**: particular adversarial wheel keys, different underlying plaintext, other reset conventions, or an independently signaled extra anti-repeat transform are outside the scope. The nadir choices are GP29 research adaptations, not part of the historical 26-letter mechanism.

## Reproducibility and decision

The [single-file read-only CommonJS source test](../sims/lp2_gp29_chaocipher_native_source_gate_sft.cjs) uses the canonical ciphertext file, exact 26-letter reference, all three 29-symbol variants, seeded complete-length controls, and exact forward/backward recovery. It prints all 144 source-control repeat counts.

**Decision:** file this exact classical mechanism as a lower-priority original-cipher route. No plaintext, source-derived key or authenticated consumption instruction emerged; prefer mechanisms whose reversible operation is selected by manuscript evidence and that can explain the source's extraordinarily low repeat rate without a fitted extra layer.
