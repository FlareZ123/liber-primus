# P32-p42 authenticated signed-tail corridor and section-number continuation

**Agent11, 19 November 2026. Classification: source-constrained intended-route synthesis with one new visual navigation operation. No new unknown LP2 plaintext is claimed.** The authenticated 2016 source words 32 through 42 form one contiguous instruction tail. Independently established manuscript routes now traverse the matching physical pages p32 through p42 in the same numerical domain. The new contribution is that the visible Arabic section markers `1,2,3,4,5` printed across p36-p38 act literally on the already selected source index37 `LUCK`, enumerating indices38-42 exactly as `BEWARE FALSE PATHS VERIFY OPENPGP`.

## Authenticated tail

Using the repository's established zero-based tokenizer, the final eleven alphabetic words are:

```text
32 YOU
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

Their canonical GP-rune lengths are:

```text
YOU WILL BE FOUND GOOD LUCK BEWARE FALSE PATHS VERIFY OPENPGP
 3    4  2    5     4    4     6      5     4      6      7
 e    q  K    g     q    q     a      g     q      a     g+K
```

This state-valued length row is supporting structure. The route below does not require treating those lengths as a new cipher.

## Existing entry closes on p32

The previously charged authenticated route starts from:

```text
EPIPHANY SEEKS THE DEVOTED
```

and uses the original p50 table, start `GP0(SEEKS)=71`, base60 pointer values, and depth `p=23`. Its exact pointer chain terminates at physical p32:

```text
71 -> 108 -> 14 -> 183 -> 81 -> 58 -> 146 -> 92
   -> 236 -> 238 -> 129 -> 179 -> 175 -> 18 -> 15
   -> 212 -> 70 -> 169 -> 228 -> 144 -> 125 -> 20
   -> 102 -> 32
```

Authenticated source word32 is `YOU`.

P32's selected center value `B=19` then uses the original p50 table:

```text
p50[19] = 0X = 33
```

so the route advances to physical p33, whose source word is `WILL`.

## P33 gives a literal rise to FOUND

The independent solved-p56 cardinal serializer turns the p33 title construction into:

```text
THEIR RISE
```

The lower title physically uses lengths `[3,5]`; the literal rise of the numbers that encode `RISE` is therefore:

```text
5 - 3 = 2
p33 + 2 = p35
source word35 = FOUND
```

This is the already published preferred RISE reading. The alternative THEIR-occurrence rise `25-19=6` lands on p39, whose source word is `FALSE` and whose original image is dominated by the large red X.

The newly assembled page corridor makes the preferred branch more legible. The traversed signed indices are:

```text
32 YOU
33 WILL
34 BE
35 FOUND
```

P33 and p34 independently carry source-selected local `WILL` and `BE` candidate inverses. Thus the p32 entry followed by the p33 literal rise passes through the exact authenticated phrase:

```text
YOU WILL BE FOUND
```

without inventing another source offset.

## FOUND returns to the EPIPHANY entry

The source-only p50 bridge already establishes:

```text
FOUND has signed number35
p50[35] = 0d = 39
39 = GP0(PATH)

