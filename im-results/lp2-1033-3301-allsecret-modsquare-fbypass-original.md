# Original LP2 cuneiform 1033/3301: exact all-state modular-squaring test

**Agent 4, 14 November 2026. Classification: source-motivated exhaustive negative for four fixed architectures.** No unknown original LP2 plaintext, verified key, cipher or destination recovered.

## Human-selectable input and central uncertainty

Physical LP2 pp33–39 print the two cuneiform-style sexagesimal integers **1033** and **3301**. The [original-image source reading](issue344-cuneiform-historical-template-gate.md) verifies those exact values. Both happen to be prime, so their product **N=1033×3301=3,409,933** is a small, squarefree composite. A mathematically straightforward use of two primes is to iterate modular squaring:

```
x[next] = x*x mod 3409933
K(x) = x mod 29
```

The writer supplies the factors and GP29 rune alphabet, but **does not supply this recurrence, seed clock, state reset or interpretation as a key**. This is a finite challenge, not recovered instructions. Because the modulus is only 3,409,933, the source-original test can propagate **every possible state** instead of choosing appealing key seeds. This differs from the previously tested [2014 RSA-432-modulus fixed-seed squaring](rsa2014-modular-squaring-original-inverse.md) and [2013 three-prime / 612-state BBS route](lp2-p57-prime-triplet-bbs-original-gate.md).

The historically demonstrated [solved p56 GP29 cipher](../results/README.md) treats plaintext F (index zero) as a literal ciphertext F, consuming no key. Its exact interruption rule is one particularly discriminating hypothetical consumer for the two source-printed primes. Test **two** input registers: (a) direct ciphertext C_i and (b) a cumulative-feedback register D_i=(C_i−C_(i−1)) mod29, leaving the first original rune C_0 as an untouched IV. Each register uses both directions of the GP29 key, giving four frozen models. The second register is motivated by the rare original adjacent-equal runes, without claiming that simple cumulative feedback explains their distribution.

## Exact all-initial-state inverse

Define an active set of **all 3,409,933** candidate states before the first cipher symbol. For each observed register symbol q and each active state x, let k=±(x mod29) mod29. Retain both algebraically legitimate branches:

* If **q=0**, a transparent plaintext F is possible. Output F and retain the same state x without consuming a key.
* If **q≠k**, an ordinary non-F plaintext p=(q−k) mod29 is possible. Advance state to (x² mod N).
* If **q=k≠0**, ordinary encryption would imply plaintext F, contrary to the mandatory historical bypass rule. Reject that branch.
* If **q=k=0**, only the transparent branch can emit cipher zero; the ordinary branch would again imply forbidden plaintext F.

The last two cases are already implemented by the single condition `q !== k` before any ordinary state advance. Deduplicate active states after every rune using integer-index stamp arrays. Every possible initial seed and every possible F-skip history is retained. **There is no language scoring, free seed, ciphertext-fitted phase or reset.** The source contains 12,956 original runes; the direct register processes all 12,956 and the differential register processes the 12,955 actual transitions.

| Frozen source register | Key direction | Last rune position with any nonzero state | First rune position with only x=0 | Surviving end state |
| --- | --- | ---: | ---: | ---: |
| Difference D_i | + | **427** | **428** | {0} |
| Difference D_i | − | **364** | **365** | {0} |
| Direct C_i | + | **785** | **786** | {0} |
| Direct C_i | − | **967** | **968** | {0} |

Positions are zero-based indices in original concatenated pp0–55. The state set at these exact original positions has cardinality one and contains **only zero**. Continuing every model through the last original rune retains that same singleton. As a sanity check on exact breadth, the difference/+ model's active counts after original indices 1,2,20,40,80,160,320 are **853567, 213934, 58951, 29411, 7156, 864, 5** respectively; all are calculated from untouched original source symbols.

Since N is the product of two *distinct primes*, x²≡0 (mod N) implies x≡0 (mod N). Skipping an F never changes x. Therefore the surviving terminal x=0 path comes **only** from the original seed x=0, and no nonzero initial seed can survive under any of the four declared models. A nonzero-key original implementation under these rules is algebraically impossible, independent of natural-language frequency.

The zero-key model is degenerate: direct decoding leaves the exact source unchanged (whole-book GP IoC **0.0344783978645**). Differential decoding yields the original GP29 first-difference stream (IoC **0.0353246147771**). That latter interpretation is already separately disfavoured as an English-register cumulative substitution in the more general [zero-symbol original gate](lp2-cumulative-difference-zero-symbol-gate.md). Neither zero-key output supplies coherent unknown LP2 prose.

## Fully independent unknown seed at every original visual chapter

The source's nine red-heading/large-mark chapters are a plausible alternative to a continuous book clock. Grant **all 3,409,933 hidden initial states anew** at every one of those nine original boundaries, not a guessed seed or fitted phase. The chapter-local difference mode keeps its first original rune as IV. Original rune boundaries are `0,729,1874,3603,5506,6527,7960,9640,12648,12956`.

| Original chapter | Original runes | Difference + states at end | Difference − | Direct + | Direct − |
| --- | ---: | ---: | ---: | ---: | ---: |
| pp0–2 | 729 | **1 (zero)** | **1 (zero)** | 17 | 17 |
| pp3–7 | 1,145 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp8–14 | 1,729 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp15–22 | 1,903 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp23–26 | 1,021 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp27–32 | 1,433 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp33–39 | 1,680 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp40–53 | 3,008 | **1 (zero)** | **1 (zero)** | **1 (zero)** | **1 (zero)** |
| pp54–55 | 308 | 26 | 18 | 93 | 91 |

