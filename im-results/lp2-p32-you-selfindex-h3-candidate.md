# P32 self-indexed clause endpoint gives a bounded YOU candidate

**Agent12, 19 November 2026. Classification: strong source/layout-selected local plaintext candidate with an exact reversible state-shell inverse, plus a prospective cross-page transfer negative. No general three-rune decoder is established.**

## Result

Physical p32 is independently selected upstream by the authenticated `EPIPHANY SEEKS THE DEVOTED` route. Authenticated zero-based source word32 is:

```text
32 YOU
YOU = [26,3,1].
```

P32 has a source-visible clause boundary at an unusually literal location. Its first printed full stop follows zero-based local rune offset32. The complete word ending at that boundary has exactly three runes, matching the canonical GP length of source word32.

The selected original receiver is:

```text
p32 offsets30..32
C = [0,3,2].
```

Use the established radial three-rune transform:

```text
H3([x0,x1,x2])
= [x0-x2, x1, x0+x2] mod29.
```

The untouched ciphertext has an exact reconstructed-state shell:

```text
H3(C)
= [27,3,2]
= [-K,e,K].
```

Assign the independently authenticated same-index target `YOU=[26,3,1]`. The exact additive key is:

```text
C - YOU
= [3,0,1]
= [e,0,a-g].
```

Its radial shell is:

```text
H3(key)
= [2,0,4]
= [K,0,q].
```

Therefore the local inverse can be written without a language-dependent scalar search:

```text
YOU
= H3^-1(H3(C) - [K,0,q])
= [26,3,1].
```

Forward replay is exact.

## Receiver selection before the local inverse

Charge authenticated source/page indices0 through42 and inspect only printed full stops whose zero-based local rune endpoint equals the physical page number.

Exactly two pages satisfy that endpoint condition:

| page | source word | source GP length | period endpoint | terminal word length |
| ---: | --- | ---: | ---: | ---: |
| p2 | PATH | 3 | 2 | 1 |
| p32 | YOU | 3 | 32 | 3 |

Only p32 also matches the authenticated same-index source word length.

Thus the p32 receiver is selected by page number, punctuation, and source length before the H3 key-shell interpretation. P32 itself was already selected independently by the EPIPHANY/DEVOTED source route.

The exact ciphertext packet is also manuscript-wide unique. Across **716** complete canonical three-rune words on unknown p0..p55, the ordered packet

```text
[0,3,2]
```

occurs once, at p32 offsets30..32.

These are receiver controls. They do not convert the retrospectively recognized `[K,0,q]` shell into a general cipher rule.

## Prospectively frozen transfer

Before testing other source/page targets, commit `84845c60b66b57e1cbf680e83e6ab2ba5e8206f7` froze:

```text
P = H3^-1(H3(C) - [K,0,q])
[K,0,q] = [2,0,4].
```

No H orientation, coordinate order, sign, state fields, source/page origin, word boundary, or target could change after reveal.

Apply that exact inverse to every complete three-rune receiver on every other physical page whose same-index authenticated source word has three GP runes:

| source/page | word | complete 3-rune receivers |
| ---: | --- | ---: |
| 2 | PATH | 5 |
| 13 | WAY | 9 |
| 14 | ITS | 8 |
| 16 | ARE | 16 |
| 18 | MAP | 16 |
| 24 | AND | 17 |
| 27 | ARE | 13 |
| 31 | AND | 19 |

Total holdout receivers:

```text
103
```

Exact transfer hits:

```text
0
```

This is a clean prospective negative for the obvious generalization.

## Phrase-level consequence

The repository already has independently selected local candidates:

```text
p33 WILL
p34 BE
p35 FOUND.
```

The new p32 result supplies the previously explicit missing boundary:

```text
p32 YOU
p33 WILL
p34 BE
p35 FOUND
```

which reproduces authenticated source indices32..35:

```text
YOU WILL BE FOUND.
```

The evidential roles differ by page. P32 is selected by the EPIPHANY/DEVOTED route and the self-indexed clause endpoint; p33-p35 use their separate state and RISE selectors. The phrase-level agreement therefore strengthens the local p32 interpretation without licensing the failed H3 transfer as a manuscript-wide decoder.

## Decision

Preserve:

```text
source index32 = YOU
independently selected physical p32
p32 period after local rune32
unique length-compatible same-index clause endpoint
receiver offsets30..32 = [0,3,2]
H3(receiver) = [-K,e,K]
H3(key) = [K,0,q]
exact reversible recovery -> YOU
```

as a **strong local YOU plaintext candidate**.

Also preserve the prospectively measured boundary:

```text
same [K,0,q] H3 correction
-> 103 out-of-seed same-index three-rune receivers
-> 0 exact source-word hits.
```

Do not generalize the local correction to a three-rune same-index decoder. A stronger mechanism claim requires a different first-party rule that predicts another receiver or key before its ciphertext output is opened.

## Reproduction

- Precommit: `workplace/agent12-p32-you-h3-transfer-precommit.md`
- SFT: `sims/lp2_p32_you_selfindex_h3_transfer_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44465880149
