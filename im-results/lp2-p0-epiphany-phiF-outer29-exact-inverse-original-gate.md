# LP2 p0–p2: all-secret outer alphabet plus authentic prime/F skip fails a conditional p0 title crib

**Agent14, 22 November 2026. Classification: exact first-chapter original-cipher necessary-condition failure, conditional on a previously proposed plaintext crib and normal English one-rune words. No independent plaintext, creator secret key, or final destination recovered.**

## The single motivated hypothesis and its actual weak premise

The *genuinely solved* LP2 physical p56 uses GP29 consecutive-prime totient addition and literal plaintext-F transparency: **plaintext F emits ciphertext F and consumes no key value**. Earlier LP2 p0 research proposes the two red title words **EPIPHANY SEEKS**, exactly matching the 8|5 original word lengths and yielding a structured candidate state/key packet. This title is an **unproven** cryptanalytic candidate, though it appears in the authenticated 2016 signed word register.

Ask a direct continuation question that has not been decided by first-layer additive or abstract substitution searches: *could the historical p56 prime/F operator explain this proposed opening and the rest of the original p0–p2 chapter if it is concealed by an entirely unknown, arbitrary outer 29-rune substitution alphabet?* Do not assume an affine or alphabetically ordered secret.

Let one fixed unknown \(\sigma\) be **any bijection** of all 29 GP symbols. Give the original chapter an arbitrary initial prime index \(s\in[0,4999]\). The positive source p56 arithmetic orientation and its genuine F exception determine the reversible candidate:

\[
\begin{cases}
P_i=F \implies C_i=F,\quad t_{i+1}=t_i\\
P_i\ne F \implies C_i=\sigma((P_i+(\mathrm{prime}_{s+t_i}-1))\bmod29),\quad t_{i+1}=t_i+1.
\end{cases}
\]

The secret outer substitution acts only on normally enciphered symbols. In particular ciphertext F can arise either from a bypassed plaintext F or from a normally enciphered non-F: **every legal choice is included**. The plus sign and scalar one are exactly those from authentic solved p56; arbitrary scalars and alternate arithmetic orientation are outside this source-fixed family.

The first original p0 13 ciphertext runes, after restoring the authenticated p0 glyph transcription, are:

\[
[15,8,18,3,6,19,27,0,\;15,26,18,21,5].
\]

The proposed source-register plaintext (EPIPHANY SEEK(S)) is:

\[
[18,13,10,13,8,24,9,26,\;15,18,18,5,15].
\]

None of the 13 hypothetical plaintext runes is F. Thus the prime clock consumes 13 consecutive terms and the title alone determines 13 necessary input/output pairs of the unknown secret alphabet for each candidate start \(s\). If two input values demand different ciphertext outputs, or two observed ciphertext values demand different inverse mappings, that phase is impossible under **every** secret permutation.

## One initial phase survives; it is not a discovered key

Scanning all 5,000 source-key starts against the exact 13-rune proposed title leaves **one algebraically compatible phase: 4,557**. Its title requires **11 distinct fixed ciphertext-to-internal-symbol assignments**; the remaining 18 alphabet mappings are still completely secret.

This single surviving phase is **not evidence that start4,557 is authentic**. As an independent frequency-of-compatibility control, slide each of the 83 possible 13-rune contiguous windows from genuinely solved p57 against the same untouched 13-rune original ciphertext, with the same complete 5,000-phase family. **30/83 reference cribs have one or more matching phases**, 15/83 have exactly one, and the total counts range from zero to five. A nonempty one-phase fit is normal enough to occur without any manuscript-selected prime offset.

Its value is instead that the full subsequent all-secret test has just one eligible phase to exhaust, without post-selecting a language score.

## Independent original printed single-word grammar

The first physical chapter p0–p2 contains **729 original GP runes**, organized into **158 authentic printed whole words**, with exactly **five single-rune words** at unaltered chapter-global rune offsets:

| Printed original position | Source page | Page-local offset | Printed GP glyph |
|---:|---:|---:|---|
| 176 | p0 | 176 | EA |
| 244 | p0 | 244 | S |
| 350 | p1 | 88 | N |
| 530 | p2 | 2 | U |
| 644 | p2 | 116 | F |

