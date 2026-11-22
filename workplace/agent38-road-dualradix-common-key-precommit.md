# Agent38 precommit: ROAD dual-radix common DH/HERE key assembly

Date: 2026-11-19
Run: agent38-gpt5.6sol-20261119T015717Z-draw8-73bb85c8419d
Director issue: #1740

## Status and chronology

This grammar was derived after the published AND/THEIR exact inverse keys were known, so it is **target-aware compression**, not a blind discovery. Its only chance to gain evidential value is to survive the complete fixed structural controls and the holdout below without retuning.

No receiver values outside the already published ROAD pair are to be inspected before this precommit.

## Frozen common assembly

Fixed p28 DH state:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

Fixed source lookup map:

```text
HERE(x) = one-based p28 line1 at position x
```

For a p50 numeral branch of radix r in {59,60}:

1. choose the DH private scalar with the same parity as r:
   - r=59 odd -> b=15
   - r=60 even -> a=6
2. form the standard DH field serialization
   `[g,p,private,K]`;
3. truncate that serialization to the selected receiver length L, requiring L<=4;
4. use one uniform complementary lookup rule:
   - odd radix: map only the distinguished modulus field p through HERE; other fields stay direct;
   - even radix: keep p direct; map every non-p field through HERE;
5. subtract the resulting key modulo29.

Equivalently, `useHERE = (r is even) XOR (field is p)`.

This yields, before any new receiver inspection:

```text
r59, L3 -> fields [g,p,b]   -> key [g,HERE(p),b]
r60, L4 -> fields [g,p,a,K] -> key [HERE(g),p,HERE(a),HERE(K)]
```

These are exactly the already published AND/THEIR keys, which is why the rule is target-aware and needs holdouts.

## Frozen structural family

Reconstruct Agent18's full ROAD navigation family without receiver rune values:

- every authenticated 2016 word having two successors;
- canonical base29 numeral mod256;
- both p50 address origins;
- both live numeral radices 59/60;
- both receiver origins;
- retain cases where r59 and r60 land on adjacent p0 word starts.

For every retained case, apply the above key assembly independently to each branch whose receiver length is <=4. Compare branch59 against the immediately following authenticated word and branch60 against the second following authenticated word, with exact GP equality only.

No target-dependent key edits are permitted.

## Frozen holdout

Among non-ROAD retained structural cases, take the **earliest signed-message occurrence in source order** whose r59 receiver length exactly equals the immediate successor's GP length. This is selected from geometry and source lengths only.

The precomputed geometry identifies it as:

```text
source word THE at signed index1
p50 token 2v
r59 receiver start173, length3
next authenticated word PATH, GP length3
```

Prediction under the fixed rule:

```text
key = [g,HERE(p),b] = [5,26,15]
ciphertext at p0 start173 - key mod29 should equal GP(PATH)
```

The receiver values at start173 are not to be opened until after this precommit.

## Decision

- If the fixed rule reproduces ROAD -> AND/THEIR and also hits the frozen PATH holdout, preserve it as a serious common key assembly and demand another independent transfer.
- If ROAD alone hits while PATH fails, classify the grammar as target-conditioned compression and reject it as the missing pre-target key generator.
- Regardless of outcome, preserve the already sealed ROAD dual-radix navigation separately.

No lookup-mask permutation, sign flip, role swap, radix swap, alternate field order, or different holdout may be added after output inspection.
