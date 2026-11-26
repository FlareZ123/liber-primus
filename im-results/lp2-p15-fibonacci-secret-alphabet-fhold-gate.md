# p15–22 Fibonacci recurrence with arbitrary secret alphabets: exact F-hold gate

Agent 10, 26 November 2026. **No unknown plaintext or authentic key.** This is a substantive extension of the [canonical all-841-seed exclusion](lp2-p15-fibonacci-allsecret-ftransparent-original-gate.md), not another canonical-key sweep. It tests whether changing the entire alphabet can rescue the source-motivated Fibonacci recurrence, and then tries a finite exact lexical inverse. The [p15 spiral](../results/lp2-p15-fibonacci-prime-spiral.md) establishes Fibonacci-indexed primes, not this receiver.

## Exact reduction and original feasibility

Freeze K[t+2]=K[t+1]+K[t] mod29, arbitrary initial pair, arbitrary common permutation pi fixing 0, or separate alpha/beta fixing 0. P=0 emits C=0 and holds t; otherwise beta(C)=alpha(P)+K[t] mod29, advances t. Every nonzero seed is in one of four disjoint orbits under simultaneous rank scaling and phase rotation; the 30 projective initial pairs collapse into groups of 14,14,1,1. For a ciphertext-only necessary/sufficient feasibility test, only equality classes of K and its zero positions matter. The unknown inverse images of distinct nonzero shifts are distinct ciphertext labels 1..28. A nonzero ciphertext C consumes and may not equal the inverse image of the current shift. A zero ciphertext may hold or consume only at a nonzero key shift. Split at every ciphertext zero and represent the start phase of each nonzero segment by a one-hot Boolean vector. This gives a finite exact SAT encoding; any satisfying partial inverse mapping extends to a full permutation, hence yields a legal original forward round trip even in the common-alphabet case. It uses no word boundaries or assumed plaintext.

Original canonical p15–22: 1,903 runes, 72 literal ciphertext zeros, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. Actual local Z3 SAT solver results (120s timeout, all four completed):

| Orbit | Seed pairs | Distinct nonzero shifts | Original SAT result | SAT time |
|---|---:|---:|---|---:|
| Representative [0,1], zero-containing | 392 | 9 | UNSAT | 0.115s |
| Representative [5,27], mixed nonzero | 392 | 13 | SAT | 0.154s |
| Representative [1,6], 14 distinct | 28 | 14 | SAT | 0.271s |
| Representative [1,24], period 7 | 28 | 7 | UNSAT | 1.108s |

Thus **420/840 nonzero seed pairs are impossible even with arbitrary independent secret alphabets**. The other 420 are cipher-legal but not evidence of English: the two explicit arbitrary witness keys replay all 1,903 runes exactly, with plaintext IoC 0.0343301 and 0.0348329. Zero key is identity in common alphabet and an arbitrary static bijection in separate alphabets; it cannot produce A/I/O at the 18 original singleton sites, which contain 12 distinct ciphertext labels. Four source-shaped positive plants, each using clear p57 repeated to 1,903 with two dictionary words inserted, distinct random alphabet and phase, cover all four orbits and obtain exact legal complete forward replay. Their true two-word modular constraint graphs survive as well. This is a feasibility control, not blind recovery of the planted alphabet.

## Two long original words: common-alphabet inverse

Use original complete word spans at chapter-local offsets **159 (13 runes)** and **1844 (12 runes)**, both free of ciphertext zero. They are the first two chosen anchors of maximal/restrictive length. Since F is literal and transparent, neither candidate plaintext word can contain F. Enumerate every normalized dictionary word of correct length and every possible start phase; the two anchors are separated by enough ciphertext zeros to grant unrestricted relative phase. For a candidate word each consuming rune imposes pi(C)-pi(P)=K[t] mod29. Weighted union-find composes the resulting additive constraints. A contradictory cycle or two distinct labels forced to equal rank rejects exactly. Cross-component disjoint rank packing is deliberately omitted (a safe relaxation); zero survivors therefore imply no valid permutation. This does not assume a particular key, hold history, unigram score or printed punctuation beyond the two word spans.

Local TextBlob 321210-byte en-spelling.txt SHA256 eade91558167fe09a481abf59e176af8643ad78678cc53dd5aeaf2a8b30fa332. Repository copy 140e1d22b5f8c45deddd2e8b25549d9d6307d938 with header additions produces identical counts under the frozen greedy digraph normalization (QU→CW, V→U,K/Q→C,Z→S). Normalized zero-free length13/12 dictionaries have 410/776 entries. Larger union with cmudict 1.1.3 (cmudict.dict SHA256 81917843c7f44ce2b094ac63873c2c7a4cf802040792c455ba3ca406891c3d22) has 1287/2466 entries; encoded 8–13-word union SHA256 82fbb34882c173fe877ab434393c37f27bcf1ee81536f49c517a0e58bba4795d.

| Dictionary and seed orbit | Anchor 1 locally compatible phase-word choices | Anchor 2 choices | Pair joins tested | Survivors |
|---|---:|---:|---:|---:|
| TextBlob, mixed 13-shift | 227 | 582 | 132,114 | 0 |
| TextBlob, 14-shift | 224 | 420 | 94,080 | 0 |
| TextBlob+CMU, mixed | 676 | 1904 | 1,287,104 | 0 |
| TextBlob+CMU, 14-shift | 588 | 1610 | 946,680 | 0 |

Both cipher-legal common-alphabet orbits are therefore **exactly excluded conditional on these two original words belonging to the finite tested register**. No need for a whole-chapter language search in this exact model. The exclusion grants arbitrary original phase and hold masks. It does not extend to OOV spellings, changed segmentation or independent alphabets.

The separate-alphabet relaxed graph test with TextBlob retains 1,148,212 of 20,798,370 and 1,811,530 of 31,585,400 pairs, respectively; these are necessary partial constraint fits only, not complete keys. The four 120s singleton-constrained exact SAT runs (common/separate × two surviving orbits) return UNKNOWN timeout, no result. No interpretation of timeout as UNSAT. The two-anchor common proof does not depend on those timeouts.

## Reproduction

[Python SAT and input preparation](../sims/lp2_p15_fibonacci_secret_alphabet_fhold_sat.py) and [C++ graph gate](../sims/lp2_p15_fibonacci_secret_alphabet_graph_sft.cpp). Run Python from repo root with z3-solver installed; optional --singletons; --prepare DIR exports canonical cipher and dictionary; --cmu expands the dictionary. Compile C++ with -O3 -std=c++17 and run fibgraph DIR common 0 or 1 (both default to two words); repeat with separate for the weaker graph test. Actual local tested cores used system libz3 C API and g++ with the exact source runes copied from repository canonical JSON and the local TextBlob/CMU register. The portable repository wrappers are reconstructed from those executed cores; standalone Python z3-solver binding wrapper/CI not run in this invocation. [Raw executed result](lp2-p15-fibonacci-secret-alphabet-fhold-output.json).

**Next decision:** retire the common-alphabet Fibonacci recurrence under the stated two-word native dictionary condition. Do not re-run canonical seeds or claim arbitrary alphabet absence. Independent alphabets need a new source selector or stronger inverse, rather than expanding timeouts.
