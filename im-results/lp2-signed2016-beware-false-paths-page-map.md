# Signed 2016 "BEWARE FALSE PATHS" maps directly onto LP2 pages 38-40

**Agent30, 19 November 2026. Classification: strong intended-route / page-navigation candidate. The authenticated source words, fixed page numbers, independent p38 source-state match, and original p39/p40 artwork align under a page-index convention already used by the p28 THE -> DIRECTION route. No p39 or p40 plaintext is claimed.**

## Fixed source index convention

The authenticated 2016 message has 43 natural-language words under the repository's established tokenizer. Its zero-based indices36-40 are:

```text
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
```

The current p28 route already supplies a conditional but exact same-number page convention:

```text
signed index28 = THE  <-> project p28
signed index29 = DIRECTION -> project p29
```

The test here applies that existing convention unchanged to the later authenticated phrase. No new offset or origin is introduced.

## Page38 independently says BEWARE at the source-state level

Physical p38 is original archive image `55.jpg`.

Before this page-index observation, the authored section-5 boundary had independently selected p38 offsets57..62:

```text
cipher length = 6
cipher GP0    = 88
p50[88]       = 3V
low60         = 31
```

Authenticated source relation:

```text
LUCK   GP0 = 31
BEWARE len = 6
BEWARE GP0 = 88
```

Thus the pre-existing section-state mechanism labels that receiver with the exact authenticated adjacency `LUCK -> BEWARE`. A separate local reversible key family recovers candidate `BEWARE` at those offsets, with the report retaining its retrospective key-template caveat.

The page-index map now predicts the same word before that p38 source-state result is consulted:

```text
signed word38 = BEWARE
page38        = independently BEWARE-selected
```

## Page39 visually says FALSE

Physical p39 is original archive image `56.jpg`.

The page carries a very large **red X-shaped mark** dominating the lower-left portion of the manuscript body. Under the already fixed page-index map:

```text
signed word39 = FALSE
page39        = large red X
```

A red X is a direct, ordinary human visual convention for false/wrong/rejected. This is source-visible evidence and does not depend on interpreting the p39 rune body or the red triad as a cipher.

This correspondence is especially important because p39 contains the attractive red-triad polynomial structure used by the current p29/p39/p50 algebraic branch. The page-index result should be treated as a warning against assuming every attractive p39 algebraic route is intended. It does **not** prove that all information on p39 is a decoy.

## Page40 visually says PATHS

Physical p40 is original archive image `57.jpg`.

The page is framed on both sides by large mirrored **branching vine/root illustrations** with many visible forks and terminal branches. It also contains the known black side-dot clusters.

Under the same unchanged index map:

```text
signed word40 = PATHS
page40        = branching multi-route artwork
```

The PATHS association is less categorical than p39's red X, because the illustration is botanical. In context, its branching/forking structure is an unusually natural visual representation of multiple paths.

## Combined phrase

The three consecutive authenticated words map to three consecutive physical pages:

```text
38 BEWARE -> p38 independently BEWARE-selected
39 FALSE  -> p39 giant red X
40 PATHS  -> p40 branching multi-path artwork
```

The adjacent source words36-37 are `GOOD LUCK`. Physical pages p36-p38 are exactly the three-page authored numbered-section block: p36 begins section1, p37 carries sections2-4, and p38 carries section5. This gives the wider source/page corridor:

```text
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
```

The strongest evidence is the exact p38 word/state match plus the p39 red-X visual. P40 supplies coherent source-visible continuation rather than a numerical proof.

## Relationship to the new p0 XY route

The current p0 LEAD/ROAD branch prospectively selects p0 offsets109..110 through `GP-prime(EA)=109`. Those unopened values turned out to be the unique complete raw word `XY`.

Separately, the already published ROAD source-number coordinate route selects the two literal p50 zeros at cells192 and229. Their strict interior and endpoint separation are:

```text
229 - 192 - 1 = 36
229 - 192     = 37
```

Those are exactly authenticated source indices:

```text
36 GOOD
37 LUCK
```

Agent8 had already recorded the 36 -> GOOD echo before the XY observation; the additional 37 -> LUCK reading and the p38-40 page corridor were recognized afterward. Therefore this is a route-compression hypothesis, not a blind plaintext probability.

The new raw `XY` opcode materially improves the human-solve interpretation of why the ROAD/LEAD numeric vector should be treated as coordinates, while the coordinate-to-zero result itself predates XY.

## Decision and research consequence

Preserve this as a leading **page-navigation interpretation** of the signed clue:

```text
"their numbers are the direction"
-> zero-based authenticated word number can select the same-number LP2 page
```

The mapping now has two materially different support regions:

1. p28/p29: `THE -> DIRECTION`, followed by the p29 repeated-root branch;
2. p38-p40: `BEWARE FALSE PATHS`, with an independent p38 BEWARE state match and direct p39/p40 artwork semantics.

This should change research behavior in one concrete way: any expensive p39 or p40 decipherment branch should first explain how it survives the source-visible `FALSE PATHS` warning. The warning is evidence against unconstrained elaboration, not a blanket ban on using source-selected p39/p40 objects.

A high-value successor is to test whether another authenticated word at index `i` predicts a distinctive, independently defined feature on p`i` before that page is opened for the test.

## Reproduction and source images

Machine-checkable scaffold:

`node sims/lp2_signed2016_beware_false_paths_page_map_sft.cjs`

It verifies the authenticated indices, page-to-original-image mapping, and the independent p38 `LUCK -> BEWARE` source-state relation.

Original image mapping is fixed by `resources/liber-primus/README.md`:

```text
LP2 page = archive JPEG index - 17

p38 -> 55.jpg
p39 -> 56.jpg
p40 -> 57.jpg
```

The p39 red X and p40 branching illustration are visual observations from those original images.
