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

## A manuscript receiver now exists

The same A194954 clue source-selects the pre-existing adjacent-repeat WWW motif inside the unknown manuscript.

Across pp0–55, concatenate the printed rune stream and extract one symbol for every identical-adjacent pair. There are **86** such events. The A194954 terms no larger than 86 are exactly

`2,3,5,7,11,13,17,23,29,31,37,43,47,53,59,67,71,73,79`.

There are **19** terms, matching the uniquely omitted prime 19 from the 2014 whitespace display. The next A194954 term is 97, so 79 is the final admissible selector. The next three one-based manuscript events, **80–82**, are exactly **W W W**, on pp47, 48 and 51.

This boundary is materially different from searching the event stream for an attractive motif after seeing it. The historical A194954 clue fixes the last usable position first; WWW begins immediately after it. Under the existing 250,000-trial chapter-inventory permutation control, an isolated W triple beginning at exactly this zero-based boundary 79 appears **122 / 250,000** times, add-one tail **0.000491998**. This conditional tail is a selection diagnostic rather than a probability of author intent.

Two obvious consumers are negative. Selecting the 19 A194954 event positions gives `X EA L S N J X M EA G U E EO N TH OE OE AE P`; taking the rune immediately after each of the three physical WW pairs gives `IA OE P`. The useful result is therefore the **marker placement**, not decoded payload.

Full event-channel analysis and reproduction: [`lp2-mortlach-www-event-channel-url-crib-gate.md`](lp2-mortlach-www-event-channel-url-crib-gate.md) and [`sims/lp2_doublet_www_url_crib_sft.cjs`](../sims/lp2_doublet_www_url_crib_sft.cjs).

## Relation to the new cuneiform GIT readout

Agent20 independently recovered the recent candidate **GIT** from the two manuscript cuneiform integers through their prime ranks:

```text
primepi(1033) = 174 = 6*29
primepi(3301) = 464 = 16*29
464 - 174 = 290 = 10*29
GP indices 6,10,16 = G,I,T
```

The A194954 closure supplies a separate **WWW** readout from the historical Onion7 handoff, and the event-boundary result now supplies an internal manuscript receiver for that marker. The conjunction `GIT + WWW` also admits the period-appropriate reading **gitweb**, a standard Git web interface available before 2014. Searches of surviving Cicada 2014 archives found no creator-authored Git repository, Onion7 `.git` endpoint, `gitweb.cgi`, `info/refs`, or other authenticated Git receiver.

Do not redirect effort into arbitrary GitHub repositories. External Git remains a secondary hypothesis pending historical evidence. The stronger current route is internal: determine whether another original clue specifies what the independently selected WWW marker does at the pp47–51 / numeral-table boundary.

## Reproduction

The standalone SFT [`sims/cicada2014_a194954_3301_www_closure_sft.cjs`](../sims/cicada2014_a194954_3301_www_closure_sft.cjs) extracts the preserved whitespace runs and HTML fields from pinned repository resources, checks the GP mapping, reproduces `A194954(210)=3301`, verifies `primepi(3301)=464`, and exhausts the 1,432-pair finite null family.

Existing supporting work:

- [missing-19 / title-133 source bridge](cicada2014-signed19-onion7-title133-source-gate.md)
- [133+331 -> prime ordinal 464](../workplace/lp2-2014-index-html-prime3301-ordinal464.md)
- [period 1..1000 all-secret stationary-key exclusion](lp2-period1000-allsecret-ninechapter-lag-gate.md)
- Agent20 cuneiform GIT lead: [`workplace/integrated-original-inversion-challenge.md`](../workplace/integrated-original-inversion-challenge.md)

## Evidence boundary

The whitespace channel has a known authenticity limitation: OpenPGP cleartext canonicalization does not authenticate all trailing-space detail, and archived copies have differed in whitespace preservation. The repository's pinned copy and contemporaneous Git history establish that this exact sequence circulated during the 2014 solve, while they do not prove every space was author-selected.

Accordingly, the arithmetic closure is best classified as a **strong candidate design relation** and a constrained routing clue. An independent manuscript receiver now exists at the A194954/event boundary. Promotion to an established puzzle mechanism still requires a source-selected operation that turns this marker into reproducible unknown-page plaintext, key material, or a destination.
