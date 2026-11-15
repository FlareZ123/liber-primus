# Exhaustive five-digit Fibonacci / Gromark all-secret original GP29 gate

**Decision (15 November 2026):** A standard five-digit Gromark-style lagged-Fibonacci decimal primer cannot directly encode the entire LP2 p0–55 source as conventional GP29 English/Latin under any of its **100,000** starting primers and any fixed secret mixed alphabet. The all-secret collision test is in fact stronger: it permits a *different arbitrary secret GP29 permutation for each of the ten running-digit values*. Every primer gives original coincidence near **1/29**, whereas every primer applied to the independent, same-length source-native Vulgate passage gives coincidence **above 0.07389**. No unknown ciphertext has been decrypted.

## Human-visible premise and competing explanation

The first-party p15 figure supplies a Fibonacci sequence and the original manuscript has recurring five-dot clusters; the independent original-source lag-five analysis finds a real but unexplained excess inside printed words. These clues make a five-register Fibonacci running key a bounded candidate, although **none supplies a Gromark instruction, five-decimal-digit primer or secret alphabet**. The conventional [ACA GROMARK cipher](https://cryptogram.org/downloads/aca.info/ciphers/Gromark.pdf) uses a five-digit decimal primer, successive digit sums modulo ten, and a mixed alphabet. An independent [academic cryptodiagnosis](https://richardbean.id.au/presentations/2022-06-21%20cryptodiagnosis_of_k4.pdf) describes the same lagged-Fibonacci mechanism. We transpose only that specific operation into Gematria Primus's 29 symbols.

The leading rival is ordinary LP2 encryption with state changes, a high-entropy source key, or another reversible transport. This experiment excludes a narrow, historically recognizable cipher family without assigning purpose to the numerology.

## Exact candidate and key-independent test

Let P[i] and C[i] denote 0–28 GP29 indices, M an **unknown arbitrary permutation** of all 29 symbols, and d[0..4] an arbitrary zero-padded five-digit decimal primer. For i >= 5:

    d[i] = (d[i-5] + d[i-4]) mod 10
    C[i] = M((P[i] + d[i]) mod 29)

For every printed position assigned the same digit d, both addition of d and M are bijections of GP29. Therefore the complete 29-bin frequency histogram in that digit class changes only by permuting its bins. The class-conditional collision probability

    I = Σ_d Σ_g n[d,g] * (n[d,g]-1) / Σ_d N[d] * (N[d]-1)

is **identical before and after every possible secret M**. It is also invariant if we give the cipher ten *independent arbitrary secret GP29 substitution alphabets*, a deliberate over-allowance beyond authentic Gromark. No keyword, shift, alphabet orientation, or unknown 29! permutation is fitted.

The original input is the unmodified canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json), physical p0–p55 in order, including all page transitions and 12,956 rune symbols. The independent positive reference is the first 12,956 GP29 rune indices of the [word-preserving Latin Vulgate corpus](../resources/control/latin-vulgate-gp-wholewords.txt). That source is pre-encoded with the repository's authenticated 29-symbol word orthography, including rune contractions. These two streams are evaluated under **the same primer schedule** and original-length positions.

An exact symmetry shortens exhaustive evaluation: multiplying every primer digit by any unit 1, 3, 7 or 9 modulo 10 multiplies every later digit by the same unit, preserving the recurrence and merely permuting the ten digit-class names. The 100,000 primers partition into **32 singleton orbits and 24,992 four-member orbits**, so the [test implementation](../sims/lp2_gromark_fib5_allsecret_original_sft.cjs) executes all **25,024** canonical representatives, with no missing case and no statistical sampling.

## Original-cipher and source-native results

| Source | Minimum over all 100,000 primers | Maximum over all 100,000 primers |
| --- | ---: | ---: |
| **Original LP2 p0–p55 GP29 ciphertext** | 0.0342655691 (primer 15312) | **0.0347388335** (primer 16019) |
| **12,956 authentic Vulgate GP29 symbols** | **0.0738977839** (primer 23545) | 0.0752216259 (primer 16990) |

