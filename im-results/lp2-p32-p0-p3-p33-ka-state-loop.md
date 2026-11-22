# P32 → p0 → p3 → p33: conditional [K,A] / shared-e composition, not a source-selected route

**Agent4 arithmetic composition; status corrected by Agent1 under Director #1964 on 20 November 2026.** The numeric chain is reproducible, but its upstream p32 boundary selector is not authenticated. It does not establish a source-constrained route, unknown plaintext, or a cipher.

## 1. YOU32 leaves p32/f33 missing

The inferred signed-2016 diagonal maps zero-based source index32 **YOU** to physical p32 / one-based fragment33. The canonical parser finds only **21 complete page-local words** on p32, so f33 is absent. The proposed repair interprets the missing fragment number as a 33-rune boundary, but this unit change is not source-selected: p32 has 121 runes yet six printed lines, not an 11×11 grid; p6 is another square-count page (196=14²); and HOME fails the whole-book post-period familywise test (p=0.9456).

The ordered pair straddling the candidate boundary is:

```
p32 offsets32/33 = [2,8] = [K,A].
```

The arithmetic is correct; the interpretation is not a repaired map coordinate.

## 2. Conditional [K,A] → p0 arithmetic

If one assumes the unselected [K,A] pair as a zero-based row-major 11×11 coordinate, then:

```
coordinate (2,8)
-> p32 offset30
-> rune value0 = F.
```

This suggests physical p0. Independently, p0's two visibly red title words have already been tested under the authenticated 2013 DH group p=23,g=5. Their GP-prime sums are347 and315, residues2 and16, and therefore discrete logs:

```
log_5(2)  = 2
log_5(16) = 8
```

Their DH shared secret is:

```
16^2 mod23 = 2^8 mod23 = 3 = e.
```

Among all 19 canonical adjacent 8|5 word pairs, only the actual p0 red title has the ordered residues (2,16). This is a real p0 arithmetic fact; the proposed p32 coordinate does not independently select it.

## 3. Conditional e=3 → p3 arithmetic

If the p0 title's shared scalar is consumed as a physical page address, then:

```
shared secret 3 -> physical p3.
```

P3 has exactly two annotated red spans: a 16-rune opening span and one isolated **three-rune** span at offsets119..121, bracketed by red 13-dot marks at offsets119 and122. Across all LP2 ink annotations there are only **two** red three-rune spans, on p3 and p39.

The p3 triad is:

```
[13,23,2] = P D TH
GP-prime weights 43 + 89 + 5 = 137
137 = prime(33).
```

Prime-weight summation is the same source-native operation already used on the p0 red title. Prime ordinal33 therefore gives physical p33. These arithmetic relationships remain reproducible, but the p32→p0 input is not selected, and the p0 shared-secret-to-page operation is not independently authenticated here.

## 4. P33 re-emits [K,A] and THEIR RISE

P33's upper red title consists of two complete printed words of lengths [2,8]=[K,A]; its established solved-p56 positive-cardinal serializer reads **THEIR**. The lower title has lengths [3,5] and reads **RISE**.

The signed source has THEIR at indices19 and25, so THEIR RISE gives:

```
25 - 19 = 6 = a.
```

Independently selected p33 receivers satisfy:

```
YOU at canonical word29
WILL at canonical word35
35 - 29 = 6 = a.
```

The p33 title and word-displacement facts are independent observations. They do not authenticate the proposed p32 boundary or turn this conditional composition into a selected route.

## 5. Controls and decision

The constituent arithmetic is reproducible:

- p0 red-title DH residues/logs and shared3;
- p3 red119 prime sum137=prime(33);
- p33 [2,8]/[3,5] title readings and YOU/WILL word displacement;
- p32's 121-rune count and boundary33 pair [2,8].

What fails is the causal selector joining them. The 11×11 reflow is not printed; the missing f33 is already explained by p32's 21 complete page-local words; HOME is not familywise significant; and the red-title match is one of 80 comparisons. The p32→p0→p3→p33 chain must therefore remain a conditional composition, not a source-constrained navigation loop.

Do not use this chain as an upstream selector for p3 or as a reason to reopen the p32 missing coordinate. A new primary-source instruction selecting the unit change and coordinate convention would be required.

## Reproduction

`node sims/lp2_p32_p0_p3_p33_state_loop_sft.cjs`
