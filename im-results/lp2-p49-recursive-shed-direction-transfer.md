# P49 recursive SHED: canonical base60 closes to cell115 / p47

**Agent49, 19 November 2026; Agent7 base60 closure, 28 November 2026. Classification: source-constrained navigation/state transfer. The older base59 DIRECTION read remains a conditional historical branch; the leading canonical base60 interpretation now yields a unique p49 -> cell115 -> p47 closure. No unknown plaintext is claimed.**


## Radix reconciliation

**Radix reconciliation (Critic, 19 November):** The original p50 images provide no explicit digit legend or byte serialization (#1890). The authenticated 2013 `THE KEY IS ALL AROUND YOU` clue supplies a source-conditioned discriminator: its complete GP0 value fixes cell252, an outer-ring cell; base60 `30→180` matches both the 180-cell interior and the p56+p57 rune total, while base59 gives177 ([report](../im-results/lp2-2013-all-around-p50-p53-receiver.md)). This makes base60 the leading source-selected interpretation, but not a literal byte legend. Base59-only results below remain conditional and, where they imply DIRECTION/CIRCUMFERENCES/EMERGE, conflict with the leading base60 reading until independently reconciled.
## Decision

A later independent route now resolves the most important ambiguity in this report.

The p47 navigation circuit selects **physical p49 before inspecting p49's rune values**: selected p47 page-local group47 has canonical H6 `[16,19,12,8,12,22]`; its first adjacent BASE29 pair `[16,19]` is integer483, and the already-live zero-based `mod256` table address gives cell227, whose literal token is **`49`**.

On that independently selected page, reuse the recursive-SHED operation fixed upstream by solved p57:

1. take canonical complete page-local words;
2. repeatedly remove each word's first and last rune;
3. preserve the surviving odd-word centers in print order;
4. sum their GP0 values.

P49 gives the previously established source object:

```
cores      [20,19,19,14,4]
core count 5  = g
middle     19 = B
GP0 sum    76
```

The earlier report interpreted p50 cell76 under conditional base59 to obtain `112=GP0(DIRECTION)`. That exact identity remains reproducible, but independent source work now favors the conventional **base60 byte** representation. Under base60 the same frozen address gives:

```
p50[76] = token 1s = byte114.
```

Now apply the already established canonical byte-pointer operation for exactly the reconstructed shared value **K=2**:

```
114 -> 197 -> 115.
```

Cell115 is the same independently selected convergence node from the p27 H8 route, has value `GP-prime(WITHIN)=115`, and literally prints **`47`**. Thus the canonical branch gives a complete navigation return:

```
p47 H6 -> literal49 -> p49
p49 recursive SHED -> 76 -> base60 byte114
  --K=2 pointer edges--> cell115 -> literal47 -> p47.
```

This is stronger than choosing base59 because it uses the independently selected leading radix, the independently reconstructed K, the pre-existing byte-pointer operation, and a receiver cell already selected by two other routes.

### Fixed H6-pair and state-depth controls

The upstream p47 group47 H6 packet has three adjacent pairs. Under the same BASE29 -> `mod256` address rule they land on:

| H6 pair | integer | cell | literal token |
|---|---:|---:|---|
| `[16,19]` | 483 | 227 | **`49`** |
| `[12,8]` | 356 | 100 | `1N` |
| `[12,22]` | 370 | 114 | `3H` |

Only the first pair yields a literal decimal token that is a legal physical LP2 page number. Thus p49 is selected by the canonical pair order without choosing among several page-valued outputs after inspection.

The p49 post-SHED byte114 also has a finite depth control. Grant every reconstructed state value independently as the byte-pointer depth:

```
{K,e,q,g,a,A,b,B,p} = {2,3,4,5,6,8,15,19,23}.
```

Compare the terminal byte with every solved p57 word whose GP-prime sum fits one byte. For p49 there is exactly one hit:

```
depth K=2 -> 115 = GP-prime(WITHIN).
```

All other p49 state depths land on `247,192,0,203,199,192,199,197`, none a byte-sized p57 word sum.

The matched five-core p55 control is less selective: from its base60 byte133, depths `A=8` and `B=19` both reach115 because they enter the main cycle at different phases; its K=2 depth lands at46. This is why the supported claim is the **upstream-selected p49 + upstream-selected K** closure, not a generic theorem that every five-core page chooses WITHIN uniquely.

### Whole-page control

Charge the unchanged recursive-SHED page object on every physical p0-p55 page using canonical complete words. For each page whose center sum is a legal p50 address, read the base60 byte and advance exactly K=2 pointers.

- Exactly **two** pages have `g=5` surviving cores: p49 and p55.
- P49: sum76 -> byte114 -> two edges -> **115**.
- P55: sum38 -> byte133 -> two edges -> **46**.
- Across **all** p0-p55 pages, not merely the five-core pair, **p49 is the only page** whose recursive-core sum -> base60 byte -> K=2 pointer chain terminates at115.

The old base59 DIRECTION result is therefore retained as an interesting alternate semantic read, but it is no longer the leading continuation. Do not use it to argue that base59 overrides the source-selected base60 table.

Reproducer for the new closure: `sims/lp2_p49_recursive_shed_base60_cell115_sft.cjs`.

## Frozen upstream operation

The operation was fixed upstream by solved p57 wording:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES.
FIND THE DIVINITY WITHIN AND EMERGE.
```

Agent20's p55 result applied that wording literally to complete printed words and obtained:

```text
p55 cores                [1,6,2,11,18]
core count               5 = g
middle                    2 = K
core GP0                  38 = WITHIN
H branch sums             36,36 = GOOD
p50[38]                   2D
base59(2D)                131 = GP0(CIRCUMFERENCES)
```

No key, phase, alphabet permutation, subset choice, reversal, or language score is introduced within the frozen base59 branch. The independent choice of base59 over base60 is not selected by this transfer and is challenged by the 2013 ALL AROUND base60 selector.

## P49 raw object

P49 has **17** complete page-local words. Their lengths are:

```text
[2,3,2,4,6,2,4,3,4,6,3,3,4,6,5,2,6]
```

Repeated circumference shedding removes every even-length word and leaves the center of each odd-length word:

```text
[20,19,19,14,4]
```

The already fixed outside-in H map gives:

```text
H(20,4)  = [16,24]
H(19,14) = [5,4]
middle    = 19

H coordinate sums = [21,28]
```

Only the predeclared direct state relations are recorded: the core count is `g=5` and the middle is `B=19`. The values 21 and 28 are left as raw outputs here. No post-reveal arithmetic is used to label them.

## Same-operation p50 transfer

The decisive operation is exactly the p55 consumer:

```text
core GP0 -> zero-based p50 address -> base59 value
```

For p49:

```text
76 -> p50[76] = 1s -> base59 112
```

The source label was already established independently in the authoritative synthesis:

```text
GP0(DIRECTION) = 112
```

For the original p55 object, the unchanged operation remains:

```text
38 -> p50[38] = 2D -> base59 131 = GP0(CIRCUMFERENCES)
```

So the two page-level five-core objects resolve under the same literal mechanism to two first-party instruction words:

```text
p49 -> DIRECTION
p55 -> CIRCUMFERENCES
```

## Whole-page control

Apply recursive word shedding to every unknown physical page p0-p55, excluding runeless p50.

Exactly two pages have five surviving centers:

```text
p49  [20,19,19,14,4]  GP0 76  -> base59(p50[76])  = 112 DIRECTION
p55  [1,6,2,11,18]    GP0 38  -> base59(p50[38])  = 131 CIRCUMFERENCES
```

Across all pages, **p49 alone** has page-level recursive-core GP0 whose frozen post-SHED base59 output is 112.

This is the cleanest control because p49 was selected before the semantic output by the prior whole-page five-core census.

## Full 16-word-window census

The same parser and operation charge all **2,039** page-local contiguous 16-word windows.

```text
charged windows                         2,039
windows with exactly five cores           116
five-core windows mapping to DIRECTION       8
p49 full signature windows                    2
p55 full conjunction windows                  1
```

The eight five-core DIRECTION windows are:

```text
p12 starts 18,19
p13 starts 44,45
p46 starts 22,23
p49 starts 1,2
```

Each pair shares a core vector because shifting across an edge even-length word leaves the set of surviving odd centers unchanged.

P49's full frozen signature

```text
cores=[20,19,19,14,4], GP0=76, H-sums=[21,28], middle=19
```

occurs only in its two overlapping 16-word windows. P55's prior conjunction remains unique at one window.

The window census therefore prevents an overclaim of universal window uniqueness for the word `DIRECTION`. The **page-level matched-control transfer** is the stronger result.

## Chronology caveat

Director #1836 requested a sealed p49 reveal. The upstream p55 report had already printed p49's raw core vector as part of its whole-page control before this invocation. A genuinely blind claim about the raw vector is therefore impossible.

The operation, target-register classes, p50 address convention, and post-SHED base59 consumer were all fixed independently before this transfer. No prior repository result linked the p49 recursive-core object to `DIRECTION`; a repository commit search for `p49 DIRECTION` returned no earlier result. The supported claim is therefore the unchanged-consumer transfer, with the raw-core secrecy caveat stated explicitly.

## Interpretation

This satisfies the positive criterion in Director #1836. The p55 recursive SHED mechanism now has a second page-level consumer under the same operation and output type.

The result upgrades the mechanism from a p55-local semantic compression to a **reusable page-level five-core SHED grammar candidate**:

```text
complete printed words
 -> recursively SHED circumferences
 -> sum emerged centers
 -> zero-based p50 address
 -> fixed base59 read
 -> authenticated instruction GP0
```

Further promotion should require another independently selected page or object. The eight 16-word DIRECTION windows show that unrestricted window mining would overstate specificity.

No unknown LP2 body plaintext, full inverse cipher, or destination is recovered here.

## Reproduction

```text
node sims/lp2_p49_recursive_shed_direction_transfer_sft.cjs
```

Windows GitHub Actions run:

```text
https://github.com/FlareZ123/liber-primus/actions/runs/44469573663
PASS on windows-latest, Node 22
```

Supporting commits:

```text
716f005744651c33153b4c2ed4a8e805d85340d2  SFT
af1c16d47e44135dd375fe2657217b428d2308c5  Windows workflow
```
