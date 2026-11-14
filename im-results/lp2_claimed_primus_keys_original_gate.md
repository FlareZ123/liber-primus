# Original-source test of two advertised LP2 repeating-key plaintext claims

**14 November 2026, Agent22. Classification: exact falsification of two complete-page periodic-key readings and their p56-style transparent-F extensions.** The claims' initial English phrases are real outputs of the supplied keys on authentic original ciphertext, but cease at the first full key cycle. **No previously unknown Liber Primus plaintext, independent creator key, original cipher or destination is recovered.**

## Why examine this particular positive claim?

The public [Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/bf89d3d13aad2b8f2c95ab195cf1b092f250775c/MASTER_TRACKER.md), in its 12 October 2026 snapshot, presents the following as "confirmed" full keys and partial plaintext:

- Physical LP2 **p18**, 260 GP runes: a 53-rune period with `P[i]=(C[i]-K[i mod 53]) mod29`, beginning `BEING OF ALL I WILL ASC THE OATH...` (source spelling also claims ASK/ABOVE).
- Physical LP2 **p19**, 271 GP runes: a 47-rune period with `P[i]=(C[i]+K[i mod 47]) mod29`, beginning `REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR...`.

This external repository has also withdrawn other older solve claims after page-alignment corrections; see the existing [bounded public audit](../workplace/lp2-independent-public-positive-claim-audit.md). The present test asks a narrower decisive cryptanalytic question that earlier high-level auditing did not numerically record: **do the exact advertised periodic keys decrypt the full unmodified original pages, with the known F-interruption ambiguity exhausted?** The exact key arrays are committed verbatim in the reproducer.

## Exact direct inverse on original rune indices

Read physical pages **18 and 19** of [the canonical original GP29 numeric corpus](../resources/liber-primus/lp2-corpus.json), not a page file from the third-party workspace. Retain every rune, printed ordering, and the key's proposed sign and zero phase, with no fitting.

| Original page | Original length | Advertised key period | First-period output | Decrypted IoC beyond first period | Decrypted complete-page IoC |
|---|---:|---:|---|---:|---:|
| p18 | **260** | 53 | `BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY` | **0.036536748** (207 runes) | **0.038164538** |
| p19 | **271** | 47 | `REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEORHEER` | **0.034513133** (224 runes) | **0.034249009** |

The first-period phrases match the published claim exactly. However, a repeating key is tested on **subsequent cycles**, where its symbols reappear and constrain an independently unseen ciphertext segment. On p18 the second period instead reads

`IAROEAEFPEOIETHIACAYEHRNMYHIAWOEBXCEAJOEBTAYFHAIWTHUTTHSASUAPRGAC`.

On p19 the second period reads

`NEEOGIAYEOCOEWTHCIRRMGUGNGJXJOAEGEOOHTHEEAEEAJOEAFATIIBTMP`.

Neither is readable GP-native English in the original printed shape. The 95 authentic cleartext GP runes on physical p57 have an IoC of **0.062709966**; the two long remaining decoded intervals stay close to the GP29 uniform baseline **1/29 ≈ 0.03448**. The p18 and p19 raw full-page IoCs are **0.034006534** and **0.034385677**, respectively. These figures are finite page-specific diagnostics, without a probabilistic claim about all possible historical plaintext languages.

**The first period is mathematically unfalsifiable by itself.** For any arbitrarily chosen GP29 target string `T[0..k-1]` and source ciphertext `C[0..k-1]`, the key `K[i]=(C[i]-T[i]) mod29` for subtraction, or `K[i]=(T[i]-C[i]) mod29` for addition, forces those first `k` symbols to decode to `T`. Thus a 53-rune first-period English sentence and a 47-rune first-period English sentence can be *specified by the key itself*, with no independent plaintext recovery unless the subsequent source positions or a separate key derivation corroborate them. The complete-page continuation supplies that missing check and fails.

## Exact F-interruption alternative: all masks, no successful original inverse

Known solved LP2 p56 uses a **literal plaintext F** bypass: plaintext F (GP index0) is transmitted as ciphertext F and **does not advance the key**. An ordinary non-F plaintext rune consumes the next key symbol. This known operation suggests an alternative that might rescue the published keys by slipping their clocks at ciphertext F sites. Test it under **every admissible choice**, with both signs retained:

- At any original ciphertext F, either output literal plaintext F without consuming the key, or decrypt a non-F with the current key and consume it.
- At any ciphertext non-F, consume the current key and require the decoded plaintext to be non-F, because an F plaintext cannot be emitted as non-F in this model.
- The possible consumed-key counts after each position are a finite state set. Update all states exactly; there is no selected F mask, language score, phase or resynchronization parameter.

The exact dynamic program proves:

| Page | First source offset where **all** F choices become impossible | Last previously feasible key clock | Original ciphertext rune index | Required key index at last state |
|---|---:|---:|---:|---:|
| p18 | **5** | 5 | **20** | **20** |
| p19 | **114** | 113 | **21** | **8** |

For p18, already at offset5 the proposed subtractive inverse yields plaintext zero (F) while the original ciphertext is index20 (L), impossible under the literal-F rule; no earlier F is available to change the clock. The p19 all-mask reachability set likewise becomes empty at offset114; the program explores every possible earlier F skip, and the last state would require `(21+8) mod29=0` at a non-F source glyph. **There is no complete-page solution under these exact keys for the p56 transparent-F period model, even allowing all F-site skip choices.**

This F exception test is **conditional**. A different historical cipher could encrypt F like an ordinary rune on unsolved pages. The separate first-period/continuation test rejects the literal **repeated-key Vigenère readings themselves** under ordinary GP-English expectations, without assuming the p56 mechanism transfers.

## Reproducer, actual execution and research decision

[Single-file CommonJS original-source SFT](../sims/lp2_claimed_primus_keys_original_sft.cjs) contains both complete published key arrays and their signs; loads the unchanged repo corpus; asserts exact first-period text; computes full and heldout IoCs; propagates all legal transparent-F states; and tests a planted 95-rune *genuine source-native p57 plaintext* under the same two periodic inverse algorithms. It performed the complete checks on **Windows/Node.js 22** in successful [Actions run 43610101025](https://github.com/FlareZ123/liber-primus/actions/runs/43610101025), printing both source-page outputs and final **PASS**. The separate code-mode computation with the same original corpus gave identical numbers before the SFT was committed. The source-native plant round-trips **95/95**, preventing a false negative from a wrong sign or incorrect key-index implementation.

**Decision:** Do not promote p18's `BEING OF ALL...` or p19's `REARRANGING THE PRIMES...` as genuine unknown Liber Primus plaintext, and do not use the latter's `DEOR` as an authenticated key selector for the following page. Both are exactly reproducible *crib-imposed first cycles* whose ordinary-period continuations remain nonlinguistic, and every source-p56-style F-interrupted continuation is impossible under the supplied keys. A real successor would need an **independently fixed** 53- or 47-symbol key-generation mechanism (or entirely new original cipher rule) that decodes an unseen source interval, or a source-authenticated plaintext witness independently supporting the phrase. The original manuscript remains unsolved.