If the original printed boundaries preserve native ordinary-English word boundaries, each of these five decrypted one-rune words must be **A, I or O**. Allowing O as a standalone interjection is deliberately generous. This is a lexical necessary condition rather than a guess of the five unknown plaintext letters. Source transcript parsing is checked against all 12,956 canonical original rune positions, the 2,896 original printed words, 83 singleton words bookwide and all five chapter positions.

## Exact inverse over all F skip histories and every secret permutation

For each phase compatible with the title (only 4,557), initialize the 11 known inverse-alphabet mappings. The remaining 18 ciphertext labels each have a *domain of allowed unknown internal rune values*, with 18 remaining values available.

At each successive original ciphertext rune, maintain **every different feasible pair**:

- consumed-prime count \(t\), accounting for **every possible previous literal-F bypass**;
- all 18 allowed internal-rune domains for the as-yet-unassigned ciphertext labels.

At a consuming position the inverse output is \(P_i=\sigma^{-1}(C_i)-K_{s+t}\bmod29\). Normal encipherment must never infer plaintext F, because authentic plaintext F would have bypassed and left \(t\) unchanged. For every printed singleton also intersect its possible inverse output with {A,I,O}. A ciphertext F may bypass unless it is itself a singleton, which could not legitimately decode to F in normal English.

After each domain restriction, test the **exact 18-label bipartite perfect-matching condition**. This is a necessary and sufficient condition that *some* complete one-to-one secret alphabet still satisfies the accumulated constraints. No guess of the secret symbols, source key, F history, or output language is forced. Identical future-equivalent domain/clock states are losslessly deduplicated.

The original survivor timeline is:

| Event | Original global rune offset | Exact surviving F-clock/domain states |
|---|---:|---:|
| First p0 singleton EA | 176 | 8 |
| Second p0 singleton S | 244 | 19 |
| p1 singleton N | 350 | 327 |
| p2 singleton U | 530 | 6,752 |
| Final p2 singleton F | 644 | 2,442 |
| **First impossible original position** | **654** (p2 offset 126) | **0** |

Intermediate exact state counts reach a maximum of **27,960**; every state maintains a possible *complete* secret alphabet, rather than a local greedy assignment. The surviving 2,442 paths after rune644 all become impossible by rune654. Thus **no** admissible 29-symbol substitution, initial prime start0–4,999 or literal-F skip trace can simultaneously support the proposed title, the five original singleton English word roles, and the original first 655 ciphertext runes.

**This contradiction is independent of an n-gram score and independent of any candidate completions of the other 13 missing secret-symbol assignments.** It uses untouched, cross-page original holdout ciphertext, reaching physical page2. The state exhaustion, not a random-text similarity number, is the decisive outcome.

## Authentic plaintext positive and limitations

The [read-only CommonJS SFT](../sims/lp2_p0_epiphany_prime_outer29_literalF_allsecret_sft.cjs), executed with Windows Node22 in [passing Actions run 44991988768](https://github.com/FlareZ123/liber-primus/actions/runs/44991988768), freezes the original 5,000-phase title count, all five original singleton positions and exact first-impossible offset 654. It additionally constructs a **729-rune positive cipher** from the genuinely clear solved p57 GP stream, with the source-proposed title and the five A/I/O singleton slots fixed, a random secret 29-symbol permutation, actual nonconsuming plaintext F events, and known valid prime start167. Full plaintext recovery from its *true* secret and F clock is **729/729 exact**, and the same all-secret dynamic program admits legal positive prefix states through physical p0. This is a model correctness control, not proof of an original key.

**Decision:** Accepting the independently proposed EPIPHANY SEEKS red title as a provisional crib, the authentic p56 prime-totient/F-bypass mechanism cannot be its actual chapter decoder even when concealed by an arbitrary outer alphabet and a key start anywhere among the first 5,000 primes, assuming the original five singleton words are ordinary English A/I/O. This rejects a substantive rescue of a source-authenticated cipher without enumerating 29! substitutions or hiding uncertain F skips.

It does **not** invalidate the title crib itself, establish any new LP2 plaintext, or exclude other ciphers. It also does not cover non-GP English, freely altered original word boundaries, start beyond4,999, changing secret alphabet inside the chapter, non-p56 additive multiplier, or an additional layer that makes the singleton words' immediate plaintext different. A meaningful successor would need a source-visible reason for such a modified operation and independent withheld plaintext, rather than retuning this exhausted static outer-alphabet family.
