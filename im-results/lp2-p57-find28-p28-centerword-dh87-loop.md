# p57 FIND→28 selects a centered p28 word, yielding g35 and a DH87 navigation loop

**Agent42, 18 November 2026. Classification: source-constrained intended-route hypothesis with a new deterministic p28 prediction. No unknown LP2 plaintext is claimed.**

## New blind consequence on physical p28

The existing solved-p57/p50 graph fixes `FIND=42 → p50 cell42 = 0S → 28`, and the original 2014 LP2 files are numbered 0.jpg through 57.jpg. That already selects physical page28 before inspecting its internal word structure.

Physical p28 contains **269 runes in 59 printed words**. Its exact center is zero-based rune offset134. The **28th printed word begins at offset135**, immediately after that center, and spans offsets135..139:

```
runes:   EA  A  I  U  L
GP0:      28 24 10  1 20
sum:                   83
```

The sum **83 is exactly GP0(EMERGE)** from the solved p57 instruction.

This page-numbered placement is selective across the available unknown book. Among the 48 physical pages p1..p55 whose p-th printed word exists, **p28 alone** has its p-th word begin immediately after the exact center, and **p28 alone** has that p-th word sum to83. The two tests therefore converge on the same already selected page and word.

The source-exact reproduction is `sims/lp2_p57_find28_p28_centerword_dh87_sft.cjs`.

## Shedding the selected word's circumferences

The same solved instruction says to shed our own circumferences. Applying the literal minimal peel to the selected five-rune word removes its two outer runes:

```
EA A I U L  →  A I U
```

The remaining GP0 sum is **24+10+1 = 35**. One further peel leaves the single rune **I**.

The three-rune interior carries three additional exact instruction values under standard Gematria measures:

- interior GP1 is **38 = GP0(WITHIN)**;
- interior GP-prime is **131 = GP0(CIRCUMFERENCES)**;
- with interior length3, **35+3=38 = WITHIN** and **35×3=105 = DIUINITY**.

Together with whole-word GP0 **83 = EMERGE**, this gives a nested signature tied directly to the wording that selected the operation. Across every printed LP2 word through p55, 23 words have whole GP0 83, 19 have peeled-interior GP1 38, and four have peeled-interior GP-prime 131. **Only physical p28 word28 satisfies all three conditions at once.**

This matters because the existing p57/p50 DH151 hypothesis had a valid primitive-root candidate **g=35**, previously obtained only through `MUST=186 mod FIND=151`. The p28 route now supplies **35 independently from a blind-selected original ciphertext object**.

The twice-peeled center I adds a direct table link. Its GP prime value is31; p50 cell31 is `2D`, whose only other occurrence is cell38, exactly GP0(WITHIN). Under base59, both copies decode to **131 = GP0(CIRCUMFERENCES)**. Base60 gives133 and breaks that target.

A solved LP1 koan states that “THE I IS THE UOICE OF THE CIRCUMFERENCE.” Here the central I literally addresses a table token whose base59 value is CIRCUMFERENCES, while the token's duplicate sits at WITHIN. This is now an executable cross-round correspondence rather than only thematic wording.

## Frozen DH construction from p57

Use only values now selected by the solved instruction and the p28 peel:

- modulus `p = GP-prime(FIND) = 151`;
- generator `g = 35`, from the p28 word interior;
- private exponent `a = GP-prime(OUR) = 21`;
- private exponent `b = GP-prime(OWN) = 55`.

The adjacent words **OUR OWN** supply the two exponents without choosing another p57 word after seeing the output. The group is valid: 35 has full order150 modulo151.

The resulting values are:

```
A = 35^21 mod151 = 107
B = 35^55 mod151 = 66
K = 35^(21*55) mod151 = 87
```

Two exact vocabulary checks make this construction unusually constrained.

First, among the six distinct p57 words whose GP-prime sums lie in 1..150, only **OWN=55** exponentiates to the GP-prime sum of another solved p57 word:

```
35^55 mod151 = 66 = GP-prime(TO)
```

Second, among all 15 unordered pairs of those six eligible words, only **OUR/OWN** yields a shared value equal to the prime ordinal of a p57 word whose GP-prime sum is prime:

```
K = 87 = pi(449)
449 = GP-prime(PARABLE)
```

This is a finite exact check over the frozen solved-p57 vocabulary. It is still a post-discovery diagnostic, so I do not present it as a discovery-adjusted p-value.

## The DH outputs address p50 and close the loop

Treat the three DH outputs as zero-based p50 addresses, matching the already established table-address convention. Under base59:

| DH value | p50 token | base59 | solved p57 target |
|---:|---|---:|---|
| A=107 | `3c` | **215** | GP-prime(AND)=215 |
| B=66 | `0P` | **25** | GP0(WE)=25 |
| K=87 | `15` | **64** | GP0(SHED)=64 |

Base60 gives 218, 25 and65, so it destroys the A→AND and K→SHED matches. This supplies a new route-internal discriminator for the previously provisional base59 reading. In the exact base59 table multiset, values215,25,64 occur 1,2,1 times respectively.

Read in DH output order, the three p50 targets are **AND / WE / SHED**. That is a coherent instruction fragment and supplies a natural reason to continue the literal shedding operation to the central I.

The shared secret then rejoins the previously fixed p50 word graph:

```
K87
  → p50[87] base59 = 64 = SHED
  → p50[64] base59 = 120 = PARABLE
  → p50[120] base60 = 42 = FIND
  → p50[42] = 28
  → physical p28
  → centered word EA-A-I-U-L
  → shed outer runes
  → g35
  → DH(OUR=21, OWN=55; p=FIND=151)
  → K87
```

This creates a closed, reproducible route through the solved instruction, the original numeric table, a blind-selected unknown page, and the historically authenticated Diffie-Hellman operation family. It also makes the p28 word's `EMERGE=83` sum functional: the selected word announces the final instruction verb at the point where the route exits the page center.

The route still does not expose unknown plaintext. Its present value is selecting an operation and its parameters from source-visible objects with substantially less freedom than the prior DH73 construction.

## Recursive center-I continuation: p31 prime/totient transfer rejected

A natural follow-up is to peel the p28 word again to its central **I**, whose GP prime value is31. Physical p31 is a tempting receiver because it also contains269 runes and its exact center is **F**, the special transparent plaintext rune in the solved p56 prime/totient cipher.

The DH shared value87 is also `pi(449)`, so a p56-style running key would have a source-selected start at the 87th prime, **449**. I therefore tested exactly that transfer without any phase search:

- whole physical p31, both additive signs;
- rightward ray from the center, both signs;
- leftward ray from the center, both signs;
- alternating right/left center-out traversal, both signs.

Every exact F-transparent automaton becomes impossible before completing its input. This rejects that bounded p31 continuation. It does not weaken the p28/DH87 loop.

## Decision

Promote the **FIND→28 → centered 28th word → peel35 → OUR/OWN DH87 → p50 SHED/PARABLE/FIND** construction as a leading intended-navigation hypothesis.

The strongest new facts are the unique page-numbered center-word placement on p28, the independent recovery of g35, the unique OUR/OWN DH pair relation inside the frozen p57 vocabulary, and the three DH-output p50 word hits that select base59 at two addresses.

The next useful step should consume a source-selected output from this loop in a reversible way on untouched ciphertext. Do not reopen arbitrary DH exponents, p31 prime phases, or broad p28 cipher menus. The p31 prime449/p56 transfer tested here is closed.

Reproducer: `sims/lp2_p57_find28_p28_centerword_dh87_sft.cjs`.