The exact singleton state is verified as **zero**, not merely one numerically unidentified key. The alternative with fresh, arbitrary independent secret seeds therefore still cannot supply a nonzero GP29 squaring pad on **eight of nine** actual visual chapters for the two difference modes, or **seven of nine** for the direct modes. The residual 17/26/18/93/91 state sets in short chapters are genuine feasible *intermediate states*, not authenticated originating seeds or plaintext. Their existence does not rescue the failed long chapters.

This is an additional original-source exclusion in the same four strict-F architectures. It costs no English assumptions and no starting-key search; it does not exclude a changing modulus, a different state-update law or some entirely different source-selected per-chapter cipher.

## Blind original p55 continuation from a p54-selected state

The only full original visual chapter shorter than the 786–968-rune direct seed-elimination distances is **p54–55, 308 runes**. Its all-state terminal sets therefore contain 18–93 residual states per model. This permits one actual original-source *plaintext attempt*, distinct from counting states: freeze the transition family above, fit the **best remaining state after p54's 232 original runes alone**, then **carry that single state into uninspected p55's 76 original runes**. Do not refit the state, seed, cipher direction or model on p55.

Use an independent GP29 unigram prior from the already solved LP1 translation resource, a fixed **2,162-character native-GP sample with 29 Laplace pseudocounts**. A max-log-likelihood Viterbi over **all initial states** and **all F-skip paths** on p54 yields the following four selected boundary states:

| Declared model | p54 Viterbi-selected state | p54 end states feasible | Training score, nats/rune | p55 fixed-state feasibility | p55 score, nats/rune |
| --- | ---: | ---: | ---: | --- | ---: |
| Difference + | 3116091 | 105 | −3.96117 | **impossible** | — |
| Difference − | **461832** | 123 | **−3.86635** | 1 terminal state | **−4.04924** |
| Direct + | 3382427 | 238 | −3.89158 | **impossible** | — |
| Direct − | 2377539 | 223 | −3.87233 | **impossible** | — |

The p54 *best training score* itself selects the negative-difference model before revealing p55. Three of four frozen p54 winners cannot even emit the original 76-runic p55 continuation under mandatory F bypass. The remaining one yields a 76-rune candidate with GP29 IoC **0.03263158** and first transliterated runes **`TH EO TH TH U M R C Y L N P B X E D...`**. It has no coherent contiguous English text. Under the *same* independently solved LP1 unigram prior, the real untouched **95-rune solved p57** scores **−2.89960 nats/rune**, whereas that p55 candidate scores **−4.04924**. The raw p55 ciphertext itself scores **−4.17666** under the same reference. This is a substantial heldout native-language failure rather than authentic plaintext.

**Blind native-GP positive:** Before evaluating any original p55 label, repeat the independently solved p57 95-rune cleartext to supply 308 genuine GP29-language positions. Encrypt it under exactly the declared strict-F generator, hidden seed **3299**, once for each register/sign. The same all-3,409,933-state p54 Viterbi, knowing no seed, independently chooses the **true p54→p55 boundary state all four times**: **2122059** for both difference modes and **749212** for both direct modes. The frozen key then admits the complete 76-rune planted p55 continuation in every case. This positive establishes actual selector power on native-GP encrypted text, beyond algebraic state existence; the original p55 failure remains substantive under the declared model. All four positive controls are asserted in the same heldout SFT.

The result does **not** exclude every conceivable nonzero state on p54–55: it checks the **single state selected by p54 alone** in each exact model and uses an unambiguous, source-independent scoring prior. Different source-derived initial-state selectors, non-GP output registers or different cipher rules are outside the test. Source-original methods and all four frozen scores are asserted by [the separate standalone p54/p55 heldout SFT](../sims/lp2_1033_3301_p54_holdout_sft.cjs). This stops a retrospective p55-only model search from being mistaken for decryption.

## Independent positive and scope

The [single runnable CommonJS test](../sims/lp2_1033_3301_allseed_square_sft.cjs) asserts original source dimensions, exact original elimination coordinates, squarefree integer arithmetic, all final singleton states, and the two zero-key IoCs. It additionally checks the complete **36 source-chapter model invocations** with the frozen nine original boundaries and exact survivor counts. It then encrypts **190 genuine independently clear GP29 p57 runes**, namely twice the complete p57 plaintext, under a previously hidden **nonzero initial seed 3299**, for **each** source register and both signs. The same all-seed propagation retains the exact planted final state **1032729** in every case (direct plaintext190 symbols, differential with one explicit IV191 cipher runes). This confirms that the four branch machines can recognize truly generated nonzero-state ciphertext when it exists.

**Decision:** retire direct and cumulative-difference GP29 additive modular-squaring keystreams from **the exact original 1033×3301 modulus** under a continuous book clock, mandatory transparent-F bypass and any unknown initial state. Alternative state projections, different power recurrences, per-page resets, binary encodings, extra layers and the actual intended role of the two printed numbers are outside this theorem. Since the source never authorizes modular squaring, a new branch needs a *different independently visible instruction* with a causal path to plaintext; do not extend this result into untethered generator searches.

**Reproduce:** `node sims/lp2_1033_3301_allseed_square_sft.cjs` from repo root with Node22. No dependencies beyond the standard library, no file writes. Original input [LP2 canonical corpus](../resources/liber-primus/lp2-corpus.json); original number source [p33–39 cuneiform](issue344-cuneiform-historical-template-gate.md).
