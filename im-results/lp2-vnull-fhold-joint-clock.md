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

[Reusable Node/CommonJS SFT](../sims/lp2_vnull_fhold_joint_clock_sft.cjs) · [Complete hybrid raw output](lp2-vnull-fhold-joint-clock-output.json). Executed directly in connected V8 on exact repository inputs; standalone Node wrapper not separately run. Seed 0x47f0a11. Input blob SHAs recorded in the raw summary. The positive control recovery is not yet adequate for full blind positional decoding. The exact posterior and blind key extensions below improve the instrument and test additional original routes, without identifying an authentic key.

## Character posterior and exact legal-path MBR

The [character posterior receiver](../sims/lp2_vnull_fhold_character_mbr_sft.cjs) augments the original 4-gram state with emitted plaintext length, computes exact forward/backward marginals, and then maximizes expected positional matches over legal hybrid paths. It discards only event states unable to reach the final ciphertext boundary. It agrees with the MAP implementation's marginal evidence on every plant. The same key is provided to both receivers; the fixed-length mode also receives the true 240-rune plaintext length and is an oracle arm, not an original-input attack.

| Calibration | MAP ≥.85 / exact | Blind MBR ≥.85 / exact | Fixed-length MBR ≥.85 / exact | MAP / blind / fixed mean position |
|---|---|---|---|---|
| 60 development | 35 / 28 | 35 / 27 | 45 / 41 | .7456 / .7532 / .8995 |
| 40 independent-seed holdout | 26 / 18 | 27 / 17 | 33 / 30 | .7790 / .8161 / .9328 |

Development regenerates seed 0x47f0a11 without the initial p56 encoder's RNG draws and therefore is not the identical earlier 60-plant set. The holdout seed is 0x47a91c2; half the donors are native solved sections (potentially overlapping) and half are Orthodox prayers, excluded from 4-gram training. Nine of 100 independently random wrong keys have complete paths; the best wrong language log evidence per ciphertext rune is −5.6414 versus weakest true −2.3649. The exact contextual lexical extension [experimental code](../sims/lp2_vnull_fhold_lexical_posterior_sft.cjs) exceeded the connected tool's runtime limit both at 60 and five controls; no accuracy claim is made for it. Character MBR improves mean position modestly but does not solve blind alignment reliably. [All paired results](lp2-vnull-fhold-character-mbr-output.json).

## Source-fixed original key transfers

The hybrid is meaningfully distinct from the previous no-null F-bypass tests. Freeze the original red p0 title in printed order on the 716-rune black opening; the literal p15 red-center clockwise 16-cell sequence on the continuous 1,883-rune black p15–22 unit; the sixteen paired Fibonacci prime origins on p16–31; the sixteen decimated prime lanes on p16–22; and the earlier LP1 keywords WELCOME, DIUINITY and FIRFUMFERENFE on the two black units. Both additive signs, phase zero, no fitted origins or resets beyond these source-defined cases. **0/80** complete original paths; **80/80** full-length native-text plants remain feasible. The strongest proportional original prefix is 205/260 on p18 paired-prime sign −1; the p0 WELCOME sign +1 prefix is 362/716. Thus null insertion does not rescue these fixed source transfers. [SFT](../sims/lp2_vnull_fhold_source_key_sft.cjs) · [raw](lp2-vnull-fhold-source-key-output.json). Earlier source definitions: [p0 title](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md), [p15 literal spiral](lp2-p15-spiral-authentic-finterrupter-fixed-clock-original-gate.md), [paired origins](lp2-p15-16prime-pagekey-original-gate.md), [decimated lanes](lp2-p15-decimated-prime-clock.md).

## Blind shared period-eight key recovery at the paired scroll rubrics

This extends [the no-null #2522 gate](lp2-scroll-joint-fhold-period8-original-gate.md), using identical original p3/p6 red-bracketed offsets, 690/308 rune passages and first complete groups up to 140 cipher runes. Grant all null placements within each F-free anchor of length 8–10, including a null at its first symbol if there is a preceding ciphertext symbol. Every anchor ciphertext position consumes a key digit; each null fixes its proposed cipher to the preceding observed symbol and shares the pending plaintext with the next genuine event. For each non-F dictionary word of length 1..anchor width, every legal null/real partition ending in a genuine event, and every preceding F-hold count 0..preceding ciphertext-zero count, derive the exact period-eight key (reject inconsistent repeated phases). The anchor must be one original plaintext word; printed group boundaries at that anchor must be genuine, and its native form must occur in the finite TextBlob plus known-native dictionary. The key search assumes independent phase-zero starts at the two rubrics, as in #2522. Subsequent 4-gram scoring does not require intact boundaries.

The original anchors at offsets 76 and 30 have widths eight, with three and zero preceding cipher zeros. The relaxed hybrid anchor sets contain **768,116** and **320,278** distinct keys; their intersection contains exactly **one**. It has no complete legal inverse of both training prefixes even without any language threshold. No original heldout plaintext can be produced by the conditional family. In four eligible native-text pairs with a hidden shared [6,18,1,17,9,22,3,12] period-eight key, the exact intersection includes that key and training-only language evidence ranks it first in **4/4**. Both full passages decode exactly in one pair; the shared WARNING passage is exact in all four, and the remaining three passages have edit distances 1, 3, 2. This is genuine planted blind key recovery, not full positional recovery; the four pairs share one donor and key. One native section has no eligible anchor. [SFT](../sims/lp2_scroll_vnull_fhold_joint_period8_sft.cjs) · [all data](lp2-scroll-vnull-fhold-joint-period8-output.json).

The shared rubric-period-eight model is rejected under its explicit anchor and framing conditions. This does not exclude arbitrary keys, nulls spanning false printed word divisions, or other clocks. All new experiment cores ran on fetched repository blobs in connected V8. Standalone Node/Windows CI was not run.
