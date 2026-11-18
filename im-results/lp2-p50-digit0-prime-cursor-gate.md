# Literal-zero-controlled prime/totient cursor gate

**Agent1, 18 November 2026, Director #1509. Bounded negative. No unknown LP2 plaintext, key, or reversible decoder recovered.**

## Frozen model

Commit `b1adcf1a920a7da3b04e0c6a84928e9044b57b4d` predeclared the exact model before any candidate score was inspected. Under the global p0-p55 rune clock, p50 cell `i mod 256` is a hold bit exactly when its printed token begins with literal `0`. The table has 60 such cells. At each rune the key is `phi(q[j]) = q[j]-1 mod29` for consecutive ordinary primes, with p56 sign+ inverse `P=C-key mod29`. The prime cursor holds on literal-leading-zero cells and advances otherwise. Only the initial prime index 0..463 is searched. There is no plaintext-F branch, phase, sign, reset, mask reversal, radix interpretation, collision rule, or extra state.

The source-natural training receiver is complete p0-p2, 729 runes / 158 printed words. The untouched transfer receiver is p3-p7, 1,145 runes, continuing the same clock. The hold mask causes 560 prime advances across p0-p2 and 1,438 through p0-p7.

## Frozen language gate and controls

The screen uses the existing additive-0.2 GP word-bigram model trained on solved LP1 material before `### 56`, with standard GP spelling normalization and original p0-p2 word lengths. Before candidate scoring, 2,000 exact-length native controls and 2,000 uniform-GP29 controls fixed the inspection threshold at the native 1st percentile:

- native 1st percentile: **-2.3902192881828106** nats/rune;
- native median: -2.309426305228258;
- uniform-GP median: -4.515023514029358;
- best uniform-GP control: **-4.2508085410738365**.

The numeric threshold was committed before candidate scoring in `1d793102abd3316ffdac16537718212dc39c8c1e`.

Implementation controls passed before the real sweep. The repository's authentic p56 phi-prime decoder reproduced all 85 established plaintext runes under its documented literal-F branch. A deterministic p0-p2-shaped native plaintext encrypted under the exact literal-zero hold clock recovered 729/729 runes; its score was -2.3033401126294666, above threshold.

## Original-source sweep

All 464 allowed initial prime indices were decoded and scored on p0-p2. **Zero** meet the frozen native threshold.

The best real start is zero-based prime index **238**, prime **1499**, with score **-4.3192689479683395** and IoC 0.03508117397006286. It misses the frozen threshold by **1.929049659785529 nats/rune** and scores below the best of the 2,000 uniform-GP controls. The next best starts are index9/prime29 at -4.36422 and index106/prime587 at -4.38427. The worst start scores -4.71171.

Because no training candidate passed the predeclared gate, no candidate plaintext was inspected and the untouched p3-p7 receiver was not opened. This avoids choosing a survivor from noise or adapting the rule to held-out output.

## Decision

Retire exactly this transfer: **phase-0 literal-leading-zero p50 mask controls hold/advance of a p56-style consecutive-prime totient cursor, sign+ arithmetic, initial prime index 0..463, continuous from p0**. The robust p50 leadinK^™\›ËÙİX›]\ÜÛØÚX][Ûˆœ›ÛHÌML™[XZ[œÈHİXİ\˜[ÛYNÈ\È\İÚİÜÈ]Ù\È›İÜ\˜]H›İYÚ\ÈÚ[\\İ™]™\œÚX›HM‹\İ[Hİ\œÛÜ‹‚‚‘È›İ™\ØİYHH[Ù[Ú]ÚYY\ÙK™]™\œÙYX\ÚË[\›˜]HÚYÛ‹Ú\\ˆ™\Ù]Ë˜Y^˜\šX[ËZ[^Qˆ\\ÜÙ\ËÛÛ\Ú[Ûˆ[\ËÜˆ™]ÈÚÚ\]ÜËˆHİXØÙ\ÜÛÜˆ™YYÈ[ˆ[™\[™[HÙ[XİYYXÚ[š\ÛH^Z[š[™ÈÚHH]\˜[^™\›Èš]Y™™XİÈÚ\\^‚‚”™\›ÙXİ[Ûˆ›ÙHÚ[\ËÛ—ÜLÙYÚ]Üš[YWØİ\œÛÜ—ÙØ]WÜÙ˜ÚœØ‚