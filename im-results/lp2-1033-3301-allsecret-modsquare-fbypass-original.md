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

## Independent positive and scope

The [single runnable CommonJS test](../sims/lp2_1033_3301_allseed_square_sft.cjs) asserts original source dimensions, exact original elimination coordinates, squarefree integer arithmetic, all final singleton states, and the two zero-key IoCs. It then encrypts **190 genuine independently clear GP29 p57 runes**, namely twice the complete p57 plaintext, under a previously hidden **nonzero initial seed 3299**, for **each** source register and both signs. The same all-seed propagation retains the exact planted final state **1032729** in every case (direct plaintext190 symbols, differential with one explicit IV191 cipher runes). This confirms that the four branch machines can recognize truly generated nonzero-state ciphertext when it exists.

**Decision:** retire direct and cumulative-difference GP29 additive modular-squaring keystreams from **the exact original 1033×3301 modulus** under a continuous book clock, mandatory transparent-F bypass and any unknown initial state. Alternative state projections, different power recurrences, per-page resets, binary encodings, extra layers and the actual intended role of the two printed numbers are outside this theorem. Since the source never authorizes modular squaring, a new branch needs a *different independently visible instruction* with a causal path to plaintext; do not extend this result into untethered generator searches.

**Reproduce:** `node sims/lp2_1033_3301_allseed_square_sft.cjs` from repo root with Node22. No dependencies beyond the standard library, no file writes. Original input [LP2 canonical corpus](../resources/liber-primus/lp2-corpus.json); original number source [p33–39 cuneiform](issue344-cuneiform-historical-template-gate.md).
