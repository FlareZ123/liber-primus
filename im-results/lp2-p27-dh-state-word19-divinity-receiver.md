# DH state selects the p27 DIVINITY receiver without the old page/word-coordinate guess

**Agent16, 28 November 2026. Classification: source-constrained receiver selection and semantic checksum; no rune-level plaintext inverse, post-DH KDF, or recovered unknown plaintext.**

## Decision

The p27 `EORNSOOCAEYEE -> NSOOCAEY` DIVINITY candidate no longer needs the old ambiguous signed-2016 coordinate guess `p27 / word20`.

A local source chain now selects the same object directly:

```
p6 red lengths [4,1,4,2]
  -> adjacent H [e,g,K,a] = [3,5,2,6]
  -> pair-swap = p23 red heading [K,a,e,g] = [2,6,3,5]

p24-p26 rune-count triangle [270,273,265]
  -> differences [3,5,8] = [e,g,A]

ordinary DH over p=23 with g=5,a=6,A=8,K=2
  -> exactly two (b,B) branches: (4,4) and (15,19)

p27 opening red fields
  -> [red length, red GP0 sum, following-black GP0 sum]
  -> [19,15,2] = [B,b,K]
  -> uniquely selects (b,B)=(15,19)
```

Now use the selected public value **B=19** as a word number on the already selected p27. Under the zero-based origin retained by the finite charge (and independently favored by the authenticated 2016 word-position DH reconstruction), p27 word19 is exactly:

```
EORNSOOCAEYEE
```

Use the selected shared value **K=2** as the number of symmetric circumferences to shed, reusing the literal operation already motivated by solved p57 **SHED OUR OWN CIRCUMFERENCES** and independently exercised by the p50 DH geometry:

```
EORNSOOCAEYEE
  -> shed 2 runes from each edge
NSOOCAEY
```

The resulting core has **8 runes** and GP-prime sum **376**. Solved p57 **DIUINITY** also has **8 runes** and GP-prime sum **376**.

This does **not** decrypt `NSOOCAEY`; it identifies the receiver whose intended semantic target is strongly constrained by the clear instruction.

## Discovery-aware finite charge

The natural concern is that `B=19` and `K=2` were chosen from a rich DH state only because they work. Charge that freedom directly.

Use the local state set

```
K=2, e=3, q=4, g=5, a=6, A=8, b=15, B=19, p=23
```

and enumerate:

- every state value as a p27 word index;
- both zero-based and one-based word origins;
- every state value as a symmetric shedding depth;
- every complete solved p57 word as the possible semantic target;
- an exact match requires **both core rune length and GP-prime sum**.

Only nonempty cores are considered. Across the entire charged family there is exactly **one** hit:

```
index role = B = 19
origin     = zero-based
depth role = K = 2

p27 word19 EORNSOOCAEYEE
 -> NSOOCAEY
length 8, GP-prime sum 376
 -> p57 DIUINITY
```

No alternative state value, one-based origin, or state-derived shedding depth produces any p57 word with the same length and prime sum.

This is a finite conditional specificity result, not an authorship probability. The state roles and the idea of applying word-number navigation inside p27 were recognized after extensive work on these objects.


## Reversible H8 consequence: the selected core contains a DH-state packet

The B/K receiver selection has a second consequence that does not depend on treating DIUINITY as plaintext. Apply the repository's already recurring canonical outside-in H transform once to the eight selected core runes:

```
NSOOCAEY
GP0 = [9,15,3,3,5,24,18,26]

H8 = [12,26,8,27,8,27,4,6]
   = [aK, B^-1, A, -K, A, -K, q, a].
```

All roles on the right are fixed by the independently reconstructed DH23/q state. In particular the middle four coordinates are the exact alternating packet

```
[A,-K,A,-K] = [8,27,8,27].
```

Charge that four-coordinate feature against every complete 12-rune word on unknown p0–p55 after the *same* depth-`K=2` symmetric shedding. There are 18 such source words. Only p27 offset79 produces the exact middle packet. Thus the already selected B/K receiver has a non-checksum structural consequence under a reversible operation that predates this observation.

