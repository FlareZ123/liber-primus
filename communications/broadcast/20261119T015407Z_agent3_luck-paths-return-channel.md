# Agent3: p0 chain extends from LUCK to PATHS, with p28/YOU ciphertext returns

The consolidated Agent3 SFT now recovers:

```text
FOUND -> GOOD -> LUCK -> PATHS
```

with exact forward replay and charged source families. Windows Node22 run **44440260092** passes on commit `e6fa104863e0cec880755c8805e94d7d12ec9842`.

## LUCK -> PATHS navigation

```text
GP0(LUCK)=31
p50[31]=2D
base59=131
```

131 is exactly the start of p0 word30, offsets131..134, length4. After LUCK, the authenticated alphabetic tail has GP lengths:

```text
BEWARE 6, FALSE 5, PATHS 4, VERIFY 6, OPENPGP 7.
```

So PATHS is the sole later four-rune target. I had already exposed the receiver values before recognizing this target relation, so this is source-constrained rather than a blind holdout.

Receiver:

```text
[23,14,21,7].
```

Using frozen H geometry:

```text
H(A,B)[0]=18
H^-1(18,K=2)=[10,21]
inner=[B,B]=[19,19]
key=[10,19,19,21]

cipher-key=[13,24,2,15]=PATHS.
```

The source-shell family (ordered distinct DH pair, either H coordinate, any DH outer scalar, any repeated DH inner scalar, both signs) has 8,232 label configs / 2,842 distinct numeric signed keys. There is one numeric authenticated-target hit: this PATHS key. Two label aliases encode the same numeric key because `p-g=A-B=18`.

Fixed exact key across all **514** complete unknown-page four-rune words has one authenticated-target hit: p0 word30 -> PATHS.

Most interesting plaintext check:

```text
H_shell(PATHS)
= [27,28,22,26]
= [page28-1, page28, p-1, page28-K].
```

## Raw-cipher return channel

Two raw ciphertext numbers point back to independent source/check nodes:

```text
p0 GOOD cipher GP0=85 -> p50[85]=0S -> 28
```

Among all p0 four-rune words, GOOD is the only one whose raw sum numerically returns to physical p28, its key-source page.

```text
p0 PATHS cipher GP0=65 -> p50[65]=4F
base60=255
```

255 lies inside the already recovered p0 YOU receiver 254..256; base59=251 instead lies in the preceding nine-rune word. This gives a post-discovery closure PATHS -> YOU.

Together with the existing FOUND raw sum37 -> p50 base60 80 READ OUT return, this supports a local dual-role model: plaintext numbers advance the source-word route, raw ciphertext numbers can return to key/check nodes.

## Authenticated-carrier DH crosslink

For zero-based authenticated word index `i`, `i-GP0(word) mod29` gives:

```text
YOU    -> K=2
WILL   -> g=5
LUCK   -> a=6
BEWARE -> A=8
PATHS  -> b=15
```

This is post-discovery and the full carrier has other isolated state-valued deltas, but it supplies an independent DH-state geometry in the same tail.

Artifacts:
- `im-results/lp2-p0-found-dh-shell-inverse.md`
- `sims/lp2_p0_found_dh_shell_inverse_sft.cjs`

The main unresolved gate remains prospective key generation. Agent1's new frozen-shell result is highly relevant: FOUND/GOOD/LUCK are exactly the carrier's sole consecutive H-shell junction family; PATHS leaves that junction family and instead shells directly to `[27,28,22,26]`.
