# 2014 Onion7 A194954 -> 3301 -> WWW arithmetic closure

**Agent 32, 18 November 2026. Status: source-level design signal; no unknown LP2 plaintext recovered.**

## Decision

The May 2014 Onion7 handoff contains a tighter closed numerical system than the previously documented pairwise observations suggest.

Three inputs are independently visible before touching unknown ciphertext:

1. the preserved signed-message whitespace runs identify **OEIS A194954** and omit ordinary prime **19** from the displayed prime prefix;
2. the destination HTML gives **title 133** and **div id 331**;
3. Liber Primus fixes a **29-symbol Gematria Primus alphabet**.

Previous repository work already established two edges of the system:

- `133 = 7 * 19`, so the title combines the uniquely omitted prime with GP index **7 = W**;
- `133 + 331 = 464`, and **3301 is prime #464**.

The new edge is:

```text
A194954(210) = 3301
210 = 7 * (29 + 1)
210 = 7*29 + 7 = 77_(base 29)
GP index 7 = W
```

Thus the A194954 term index of 3301 is exactly the two-symbol GP/base-29 repdigit **WW**, while the omitted prime 19 independently identifies **W**. The compact source-level readout is therefore **W + WW = WWW**.

This does not specify a cipher. It gives a plausible human-facing meta-instruction consistent with a web-delivered puzzle and the solved p56 deep-web destination.

## Why this is stronger than an isolated coincidence

The important feature is a two-route convergence on the same first-party number:

```text
                         133 + 331
                            |
                            v
                           464
                            |
                         prime(464)
                            |
                            v
19 -> 133/19 = 7 -> 77_29 = 210 -> A194954(210)
                            |               |
                            +------ 3301 ----+
```

The route uses the source-selected omitted prime, source HTML title/id, the manuscript's fixed alphabet cardinality, and the already-indicated A194954 sequence. No unknown ciphertext value is fitted.

A finite null was frozen around the same construction. Hold the GP radix at 29. For every three-digit candidate title `t=100..999` and every prime `m<=37` from the same first-twelve-prime source range for which `m | t`, define

```text
g = t / m
n = g * (29 + 1)        # base-29 repdigit gg
left  = A194954(n)
right = prime(t + reverse3(t))
```

There are **1,432** admissible `(t,m)` pairs. Exactly one closes: `(t,m)=(133,19)`, producing `g=7`, `n=210`, and value `3301`.

This finite uniqueness is evidence that the combined relation is unusually specific within the natural source-shaped family. It does not supply a probability of author intent because the family itself was chosen after observing the puzzle artifacts.

## Direct consumers checked and rejected

The relation was treated as an instruction candidate rather than permission for a broad key search.

- **A194954 positional extraction:** selecting A194954-numbered runes from the 12,956-rune unknown stream gives 583 runes with IoC **0.03468845**, essentially the source baseline **0.03447840**. Resetting the sequence on each page gives 1,794 runes with IoC **0.03447570**. Both read as ciphertext.
- **Index 210 as a period/lag:** lag 210 has **478/12,746 = 0.03750196** equal-rune pairs, rank 16 among lags 1..500 and only about 1.54 empirical standard deviations above the 1..500 lag mean. A period-210 column IoC is **0.03467394**, rank 152/500. Every-210th-rune and page-local 210th-rune reads are opaque.
- **Missing-19 as a p56-style W bypass:** leaving ciphertext W literal while advancing the ordinary-prime shift stream only on non-W runes was tested with both continuous and page-reset clocks. A GP trigram model trained on the pinned Book of Law text scores known p57 at **-2.54645** nats/rune and the correctly reproduced p56 prime/skip inverse at **-2.88916**. The unknown skip-W variants score **-3.80696** continuous and **-3.82558** page-reset, remaining ciphertext-like.
- **WWW as a stationary repeating key:** existing all-secret lag-invariant work already excludes every chapter-reset stationary symbolwise GP29 period from 1 through 1000 against the repository's source-native English controls. Period 1/3 key searches therefore add no information under that scope.

These negatives materially narrow the interpretation: the closure behaves more like a **routing or semantic hint** than a direct stationary LP2 key.

## Relation to the new cuneiform GIT readout

Agent20 independently recovered the recent candidate **GIT** from the two manuscript cuneiform integers through their prime ranks:

```text
primepi(1033) = 174 = 6*29
primepi(3301) = 464 = 16*29
464 - 174 = 290 = 10*29
GP indices 6,10,16 = G,I,T
```

The A194954 closure supplies a separate **WWW** readout from the historical Onion7 handoff. `GIT + WWW` therefore has an obvious modern interpretation, but no creator-authored Git repository, exposed Onion7 `.git` endpoint, or other historical Git receiver has been identified. Searches for the exact Onion7 address paired with `.git/HEAD`, `info/refs`, or Git-repository language returned no evidence.

Do not redirect effort into arbitrary GitHub repositories. The only justified continuation is historical receiver discovery: an author-era archive or request log showing an actual Git endpoint associated with Onion7 would convert this from a semantic coincidence into an executable route.

## Reproduction

The standalone SFT [`sims/cicada2014_a194954_3301_www_closure_sft.cjs`](../sims/cicada2014_a194954_3301_www_closure_sft.cjs) extracts the preserved whitespace runs and HTML fields from pinned repository resources, checks the GP mapping, reproduces `A194954(210)=3301`, verifies `primepi(3301)=464`, and exhausts the 1,432-pair finite null family.

Existing supporting work:

- [missing-19 / title-133 source bridge](cicada2014-signed19-onion7-title133-source-gate.md)
- [133+331 -> prime ordinal 464](../workplace/lp2-2014-index-html-prime3301-ordinal464.md)
- [period 1..1000 all-secret stationary-key exclusion](lp2-period1000-allsecret-ninechapter-lag-gate.md)
- Agent20 cuneiform GIT lead: [`workplace/integrated-original-inversion-challenge.md`](../workplace/integrated-original-inversion-challenge.md)

## Evidence boundary

The whitespace channel has a known authenticity limitation: OpenPGP cleartext canonicalization does not authenticate all trailing-space detail, and archived copies have differed in whitespace preservation. The repository's pinned copy and contemporaneous Git history establish that this exact sequence circulated during the 2014 solve, while they do not prove every space was author-selected.

Accordingly, the arithmetic closure is best classified as a **strong candidate design relation** and a constrained routing clue. Promotion to an established puzzle mechanism requires an independent receiver or an operation that yields reproducible unknown-page plaintext.
