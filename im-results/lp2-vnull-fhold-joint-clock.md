# Joint collision-null and literal-F clock: exact original-input inverse

## Decision

The direct ordinary-consuming V-NULL page-reset prime-minus-one receiver gives no coherent original candidate. More importantly, a distinct exact inverse now combines the externally proposed V-NULL collision-retry/null mechanism with Cicada's authentic nonconsuming plaintext-F convention. It rejects 105/110 original page-reset prime-key/sign configurations on exact event feasibility alone; the five survivors have strongly negative language Bayes factors. The hybrid is exploratory and not an established LP2 mechanism. No unknown plaintext or key is recovered.

The prior ordinary V-NULL receiver in [the event-DAG report](lp2-vnull-exact-event-dag.md) assumes that every ciphertext glyph advances the key. That assumption is false for the historically authenticated plaintext-F holds. This instrument eliminates the need to guess the two types of exceptional event.

## Exact sender and inverse

Use the native GP29 ordinal alphabet, with F=0. The underlying key is a known sequence K. At ciphertext position i and consuming-key position j:
- Plaintext F emits 0 directly, without consuming K or undergoing collision rejection.
- Every nonzero plaintext p proposes c=(p+K[j]) mod29, consuming one key digit.
- If c equals the preceding ciphertext rune, reject with probability s=1-.664/3.448 and emit one uniformly chosen nonrepeat null, retaining the same p for the next proposal. Otherwise emit c and advance plaintext.

For each state (i,j), an authentic F edge exists exactly if C[i]=0. A consuming genuine edge has p=C[i]-K[j] mod29 and is allowed only for p!=0. A null chain forces p=C[i-1]-K[j] mod29 !=0 and must emit different ciphertext; every subsequent proposal either equals the preceding ciphertext (another null) or equals the observed output (termination). These edges exhaust the fixed sender's possible events, including consecutive nulls. Their weights are exact log sender probabilities, with log(1-s) on an accepted doublet and log(s/28) per null. Each edge emits exactly one plaintext rune. It is not a deterministic bijection: the actual null choices are preserved in the recovered event witness.

The forward DP augments (i,j) with the last three emitted plaintext rune indices, summing all paths and retaining an independent exact MAP backpointer. A parallel uniform GP29 plaintext prior on the same event graph supplies an evidence denominator. The Bayes factor per ciphertext rune is (log Z_language-log Z_uniform)/n. The evidence is for observing the given finite output ending at an event boundary under indefinite generation; no known original plaintext length is assumed. The frozen interpolated 1–4-gram model trains on the first 70% of three existing literary sequences, with context prior masses 8,16,32. The returned event path is replayed against the original input. No printed word boundaries are required.

## Calibration and actual original results

The authentic p56 sender regression disables rejection (s=0), encodes the 85 known source runes with the original successive-prime-minus-one key, and matches all 85 original ciphertext runes with one F hold and 84 consuming digits. The inverse also returns all 85 authentic plaintext runes.

The hybrid positive controls use 60 deterministic 240-rune windows, 30 from exact native solved sections and 30 from held-out literary regions, cycling through random keys, zero-origin prime-minus-one, WELCOME, DIUINITY and FIRFUMFERENFE (12 each). The key family and truth are withheld from the inverse except for the supplied candidate key. All true keys retain a complete exact event path; 26/60 MAP outputs are exact and 34/60 reach .85 positional recovery. Mean edit distance .8167 indicates that a few unresolved null choices cause substantial positional shifts. Wrong keys are independent random key streams: only 3/60 have any complete event path, with best feasible wrong log BF/rune -2.530778. The weakest true BF is +.848013. Controls can overlap and are not a sealed external benchmark.

| Key family | Exact MAP /12 | Positional >=.85 /12 | Actual F holds | Actual nulls |
|---|---:|---:|---:|---:|
| Random | 5 | 6 | 65 | 69 |
| Prime-minus-one | 7 | 9 | 35 | 87 |
| WELCOME | 5 | 8 | 53 | 85 |
| DIUINITY | 3 | 5 | 46 | 92 |
| FIRFUMFERENFE | 6 | 6 | 59 | 86 |

Original: all 55 rune-bearing physical pages p0–55, independently reset to prime index1, both arithmetic signs, every valid F/null history. 5/110 complete inverse paths exist at the configuration level (not necessarily unique paths). Best feasible original BF is -2.603263 on p49 with positive key sign, well below the minimum true BF and inside the negative range. It yields 66 nonprose output runes, two F holds and no nulls. Other survivors are recorded in the JSON. No original key or plaintext is authenticated. This only rejects the exact independently page-reset zero-origin prime receiver; it is not an exclusion of the hybrid with arbitrary keys, origins, or different state conventions.

The direct ordinary V-NULL page-reset zero-origin prime test also gives all 110 feasible configurations but best contextual lexical evidence -5.929715 nats/ciphertext rune; no coherent passage. This is a different likelihood scale from the hybrid BF and should not be directly compared.

[Reusable Node/CommonJS SFT](../sims/lp2_vnull_fhold_joint_clock_sft.cjs) · [Complete hybrid raw output](lp2-vnull-fhold-joint-clock-output.json). Executed directly in connected V8 on exact repository inputs; standalone Node wrapper not separately run. Seed 0x47f0a11. Input blob SHAs recorded in the raw summary. The positive control recovery is not yet adequate for full blind positional decoding; improve lexical/posterior alignment before relying on MAP for authentic plaintext recovery. An independently selected original key remains the missing prerequisite.
