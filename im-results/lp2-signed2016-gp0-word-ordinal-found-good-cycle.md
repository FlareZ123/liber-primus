# Signed-2016 GP0/word-ordinal pointer selects BE -> FOUND <-> GOOD

**Agent19, 19 November 2026. Classification: source-internal structural selector for the authenticated FOUND/GOOD pair. This relation was recognized after the p0 FOUND and GOOD candidates, so it strengthens source selection of those labels without constituting a blind plaintext recovery or a p0 receiver rule.**

## Source-only operation

Use the authenticated 43-word 2016 carrier in printed order and canonical GP29 rune sums.

Number the words zero-based, exactly as an array. For a word at index `i`, interpret its ordinary `GP0(word)` as another word index when the value lies in `0..42`.

No p50 token, p0 rune, receiver geometry, additive key, or DH state enters this operation.

The only consecutive forward-pointer hits in the complete source are:

```text
index34 BE
GP0(BE) = 35 = index(FOUND)

index35 FOUND
GP0(FOUND) = 36 = index(GOOD)
```

The next word closes the relation backward:

```text
index36 GOOD
GP0(GOOD) = 35 = index(FOUND)
```

Thus the source contains the compact graph

```text
BE -> FOUND <-> GOOD
```

and the printed text itself is consecutive:

```text
... WILL BE FOUND. GOOD LUCK. ...
         34 35     36
```

Across all 43 words:

- the only `GP0(current)=index(next)` hits are BE -> FOUND and FOUND -> GOOD;
- the only `GP0(current)=index(previous)` hit is GOOD -> FOUND;
- the only directed cycle of any length in the partial map `index -> GP0(word)` is FOUND <-> GOOD.

## Numbering and alignment controls

The relation is convention-sensitive. Under ordinary one-based word ordinals there are:

- zero next-word pointer hits;
- zero previous-word pointer hits;
- zero mutual cycles.

This is an important weakness for a human-puzzle interpretation: zero-based indexing is computationally natural but is not explicitly printed on the authenticated message.

Exact cyclic rotations of the same 43 GP0 values provide a low-cost alignment control. Among all 43 forward rotations, **only rotation0**, the authentic word alignment, contains any mutual cycle, and it is FOUND <-> GOOD.

For a broader text control, slide a 43-word window through every solved native Liber Primus section without crossing section boundaries. There are **436** such windows. Under the same zero-based relative-index rule:

- 60/436 contain some mutual GP0/index cycle;
- 8/436 contain an adjacent mutual cycle;
- 3/436 contain a run of at least two consecutive forward pointers `GP0(word_i)=i+1`;
- 0/436 contain a run of three.

So the exact BE -> FOUND -> GOOD two-step forward run is uncommon in solved-native controls, while the general phenomenon is not unique enough to be treated as an authorship probability.

## Relation to the p0 candidates

This source-only structure independently privileges **FOUND** and **GOOD** as a pair inside the authenticated 2016 vocabulary. That matters because current p0 work has exact candidate inverses for those same labels and a local dimension-changing FOUND -> GOOD state compression.

The relation also explains why these two GP sums are unusually suggestive before any p50 interpretation:

```text
GP0(FOUND)=36 = source index(GOOD)
GP0(GOOD)=35  = source index(FOUND)
```

Do **not** use this result to revive the retired generic literal p50 navigation grammar from Director #1739. It does not select a p0 offset and it does not derive either additive key. Its useful role is narrower: it supplies a source-visible reason to privilege the FOUND/GOOD target pair before comparing alternative authenticated labels.

Because the observation was found after those candidates were already known, the next promotion gate remains prospective: a rule selected from the source graph must predict an untouched manuscript consequence before its ciphertext is inspected.

## Reproduction

Run:

```text
node sims\\lp2_signed2016_gp0_word_ordinal_cycle_sft.cjs
```


## Prospective manuscript transfer fails

After the source-only relation above was preserved, Agent19 froze one untouched manuscript consequence before opening the receiver.

The first two forward pointers are `BE -> FOUND -> GOOD`. The already consumed second edge has:

```text
FOUND -> value36 -> p50[36]=0s
base59 / one-origin -> p0 word10 end52, length4
```

matching the GOOD receiver geometry.

For the untouched upstream edge, the same compound geometry gives:

```text
BE -> value35 -> p50[35]=0d
one-origin -> position38
position38 = end of p0 word6, length5 = GP length(FOUND)
```

Before opening p0 word6, the existing published FOUND Alice-shell key was frozen unchanged:

```text
[12,28,10,1,8]
```

The receiver then opened as `[9,25,6,10,2]`. Subtraction produces `[26,26,25,9,23]`, not FOUND.

This negative holdout is decisive for the obvious decoder extension. The GP0/index relation remains a source-internal selector for the FOUND/GOOD labels, while it is **not licensed as a p50 manuscript-routing/decryption grammar**. No alternate sign, origin, adjacent receiver, key order, or target was tried.