p50[39] = 05 = 5
source word5 = EPIPHANY
```

So the page/index reading now closes a compact navigation loop:

```text
EPIPHANY/SEEKS -> p32 YOU
p32 B=19       -> p33 WILL
p33 RISE +2    -> p35 FOUND
FOUND35        -> PATH39 -> EPIPHANY5
```

The loop does not consume p35 ciphertext and therefore does not claim a p35 plaintext recovery.

## P32 independently emits GOOD LUCK

The p32 READ OUT route returns authenticated source indices `[7,8]` = `THE DEVOTED`. The independently selected signed word `DIRECTION` is index29. The fixed +29 fold gives:

```text
[7,8] + 29 = [36,37]
source words36,37 = GOOD LUCK
```

This supplies the second entry into the same physical tail:

```text
p36 = GOOD
p37 = LUCK
```

The earlier claimed p36 local `GOOD` inverse at offsets87..90 is retired. Canonical parsing joins the line-wrap slash, so offsets87..91 form one five-rune word `[11,0,13,11,23]`; p36 has no canonical four-rune length/GP0 receiver for `GOOD`. This correction does not affect the upstream p32 DIRECTION readout that selects authenticated indices36-37 = `GOOD LUCK`.

## New operation: the printed 1-5 section numbers continue LUCK into the warning tail

Original physical p36-p38 visibly print the Arabic section numbers:

```text
p36: 1
p37: 2, 3, 4
p38: 5
```

The base index is already fixed upstream as `LUCK=37` by the p32 DIRECTION readout. No ciphertext value is needed. Treat the printed section numbers literally as signed-word displacements:

```text
37 + 1 = 38 -> BEWARE
37 + 2 = 39 -> FALSE
37 + 3 = 40 -> PATHS
37 + 4 = 41 -> VERIFY
37 + 5 = 42 -> OPENPGP
```

Therefore the authored visible section numbering enumerates the entire remaining authenticated warning instruction:

```text
BEWARE FALSE PATHS VERIFY OPENPGP
```

This is a direct realization of the signed clue's wording that their numbers provide direction. The operation is source-visible and human-sized: once GOOD LUCK has selected indices36-37, the manuscript itself prints the five offsets needed to enumerate the rest of the signed tail.

## Independent checks on the five destinations

The five destinations are not equally strong as plaintext claims, and the route does not require them to be.

### p38 BEWARE

The independently selected p38 section-5 first word has state:

```text
length6, GP0=88
p50[88] = 3V
low60(V) = 31 = GP0(LUCK)
```

which uniquely selects the authenticated adjacency `LUCK -> BEWARE`. Its original ciphertext offsets57..62 have a separately documented exact local BEWARE inverse.

### p39 FALSE

The original p39 image has the dominant large red X. Under the fixed signed index, word39 is `FALSE`. A separate source-selected p39 mechanism remains useful and yields VERIFY, so FALSE warns against route choice rather than discarding the page itself.

### p40 PATHS

P40 independently has the source-selected local PATHS candidate at offsets71..74. Its red `[3,5]` title also serializes to RISE, and the same literal +2 operation gives:

```text
p40 + 2 = p42
source word42 = OPENPGP
```

### p41 VERIFY

The source-selected p39 DIVINITY receiver at offsets105..109 is:

```text
[8,6,4,12,16]
```

Literal circumference shedding leaves:

```text
[6,4,12]
sum = 22
p50[22] = 0x = 59
GP0(VERIFY) = 59
```

so an independent mechanism produces `VERIFY`, the signed word at index41.

### p42 OPENPGP

P42 is reached both by the new section-number enumeration `37+5=42` and independently from the p40 RISE +2 operation. This makes p42 a convergent typed endpoint for the signed instruction `OPENPGP`. The active Director #1786 audit of the authenticated key ID `7A35090F` should therefore treat p42 as the natural receiver context if its already frozen source grammar yields a manuscript target. The corridor itself does not select or tune a key-ID formula.

## Corridor ciphertext checkpoints

The integrated SFT replays the exact original-ciphertext local inverses already published on the corridor:

```text
p33 offsets132..135 -> WILL
p34 offsets4..5     -> BE
p38 offsets57..62   -> BEWARE
p40 offsets71..74   -> PATHS
```

These retain their existing chronology classifications. The corridor strengthens their common page-selection context, but it does not erase the fact that several key-shell expressions were recognized after their targets were known.

## Decision

Preserve the signed tail as a leading intended navigation program:

```text
32 YOU
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

The strongest new step is:

```text
p32 READ OUT -> GOOD LUCK -> signed index37 LUCK
visible manuscript section numbers 1..5
-> signed indices38..42
-> BEWARE FALSE PATHS VERIFY OPENPGP
```

This gives the visible section numerals an immediate, source-authenticated consumer and connects previously separate p38, p39, p40, and p42 observations into one human-scale route.

Do not infer plaintext for p35, p37, p39, p41, or p42 solely from their page labels. Continue to require an independently fixed value-changing operation for unknown rune plaintext.

## Reproduction

`sims/lp2_p32_p42_signed_tail_corridor_sft.cjs`

The SFT parses the authenticated source, reconstructs the p50 base60 tape, verifies the SEEKS depth-p terminal p32, checks p32->p33, FOUND->PATH->EPIPHANY, the DIRECTION GOOD LUCK fold, the new section-number warning enumeration, the LUCK->BEWARE low-digit relation, the four surviving published local corridor inverses, the p39 VERIFY readout, and p40 RISE+2->p42 OPENPGP. P36 GOOD is intentionally absent because the corrected canonical parser retires that former line-wrap pseudo-word.

The section numerals themselves are original-image visual observations on archive scans 53.jpg, 54.jpg, and 55.jpg (physical p36, p37, p38). No OCR-derived numeral assertion is used.
