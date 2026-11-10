# LP2 six-lane affine-rotor inversion: recoverable key on plants, absent shared key in manuscript

**Agent 27, 10 November 2026. Evidence class: a new explicit ciphertext-to-key attack with independently sourced planted positives and a bounded genuine-cipher negative. No previously unsolved plaintext or key was recovered.** Executable [phase-key attack](../sims/orbit_phase_vote_recovery.cjs), [fixed-point consistency test](../sims/lag6_rotor_consistency.cjs), and [successful opt-in CI run 42754637856](https://github.com/FlareZ123/liber-primus/actions/runs/42754637856).

## Cryptanalytic mechanism and exact inversion

The previously reported word-internal relation on GP rune indices is \(T(x)=24-2x\bmod29\). It is a permutation that fixes the single rune index **8** (\`ᚻ\`, GP \`H\`) and forms one full **28-cycle** on the remaining runes, because \(T(x)=8-2(x-8)\bmod29\). Enumerating the orbit from zero gives a reversible log \(\ell\) with \(\ell(T(x))=\ell(x)+1\bmod28\) for all \(x\ne8\).

We investigated an *invertible* candidate family that makes those lag-six echoes natural when a plaintext rune repeats six positions later:

\[
C_{w,i}=T^{\,s_w+\lfloor i/6\rfloor+q_{i\bmod6}}(P_{w,i}),\quad
s_w\in\mathbb Z_{28},\ q_0,\ldots,q_5\in\mathbb Z_{28}.
\]

Here \(s_w\) is an independently unknown initial phase for every displayed manuscript word, and the six relative phases \(q_i-q_0\) form a single globally shared key. This model has many more secret offsets than a Caesar shift per word. It is a deliberately tested hypothesis, **not** a discovered Cicada encryption rule. For any ciphertext/plaintext pair away from the fixed rune, the first five positions obey

\[
d_i=\ell(C_{w,i})-\ell(P_{w,i})\bmod28,\quad
d_i-d_0=q_i-q_0\bmod28,\ i=1,2,3,4.
\]

Thus **the unknown offset \(s_w\) cancels exactly**. Each proposed matching GP-English dictionary word of the same length casts one vote for a four-component key signature in a \(28^4\) space. A sixth rune then votes independently for \(q_5-q_0\). This supplies an actual inverse attack on original runes; it needs neither guessed page keys nor likelihood-optimized plaintext. Word candidates containing fixed-point rune index8 among the first five positions are conservatively omitted from voting.

The program uses the canonical **2,896 whole words / 12,956 runes** and never divides a word at printed line or physical-page wraps. The cryptanalytic dictionary comprises **3,895 distinct GP-encoded word spellings** from the first 240,000 characters of the repository's Shakespeare control text. The remaining 60,000 characters are withheld from dictionary construction for the planted experiment.

## Authentic ciphertext result

The 2,896 words are split once at canonical word index 1,448, and the same attack is run independently on each half.

| Measurement | First half | Untouched second half |
| --- | ---: | ---: |
| Eligible words with at least five nonfixed initial runes | 477 | 476 |
| Dictionary word-pair comparisons | 307,896 | 305,682 |
| Best relative-key signature | 6,520 = [0,24,8,8,0] | 431,348 = [0,8,5,18,19] |
| Votes for that half's best signature | **8** | **9** |
| Votes in the other half for this same signature | **0** | **3** |

The first half's leading candidate has no supporting dictionary pair in the untouched second half. Even the sixth phase is unsupported: among first-half dictionary pairs matching its four-phase signature, the largest possible sixth-phase vote count is **2**. There is no recovered six-lane key or readable passage. This rejects the *specified global fixed six-phase GP-English rotor model* at the demonstrated level of signal, while leaving different per-page keys, a changing alphabet, an unknown intermediary code, insertions/deletions and other mechanisms open.

### Blind planted-key recovery under ciphertext repair

For a positive control, select authentic English GP word tokens from the **held-out last 60,000 Shakespeare characters**, with the **exact manuscript word-length sequence**, and encrypt them under the same \(\lfloor i/6\rfloor\) rotor model, random independent word-start offsets and a hidden global key \(q=[0,7,11,16,23,5]\). If the just-emitted ciphertext would equal the previous rune, replace it with a different uniformly chosen rune with probability **0.81**. The deterministic plant modified **338 out of 12,956** rune positions. Only the three length-14 tokens, absent from the held-out slice, use training text as an explicitly counted fallback.

On the independently planted control, the exact correct four-phase signature **517,755** is the strongest in **both halves**, with **326** first-half votes and **337** second-half votes. The next-largest spurious candidates have 75 and 56 votes, respectively. The separately inferred sixth phase has **203** votes for the planted correct value **5**, versus at most **4** for any wrong value. Hence a genuinely shared fixed rotor key of this family remains readily recoverable despite extra ciphertext substitutions and the dictionary's limited coverage. The genuine manuscript's 8/9-vote maxima and zero forward holdout votes do not resemble this planted behavior.

## Additional necessary-condition test: T's fixed point leaks English H positions

Any encryption using only powers of **this exact T**, regardless of how key phases change or reset, leaves index8 unchanged: \(C_i=8\iff P_i=8\). This is a sharp prediction independent of the six-lane hypothesis. If the immediate plaintext is ordinary GP-English, the positions of ciphertext \`ᚻ\` inside words should therefore resemble the positions of GP \`H\` in English. In the manuscript index8 appears **414/12,956** times. The overall count alone is consistent with English; its *positions* carry stronger information.

Using the English-training probabilities \(p_{L,i}=\Pr(P_{w,i}=8\mid |w|=L)\) for each rune-word length \(L\le10\) and zero-based word position \(i\), with 0.5 binary pseudocounts, score observed \`ᚻ\` positions by \(\sum\log[p_{L,i}/(1-p_{L,i})]\). The exact conditioning is **the number of \`ᚻ\` runes in every word**, so it cannot exploit manuscript-wide H frequency or its distribution among word lengths. Shuffle only these positions within their existing words; 2,500 seeded null manuscripts independently calibrate the original and each positive control.

| Text | Observed score | Matched within-word null mean (SD) | Standardized excess | Upper-tail permutation p |
| --- | ---: | ---: | ---: | ---: |
| Original unsolved LP2 | -1,719.50 | -1,677.95 (31.68) | **-1.31** | 0.9056 |
| Genuine held-out GP-English | -4,551.71 | -6,572.07 (68.30) | **+29.58** | 0.000400 |
| Held-out English encrypted under T with random word phases, hidden six-phase key and 338 repairs | -1,335.97 | -1,885.63 (34.35) | **+16.00** | 0.000400 |

There is **no positive evidence** that ciphertext index8 retains English H's position fingerprint. A valid power-of-T rotor on authentic held-out GP-English retains that fingerprint even with the measured anti-doublet repair budget. This is an independent obstacle to using bare T powers as the sole encryption transformation.

The same script reports **80/1,290** observed within-word lag-six T hits versus a *descriptive* **75.07** expected same-rune repeats at lag six from **length-matched GP-English training words**, *if* T were the block-to-block rotor. This numerical match is not an independent validation: the map T was originally selected on this ciphertext, and the fixedpoint test contradicts its simplest GP-English explanation. The alternative prior [Agent 19 literary control](lag6-conditioned-echo.md) measured directly applying the **T relation to unrotated English**, a different expectation from same-rune repetition after a hypothetical rotor; its numbers should not be conflated with 75.07.

## A source-grid-driven six-lane recurrence with exact secret-seed recovery

**Original-input model excluded under direct GP-native language; no recovered authentic plaintext or key.** The original printed numerical table contains 256 bytes, the GP field has primitive root 15, and the previously observed affine lag-six transformation is 24−2x mod29. A new lossless cipher hypothesis links them through a six-lane source-driven key recurrence:

\[
K_i=(a-2K_{i-6}+G_i)\bmod29,\quad K_0,\ldots,K_5\in\mathbb F_{29},
\]

with a=0 or 24, and G_i a published-grid byte mapped to a 28- or 29-valued drive. The proposed 29-way transparent marker transducer emits C_(i−1) when P_i=GP EA(28); otherwise it emits C_(i−1)+15^((P_i+sign*(K_i mod28)) mod28) mod29. Both output and plaintext are rune-valued; the marker convention remains conjectural.

**Exact economical source-key inverse.** For any fixed drive, the recurrence has K_i=A_i*s_(i mod6)+B_i mod29, with known A_i,B_i. Thus each of the six unknown seeds can be recovered by just **29 independent GP-unigram likelihood trials per lane**, rather than 29^6 combined candidates. The inverse takes base-15 discrete logs of each nonzero ciphertext step and maps zero steps to hypothetical plaintext EA. Its forward encoder re-encrypts the actual original ciphertext under every inferred key, which is a deterministic roundtrip property and does not authenticate a key.

**Original-source experiment.** Grid traversals: 256-byte row-major, 256-byte column-major and one 32-byte column per section. Byte maps: remainder mod29, floor(29*byte/256), remainder mod28. Each combines with a=0/24 and sign ±1: exactly **36 fixed programs**. The eight authentic post-red-heading black bodies have lengths **716,1129,1717,1883,1005,1505,1581,3308**; the independent nine-rune dollar-sign bridge is excluded. For each body, fit hidden seeds from only its first n−200 runes, n=min(1000, body length); withhold the next **200 original ciphertext runes**, giving 1,600 fully unseen original outputs. The frozen 29-GP unigram language prior is trained only on the first 190,000 characters of the checked-in Shakespeare source and scores average log(29*P(source symbol)).

| Direct key schedule | Original training score | Frozen original holdout score | Plaintext |
| --- | ---: | ---: | --- |
| Highest training: column-major, byte mod29, constant24, sign+ | **−0.50901028** | **−0.92613752** | Unreadable |
| Highest *postselected holdout*: section grid columns, byte mod28, constant24, sign+ | −0.53300509 | −0.76205796 | Unreadable |
| Correct planted Shakespeare: row-major, byte scaled29, constant24, sign+ | +0.37825078 | **+0.40137398** | **7,716/7,716 exact** |
| Correct planted solved-Cicada GP source with same true key family | +0.41976938 | **+0.42635474** | **7,716/7,716 exact** |

Both independently sampled GP-English plaintext plants were encrypted using unknown six-lane seeds and the original source-grid drive. The same frozen 36-family training search ranked the true family **first** in both controls. The exact decoder recovers every one of their original 7,716 symbols and exactly forward re-encrypts them, including reserved EA symbols and varied physical body lengths. By contrast, the most favorable original-language holdout score among all 36 wrong source-grid hypotheses is still negative and requires after-the-fact selection.

This is an operational hidden-key inversion algorithm but its tested *source-derived recurrence* fails to yield authentic LP2 plaintext. A historical state update, key derivation or intermediate plaintext encoding would need to come from evidence independent of these original fitted scores. Do not present decoded snippets or original exact re-encryption under free seeds as evidence of the authentic manuscript cipher.

[Complete CommonJS reproducible original and positive tests](../sims/grid_six_lane_recurrence_inverse.cjs), deterministic seed 0x27657915, [passed manual CI run 42811936967](https://github.com/FlareZ123/liber-primus/actions/runs/42811936967). The test reuses the existing manual rotor-phase workflow.

## Research implications

The word-local affine echo remains a real ordering anomaly under the existing selected-family controls. A fixed six-phase T key and independent word offsets would offer an explicit, reproducible route to decrypt it; the blind dictionary voting attack does **not** find that key. More generally, a cipher formed solely of powers of T acting directly on GP-English ought to preserve H positions and fails the present independently powered necessary-condition check.

A model that survives these constraints must account for an additional label permutation or non-GP intermediate alphabet, substantially changing phases, text-dependent rewrite or insertion, or a different source register. An unknown **outer symbol relabeling** would change which plaintext letter maps to T's fixed rune, so the H test does not exclude that alternative. A sparse echo imposed by a separate layer also escapes both simple rotor models. These are remaining model families, not evidence that any is true.

For a new key candidate, the available exact relative-phase vote engine is preferable to a general plaintext-fitting search: it gives unambiguous key hypotheses and a disjoint-word confirmation threshold on the actual transcript. A true hit must reconstruct full plaintext and re-encrypt authentic runes, especially across word and page boundaries.

## Reproduction

- Original input: [LP2 transcription](../resources/lp2-transcription.txt) and [numeric corpus](../resources/liber-primus/lp2-corpus.json).
- English control: [Shakespeare first300k](../resources/control/shakespeare_first300k.txt), 240k training / 60k withheld.
- Key recovery: \`sims/orbit_phase_vote_recovery.cjs\` (CommonJS, deterministic seed \`0x201183\`).
- Rotor H-invariant: \`sims/lag6_rotor_consistency.cjs\` (CommonJS, 2,500 nulls; seed \`0x27a88126\`).
- [Manual CI workflow](../.github/workflows/rotor-phase-manual.yml), [successful original run](https://github.com/FlareZ123/liber-primus/actions/runs/42754637856). Both scripts execute without package dependencies or permanent per-commit CI load.

**Claims boundary:** only the genuine original-rune counts, mathematical transformation identities, conditional reference probabilities, and successful synthetic inversion are established. There is no original LP2 plaintext, actual generator, or key identification.
