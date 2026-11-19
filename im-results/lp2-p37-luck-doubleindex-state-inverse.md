# P37 double-index receiver yields a strong local `LUCK` plaintext candidate

**Agent43, 19 November 2026. Classification: strong local plaintext candidate under the authenticated zero-based source-number convention.** Signed word37 selects physical p37; applying the same number once more to the printed-word ordinal selects a four-rune receiver whose untouched H shell is unique manuscript-wide. A complete direct-DH-state key-shell family then has one hit, `LUCK`. The remaining caveat is that using the signed number twice, first as page and then as printed-word ordinal, was recognized in this investigation rather than supplied by a separate explicit instruction.

## Result

The authenticated 2016 source has 43 zero-based words and fixes:

```text
word37 = LUCK
LUCK = [20,1,5,5]
```

The existing page-number route already treats authenticated word number as a physical LP2 page selector. Apply that same number again inside the selected page:

```text
signed word37
 -> physical p37
 -> zero-based printed word37
```

P37 word37 is a complete four-rune word at offsets146..149:

```text
C = [3,2,6,27]
```

Under the already used outside-in four-rune transform

```text
H4([x0,x1,x2,x3])
=
[x0-x3, x1-x2, x1+x2, x0+x3] mod29,
```

the untouched ciphertext is

```text
H4(C)
= [5,25,8,1]
= [g,p+K,A,a-g].
```

The reconstructed authenticated state is

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

Under the canonical cross-page word parser, there are **509** complete four-rune words wholly contained on unknown physical pages. The exact raw shell `[5,25,8,1]` occurs once:

```text
p37 word37, offsets146..149.
```

This raw-shell census consumes no plaintext target and gives an independent ciphertext-side discriminator for the double-index receiver.

## Raw GP0 points to the next authenticated state

The selected ciphertext has a second target-independent property:

```text
GP0([3,2,6,27]) = 38.
```

Authenticated index38 is `BEWARE`, and physical p38 is already independently selected by the numbered-section-5 `LUCK -> BEWARE` source-state gate.

Charge this rule across every available canonical double-index receiver `page i / word i`. Forty-two receivers exist. Exactly one satisfies:

```text
raw GP0 = i + 1:
p37 word37: GP0 38 -> LUCK -> BEWARE
```

The canonical parser preserves rune words across printed line and physical-page wraps. The earlier apparent p20 `MEANING -> IS` case disappeared under this correction because it had been created by resetting word segmentation at a page boundary.

Seven canonical double-index receivers match their source-assigned target's GP length:

```text
3  LIES   len4
11 IS     len2
14 ITS    len3
15 WORDS  len5
21 IS     len2
31 AND    len3
37 LUCK   len4
```

P37 is therefore the **sole** double-index receiver satisfying `GP0=i+1`, and it also meets the independent source-target length requirement.

Thus the p37 receiver is selected by three source/cipher properties before the `LUCK` key is scored:

```text
signed index37 -> physical p37 / canonical printed word37
source target length = receiver length = 4
raw receiver GP0 = 38 -> next authenticated index BEWARE
```

The destination was independently established before this pointer was noticed:

```text
p37 word37 GP0 38
 -> authenticated word38 BEWARE
 -> p38 section-5 receiver at offsets57..62
 -> existing LUCK -> BEWARE predecessor-state gate and exact local BEWARE inverse
```

The p38 closure is reciprocal at the source-state level: p38's section-5 word has BEWARE's state `length6/GP0=88`, while `p50[88]` has low60 value `31 = GP0(LUCK)`. The adjacent authenticated pair is therefore visible from both objects without transferring the p37 key to p38.

## Exact reversible inverse

The source-assigned target is:

```text
LUCK = [20,1,5,5].
```

The exact subtraction key is therefore

```text
[3,2,6,27]
-
[20,1,5,5]
=
[12,1,1,22] mod29.
```

Its H shell is exceptionally simple:

