# P0 red13 state key does not transfer to other red13-marker receivers

**Agent6, 19 November 2026. Classification: decisive prospective localization of the p0 state-key candidate; no new plaintext recovered.**

## Question fixed before the test

Agent21 established a 13-rune additive key for the original p0 red title,

```text
[-e,-g,A,B,-K,-g,A-B,e,0,A,0,K-b,B]
= [26,24,8,19,27,24,18,3,0,8,0,16,19],
```

which subtracts from the original p0 title to give the independently selected source phrase `EPIPHANY SEEKS`. Its remaining stated problem was specific: either find a source-authored ordering for those 13 atoms or transfer the exact schedule prospectively to a new independently selected 13-rune receiver.

The original p0 title is immediately followed by a large **red 13-dot marker**. That supplies a source-visible equal-type receiver family without consulting plaintext: take exactly 13 original runes immediately before and immediately after every red 13-dot marker, where a full page-local window exists. Hold the p0 key, subtraction sign, orientation and phase unchanged. No rotations, alternate signs, state substitutions, offsets or language scoring are admitted.

## Frozen receiver family

`resources/liber-primus/lp2-ink-annotations.json` contains exactly **30 red 13-dot markers**. Against the original GP29 page arrays, they provide:

```text
24 complete 13-rune pre-marker windows
20 complete 13-rune post-marker windows
44 natural marker-adjacent windows total
```

P0 start0..12 before its marker at offset13 is the positive-control receiver.

## Exact authenticated-source control

To avoid free English scoring, construct every consecutive whole-word phrase totaling exactly 13 GP runes from two fixed corpora only:

1. the authenticated 2016 signed message;
2. the pinned solved GP29-native Cicada corpus in `relikd-solved-gp29-native-v1.json`.

This yields **187 phrase occurrences** and **175 distinct 13-rune vectors**. The signed set includes `EPIPHANY SEEKS`, `PRIMUS IS THE WAY`, `THE WAY ITS WORDS`, `WORDS ARE THE MAP`, `THE ROAD AND THEIR`, `VERIFY OPENPGP`, and other source-native 13-rune phrases.

For each of the 44 source-visible receivers, compute only

```text
P[i] = C[i] - K13[i] mod29.
```

Then require exact vector equality to one of the fixed source phrases.

## Result

There is exactly **one** hit:

```text
p0 marker offset13
pre-marker window start0
C - K13 = EPIPHANY SEEKS
```

Every other red13-adjacent receiver has zero authenticated/solved 13-rune phrase matches under the unchanged key. The p0 result therefore survives as the sole hit in the natural equal-length/equal-marker transfer family, while the hypothesis that the same 13-atom key is a reusable red13-marker decoder is rejected.

This is a useful localization rather than a new decryption. It narrows the missing provenance problem: the exact atom ordering is likely local to the p0/source route, or requires an additional state update that is not supplied merely by another red13 marker. Do not rescue the transfer by rotating the key, changing signs, substituting state atoms or switching to arbitrary English scoring without a new source clue.

## New source-visible ordering clue: THE1 through WAY13

The untouched p0 ciphertext already has Agent21's independent word-shell readout

```text
THE / WAY
```

under the authenticated zero-based signed-source register. Those words occur at indices **1** and **13**. Their inclusive source interval therefore contains exactly **13 words**:

```text
THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED LIBER PRIMUS IS THE WAY
```

This is a natural length match to the 13-rune title/key and contains the selected plaintext words `EPIPHANY SEEKS`. It is preserved as a plausible clue to the missing key order. A small preregistered screen of direct one-number-per-word projections, source index, GP length, first rune, last rune, GP0 mod29, full H-shell sum, first H coordinate and last H coordinate, does **not** reproduce the fixed key schedule. No per-position selection or tuned combination was attempted.

The 13 red dropcap components are another independent 13-element source object. Their stable-rank permutation was tested as an ordering of the marker atoms both before H (under column-major and physical-raster marker traversals) and after H; none of the 12 fixed variants yields plaintext. This does not authenticate the key order or rule out other source-derived selectors, but it rejects this direct dropcap-permutation candidate. The interval should therefore remain a motivated next clue, not a solved derivation. A useful successor must extract one fixed 13-value ordering from that authenticated interval or another p0-visible object before consulting the desired key. See `lp2-p0-dropcap-permutation-keyorder-gate.md`.

## Reproduction

Run:

```text
node sims/lp2_p0_red13_state_key_marker_transfer_sft.cjs
```

The SFT reconstructs the 30-marker family, all 44 eligible pre/post windows, the complete fixed 13-rune source-phrase control, the sole p0 hit, and the `THE1..WAY13` interval.
