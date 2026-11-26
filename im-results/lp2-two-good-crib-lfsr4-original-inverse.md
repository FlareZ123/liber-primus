# Two-GOOD cross-object GF29 recurrence inverse

**Agent9, 26 November 2026 — conditional original-cipher negative, not a decryption.** All 707,281 four-tap homogeneous GF29 recurrences seeded by the p0 GOOD candidate were tested against the separately selected p2 GOOD candidate. Ordinary consumption leaves exactly one training-compatible recurrence; its 161-rune untouched continuation is nonprose. Native literal-F consumption leaves **zero** legal training histories. Neither result establishes or disproves the local GOOD candidates themselves.

## Hypothesis and exact input

The two local candidate inverse keys, their distinct upstream selectors, and an earlier failed page+2 transition are documented in [the p0→p2 GOOD packet](lp2-p0-p2-good-dh-transition-packet.md). They are unauthenticated; the shared running-key hypothesis is exploratory. The original p15 Fibonacci graphic motivates asking about recurrence complexity, but does not independently select this operation on p0–2.

Frozen before computation in [the attack contract](../workplace/agent9-two-good-crib-lfsr4-precommit.md), commit `2fa7b95a12d142d2d9bb757bc80c6df559bfb317`. The chapter is 729 original GP29 runes. Physical p0 offsets49–52 and p2 offsets36–39 correspond to global offsets49–52 and564–567. The separation is 515 runes. The second crib is entirely withheld from selecting the first seed, but is part of coefficient fitting; global offsets568–728 are the true continuation holdout.

| Object | Cipher | Assumed plaintext | Consuming shift |
|---|---|---|---|
| p0 | 24,21,26,14 | 6,3,3,23 | 18,18,23,20 |
| p2 | 1,2,8,26 | 6,3,3,23 | 24,28,5,3 |

For every tap vector in GF29^4, generate `K_i=a K_(i-1)+b K_(i-2)+c K_(i-3)+d K_(i-4)` modulo 29 from the four p0 seed shifts. No resets, phase changes, additional key information or plaintext assumptions between cribs. Lower-order homogeneous recurrences are included by zero-padding their taps. A constant-affine recurrence of order ≤3 also lies in this overfamily by taking the first difference of its recurrence equation.

Under ordinary consumption, require the four second-crib shifts at key offset515. Under literal-F hold, exactly 25 visible ciphertext zeroes intervene; therefore the second key offset must lie in [490,515]. For each matching four-shift occurrence, use an exact dynamic program with the next consuming-key index as state and integer path counts. At ciphertext zero, retain the literal-F hold branch; a consuming branch is allowed exactly when C≠K. At nonzero ciphertext, only the latter branch is possible. At both known GOOD spans, all four plaintext symbols are non-F and must consume. The F-hold gate includes every allowable zero history, not merely a greedy choice.

## Original result

| Receiver | Matching tap/gap pairs | Legal training states | Withheld continuation |
|---|---:|---:|---|
| Ordinary | 1 | 1 | 161 runes, IoC 0.03291925465838509; nonprose |
| Literal-F hold | 26 | 0 | none |

The unique ordinary taps are [2,6,16,26]. The held output starts `O B EO X C E TH L X AE X W L X T S H L U X OE S P EO T X H D EA AE OE E IA B AE E`. Full exact replay succeeds, as expected for a reversible additive map; it does not authenticate the inferred key. The observed language diagnostic is far below the held native control IoC .06972049689440994, and the full output has no sustained readable continuation. Do not label the tap vector as a recovered creator key.

## Independent implementation controls

Using genuine clear p57 GP29 material tiled to the same 680-rune observation geometry and placing GOOD in the same two crib slots, the receiver was not supplied the planted taps. The ordinary control recovers its unique true tap vector [3,8,14,19] and exact 161-rune native continuation (IoC .06972049689440994). The F-hold control recovers [2,5,11,21], true gap499, as the sole legal training/full tap-gap pair from 38 gap matches. It has 5,072,750 training histories and 273,928,500 complete legal histories, so plaintext uniqueness is emphatically **not** established by tap recovery. The controls are constructed plants, not new authentic LP2 plaintext.

## Research decision

Do not rescue this branch by adding taps or independently changing clock origins without new source evidence. The exact native-F result rejects a shared continuous homogeneous four-register key joining these two candidate cribs (and its embedded lower-order families), even with every latent F decision allowed. The ordinary receiver finds only a chance-compatible nonprose continuation. It does not exclude a different mechanism, different key law, or the two local GOOD plaintext conjectures. No change to the authoritative research frontier is warranted.

[Reproducer](../sims/lp2_two_good_crib_lfsr4_sft.cjs) · [Exact raw output](lp2-two-good-crib-lfsr4-output.json). Core executed on repository input in V8; Node CLI wrapper is preserved for reproduction, not independently executed on Windows. No CI run claimed.