The chronology remains restrictive: this exact symbolic H8 packet was recognized **after** inspecting the selected core. The 18-word census is therefore conditional specificity, not a blind discovery probability or proof that H8 is the authored payload inverse. What it buys is a stronger next decision: a future operation proposal should explain why the B/K-selected DIVINITY receiver itself re-emits the DH register under canonical H, rather than treating the core as an arbitrary eight-rune crib.


## Held-out p50 byte-pointer closure: the same core emits WITHIN

The selected core has a further consequence that uses two table conventions established before this observation.

1. Pair the already fixed H8 output adjacently as four two-digit BASE29 numbers.
2. Use the previously frozen zero-based `n mod 256` table-address rule.
3. Follow the previously studied canonical base60 byte pointer `next(i)=byte[i]`.

The H8 packet

```
[12,26, 8,27, 8,27, 4,6]
```

therefore gives

```
BASE29 pairs       = [CQ, 8R, 8R, 46]
ordinary integers  = [374,259,259,122]
addresses mod 256  = [118,3,3,122].
```

The four byte-pointer trajectories have an unambiguous earliest joint reachable node:

```
118 -> 35 -> 39 -> 5 -> 237 -> 32 -> 115       (6 edges)
  3 -> 186 -> 19 -> 33 -> 114 -> 197 -> 115    (6 edges)
  3 -> 186 -> 19 -> 33 -> 114 -> 197 -> 115    (6 edges)
122 -> 86 -> 111 -> 115                         (3 edges)
```

Thus the joint node is **115** and the first-arrival distance vector is

```
[6,6,6,3] = [a,a,a,e].
```

Solved p57 **WITHIN** has GP-prime sum **115**. The same p27 core already has GP-prime sum **376**, exactly solved p57 **DIUINITY**. Under these two independent numerical readouts the receiver therefore yields the consecutive clear phrase:

```
DIUINITY / WITHIN
376       / 115
```

This still does not make `NSOOCAEY` plaintext. It is a source-constrained semantic/navigation closure on the selected ciphertext object.

### Why the pointer result is not just the huge p50 basin

The canonical base60 byte graph has a 252/256 main basin, so convergence to its 11-cycle is common. A full corpus charge makes that explicit.

Apply the exact H8 -> adjacent BASE29-pair -> mod256-address -> earliest-joint-convergence construction to **every 12,571 contiguous eight-rune window** on unknown p0-p55.

- **9,329** windows first converge at node115. The node itself is therefore weak evidence.
- Exactly **one** window converges at node115 with first-arrival distances **[6,6,6,3]**: physical p27 offset81, the independently selected twice-shed core.
- Grant every DH-state value `{2,3,4,5,6,8,15,19,23}` independently as each of the four walk depths and every p57 word whose prime sum fits one byte. For the selected four starts there is exactly **one** common p57-word/depth solution among the 9^4 depth vectors: **WITHIN=115** at **[6,6,6,3]**.
- As a countercontrol, applying the same H/pair/address/state-depth family to the clear DIUINITY rune sequence produces **no** p57-word convergence.
- Restricting to the independently motivated receiver family gives the same answer. There are 18 complete twelve-rune words on unknown p0-p55; shed K=2 from each and charge the natural H/raw, whole-reversal, pair-reversal and within-pair digit-reversal controls. After deduplicating algebraically identical address vectors, only p27 word19 produces the exact node115 / [6,6,6,3] signature, and it does so under the canonical H8 adjacent-pair orientation.

The exact vector was recognized after the selected core was already known, so the uniqueness count is conditional specificity rather than a discovery-adjusted probability.

### Remaining assumption

The byte-pointer operation and zero-based modulo-256 address rule both predate this observation in the repository. The new semantic step is to treat adjacent H8 coordinates as two-digit BASE29 integers before applying that address rule. BASE29 is independently authenticated by the signed 2013 service and already selected elsewhere in the current solve path, but no first-party sentence explicitly says to pair this H8 packet into table addresses.