For the best original primer 16019, the cipher has **298,487 matching within-digit rune pairs among 8,592,315 eligible pairs**. For the least favorable source-native Latin primer 23545, the text has **691,201 matching pairs among 9,353,474 eligible pairs**. The theoretical uniform-symbol baseline is 1/29 = 0.0344827586.

A full native positive uses primer 16019 and secret mixed alphabet M(x) = (7x+3) mod29 on all 12,956 original-length GP Latin positions. Its decoder recovers **12,956/12,956 source-native plaintext symbols**, exact forward re-encryption restores **12,956/12,956 planted ciphertext symbols**, and its conditional collision statistic equals the original plaintext's statistic exactly. This demonstrates that the diagnostic rejects neither the known cipher family nor native original-length GP ciphertext produced by that family.

The fixed [Windows Node22 manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43761570542) completed **successfully** on the repository's exact inputs, asserting the orbit census, all four extremal scores, and the authentic GP positive plant. No new per-commit workflow was created; the preexisting manual Agent3 SFT workflow received a choice of test.

## Stronger independent nine-chapter primer-reset gate

The visually established chapter boundaries make independent resetting a much more plausible competing key schedule than a single full-book seed. Permit the attacker to choose an **entirely independent unknown five-digit primer in each of the nine original chapters**, for a nominal joint key space of 100,000^9. The collision obstruction factors by chapter: if **any one chapter** cannot be the purported direct source register under **any** of its 100,000 primers, no joint nine-primer assignment can work. The same exact 25,024-orbit exhaustive search was independently performed for every original chapter against its matching-position source-native Latin segment.

| Original illustrated chapter | GP29 runes | Maximum original collision over all primers | Minimum source-native Latin over all primers |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | **0.03978900** (11662) | 0.07033767 (11403) |
| p3–7 | 1,145 | **0.03743664** (26374) | 0.07016261 (21494) |
| p8–14 | 1,729 | **0.03645946** (14500) | 0.07306520 (11465) |
| p15–22 | 1,903 | **0.03642477** (10153) | 0.07464096 (21565) |
| p23–26 | 1,021 | **0.03751031** (26502) | 0.07048204 (22450) |
| p27–32 | 1,433 | **0.03622646** (02201) | 0.07314020 (14620) |
| p33–39 | 1,680 | **0.03638694** (01711) | 0.07485168 (52352) |
| p40–53 | 3,008 | **0.03556660** (51909) | 0.07324888 (27003) |
| p54–55 | 308 | **0.04638298** (22659) | 0.06425111 (16180) |

The shorter final chapter naturally has the largest original max-over-primer fluctuation. Even there, no possible primer closes the gap to the native source minimum. Every chapter individually excludes the direct-Gromark/native-register hypothesis; allowing nine different secret mixed alphabets, **one per chapter**, still leaves the invariant unchanged. This removes the most obvious source-visible reset escape for the tested family.

The extended [same source-native Windows Node22 test](../sims/lp2_gromark_fib5_allsecret_original_sft.cjs) asserts every chapter's original maximum and independent source minimum, in addition to the bookwide exhaustive invariant and a fully inverted authentic native plant. [Updated successful original-source run 43762940381](https://github.com/FlareZ123/liber-primus/actions/runs/43762940381) executes the exact updated file on the repository inputs.

## Decipherment consequence and strictly bounded scope

If original LP2 contains ordinary GP29 prose encrypted by a five-digit Fibonacci/Gromark running key, either continuous or independently reset at its nine original visual chapter boundaries, its digit classes must retain the source-language concentration that is absent in the actual ciphertext. This survives a much larger allowance of one arbitrary secret alphabet per digit and all 100,000 primers, so *another guessed primer, alphabet keyword or alphabet permutation in that family cannot rescue it*. Retire this direct family for both continuous and nine-chapter-reset clocks.

The result is an empirical source-native-English/Latin contradiction rather than a language-free mathematical impossibility for adversarially chosen, unusually uniform plaintext. It does not exclude nondecimal primer bases, a different recurrence, physical-page or word-specific key resets, a changing alphabet or symbol state, optional/null runes, altered segmentation, non-GP intermediates, or modern encryption. No author-supplied key, original plaintext, table opcode or continuation has emerged. Further work on this branch requires an independent first-party clue specifying a materially different state transition or external key.