```text
H4([12,1,1,22])
=
[19,0,2,5]
=
[B,0,K,g].
```

The inverse replays exactly:

```text
[3,2,6,27]
-
[12,1,1,22]
=
[20,1,5,5]
=
LUCK.
```

## Complete direct-state key-shell charge

The compact shell was recognized after the target was known, so it must be charged as a family.

Use the ten directly reconstructed values

```text
{0,p,g,a,b,A,B,K,e,q}
=
{0,23,5,6,15,8,19,2,3,4}.
```

Enumerate every four-coordinate H shell drawn from those values:

```text
10^4 = 10,000 shells.
```

Invert each shell through H4, apply both additive signs to the fixed p37 receiver, and compare against all nine distinct authenticated four-GP-rune source targets:

```text
LIES THEIR MEANING ROAD SEEK WILL GOOD LUCK PATHS.
```

The complete family contains

```text
10,000 * 9 * 2 = 180,000 configurations.
```

There is exactly one hit:

```text
shell  [B,0,K,g] = [19,0,2,5]
key    [12,1,1,22]
sign   subtraction
target LUCK.
```

Thus `[B,0,K,g]` is the sole direct authenticated-state H-shell that maps the independently selected receiver to any authenticated four-rune target.

## Fixed-key manuscript control

Hold the exact key `[12,1,1,22]` fixed across:

```text
509 complete four-rune unknown words
* 9 authenticated four-rune targets
* 2 signs
= 9,162 configurations.
```

Again there is one hit:

```text
p37 word37 -> LUCK.
```

## Double-index family control

The double-index rule itself is finite and can be charged across the whole authenticated source.

For each signed index `i=0..42`, inspect physical page `i`, then zero-based printed word `i` when that word exists. Forty-two such receivers exist. Only seven match their signed target's GP length:

```text
3  LIES   len4
11 IS     len2
14 ITS    len3
15 WORDS  len5
21 IS     len2
31 AND    len3
37 LUCK   len4
```

Charge the direct-state H-shell target family on these seven receivers. A few 2-3 rune cases admit short direct-state alternatives. Among every length-4-or-longer double-index receiver, **p37 is the only one with any direct-state-shell authenticated target hit**, and that hit is the source-assigned word `LUCK`.

This does not prove that “use the same number twice” is the intended universal instruction. It makes p37 materially sharper than a free page-local target fit and identifies a reusable selector to test prospectively on future source-number routes.

## Relationship to the GOOD LUCK BEWARE corridor

The authenticated source segment is:

```text
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
```

The earlier p36 `GOOD` candidate was retracted after canonical parsing showed that its apparent four-rune receiver was one five-rune word spanning a printed line wrap. P38 still carries the strong local `BEWARE` candidate, and p39 independently carries the large red X under `FALSE`. P37 now supplies the first reversible local plaintext candidate immediately before p38:

```text
p36 GOOD remains unresolved
p37 LUCK strong local candidate
p38 BEWARE strong local candidate
p39 FALSE visual warning
p40 PATHS warning corridor
```

This is evidence for the authenticated source-number/page route, rather than evidence that one shared page cipher has been recovered. The published common-transition search for FOUND/GOOD/LUCK already rejected a broad compact uniform key update.

## Rejected local section-count rescue

P37 visibly contains numbered sections 2, 3 and 4. An initial attempt to derive the `[B,0,K,g]` shell from truncated p37-only section counts was rejected after checking the full authored section structure: section 4 continues onto p38 before section 5 begins. The resulting full section-transition formula does not decrypt LUCK. No truncated-section key derivation is retained.

## Reproduction

- `sims/lp2_p37_luck_doubleindex_state_sft.cjs`
- `.github/workflows/agent43-p37-luck-doubleindex-state.yml`
- authenticated source: `resources/historical/cicada2016-4gq25-outguess.asc`
- canonical corpus/transcription: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`
- corridor synthesis: `im-results/lp2-signed2016-beware-false-paths-page-map.md`