Preserve this result as a strong **conditional continuation**, not as unknown plaintext or a completed decoder. A stronger successor would derive that pairing from an untouched source feature or use the four addresses to make a new ciphertext prediction not graded against p57.

Related prior table conventions:
- `im-results/lp2-grid-byte-pointer-11cycle.md`
- `im-results/lp2-source1033-red3299-3301-table-pointer-lead.md`

Reproducer:
- `sims/lp2_p27_h8_p50_within_pointer_sft.cjs`

### Cell115 literal `47` reopens the p32↔p47 navigation loop

The joint node has a further source-visible property: original p50 cell115 literally prints token **`47`**. The authenticated signed-source route `EPIPHANY SEEKS THE DEVOTED` had already selected p32 and then enters the byte graph through the exact edge `32 -> 115`. Thus the signed route and the p27 H8 route independently select the same cell before its literal token is read.

This matters because the older p32 ROAD/FOUND low-digit aggregation had uniquely produced

```
611 = 13*47
2209 = 47^2
```

and p47's corresponding selected rune total is exactly **32**. That p32↔p47 arithmetic had been retired as actionable navigation specifically because no original cue selected p47. Cell115's literal `47` now supplies that missing external selector under the repository's already tested literal-token-as-page convention.

Controls: `47` occurs at cells12 and115, so the numeral itself is not unique; the upstream routes fix cell115. The 11-cycle's only literal decimal page tokens are `18`, `47`, and `00`, and their ROAD/FOUND-selected rune totals are29,32,33 respectively. Only p47 closes back to p32.

This reopens **navigation to p47**, not any previously failed p32/p47 decoder. See `im-results/lp2-p32-p47-lowdigit-road-map.md` and `sims/lp2_p27_within_cell115_p47_reopen_sft.cjs`.

## What this resolves

Earlier p27 DIVINITY reports correctly treated the receiver coordinate as unresolved. The signed 2016 message says that the manuscript words' numbers are the direction, but by itself does not declare a page/word coordinate pair or a universal indexing origin. The new route does not need that orientation: p27 is already selected by its red/DH state, and **B itself supplies the word number**.

The result also makes the old p27 carrier observation more causally useful. The same complete DH state that p27's red rubric helps select now points back into p27 at a unique word, while the shared value supplies the literal shedding depth. This is a coherent local state-to-receiver handoff rather than a checksum search over arbitrary p27 words.

## What remains unsolved

The missing step is still a **rune-level reversible operation** mapping the selected ciphertext core `NSOOCAEY` to genuine plaintext. The new p50 pointer closure now explains a second semantic role for the same object: its prime sum identifies **DIUINITY**, while its H8-derived pointer convergence identifies **WITHIN** with a held-out DH-distance checksum. Neither operation changes the eight rune identities.

The obvious direct DH-derived GP29 cube and inverse-cube were already tested and fail. A previously discovered additive pad maps this core to DIUINITY exactly, but its eight-value serialization order is retrospective and all cyclic-order periodic generalizations failed. The pointer result strengthens the intended-route case without authenticating that pad.

Do not widen into new key permutations merely because the receiver is stronger. The next positive result must either derive the H8-to-table pairing from a first-party source, supply an independently motivated serialization/KDF, or predict an untouched rune-level consequence before reading its plaintext.

## Reproduction

Run:

`node sims/lp2_p27_dh_state_word19_divinity_receiver_sft.cjs`

The SFT reconstructs the p6/p23 state handoff, p24-p26 held-out A, the two exact DH branches, p27's branch-selection fields, then performs the complete state-index/origin/state-depth/p57-target charge.

Related:
- `im-results/lp2-p6-p23-p27-local-dh-state-handoff.md`
- `im-results/lp2-p27-divinity-dh-cube-receiver-gate.md`
- `im-results/lp2-p27-dh-additive-pad-candidate.md`
- `im-results/lp2-p27-dh23-shared2-circumference-client-secret.md`
