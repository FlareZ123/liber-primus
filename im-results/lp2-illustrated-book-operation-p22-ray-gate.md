# Illustrated-book operations: source-selector comparison and p22 ray gate (#3034)

**Result:** literal Masquerade eye-to-digit forward projection cannot reach the p22 text field under deliberately generous, frozen anatomical boxes. MAZE's explicitly labeled graph puzzle supplies no new LP2 graph receiver. Neither comparison licenses an unknown-page plaintext, key, or claim of historical influence.

## Two period-authentic mechanisms

1. Kit Williams, *Masquerade* (1979): the reproduced [author's Sunday Times clue, 21 Dec 1980](https://bunnyears.net/kitwilliams/masquerade/the-sunday-times-clue/) folds and mirrors to a hint specifying four digits, longest fingers/largest toes, and left-before-right ordering. Together with the eye/pointing instruction, the documented construction projects lines from eyes through selected digits to the lettering around each painting. A [page-level solution and painting reproduction](https://bunnyears.net/kitwilliams/masquerade/painting-1/) identifies the first recovered master-word as CATHERINE'S. The resulting words form a location riddle. This is a real example of image geometry selecting discrete textual symbols, with an independent rule for landmarks, direction, order and target. Evidence is an online reproduction and retrospective reconstruction; the complete original physical edition and author solution appendix were not directly obtained. Do not equate the folded newspaper hint with a universal page-fold instruction.
2. Christopher Manson, *MAZE* (1985): [reproduced directions](https://v1staz.github.io/Maze-by-ChristopherManson/directions.html) and [contest rules](https://www.intotheabyss.net/official-hints/) explicitly identify numbered rooms, labeled doors, the start/goal/return, shortest-path requirement, and 16-step length. The [rec.puzzles solution record](https://www.rec-puzzles.org/treasure/maze.html) gives the path 1,26,30,42,4,29,17,45,23,8,12,39,4,15,37,20,1. The room-45 riddle and answer along the path constitute additional operations. The central contest path is distinct from unsolved subsidiary puzzles. These web references were available through indexed excerpts, with some direct page fetches failing; no original full book or official solution letter was acquired. This comparison concerns the explicitly instructed navigation operation, not an independent re-solution of all rooms.

## Original LP2 comparison

| Source object | Observable selector | Missing operational input |
|---|---|---|
| p0 crosses | Opposed forms, previously measured half-turn relation | No chosen text-pointing landmark or letter destination; direct rotation already tested |
| p7/p8 ornaments | Five-dot motif and repeated stalk art; p7/p23/p56 dot correspondence | No digit/eye geometry, graph labels, or new reading rule; existing p56-transfer and stalk results retained |
| p22/p23 | Horizontal figure, visible closed eye and extremities on p22; p23 five-dot and wing forms | Direct projection fails below; no source-selected second construction |
| p32/p55 | Related tree shapes, p55 moth/wing and repeated border | No eye-digit selector or labeled edge map; previous shape and subtree results remain conditional |
| p49–51 | 256 printed tokens in 32×8 panel, repeated ornaments | No explicit direction labels, start/return or route length comparable to MAZE; existing byte-pointer and quotient-keypad graphs already investigated |

Prior art: [crosswalk](lp2-original-art-source-crosswalk-20261122.md), [p0 cross](lp2-p0-cross-halfturn-original-geometry-gate.md), [p22 art](lp2-p22-corpse-source-plate-decision.md), [p23–26 art](lp2-p23-26-original-art-source-gate.md), [tree correspondence](lp2-p32-p55-blurred-tree-correspondence.md), [base60 graph](lp2-p50-base60-functional-graph-p0-p8-audit.md), [directional graph](lp2-p50-directional-functional-graph-prime-ordinal-starts.md). p22's figure already has a documented near-exact mirrored LP1 reuse. Rival: the figure is an illustration or chapter marker rather than a newly placed pointer. The MAZE comparison offers no independent choice between the existing base59/base60 or quotient-keypad graph models. No new graph sweep performed.

## Frozen p22 geometric prediction

The p22 figure is the only unambiguous human anatomical candidate among these selected objects. Use original 39.jpg, 2400×3600, not a redraw. Before computing results, [issue comment 7198678210](https://github.com/FlareZ123/liber-primus/issues/3034#issuecomment-7198678210) fixed these inclusive pixel boxes (x,y): eye [2120,2399]×[3200,3500]; hand/digit [650,1750]×[3100,3550]; foot/digit [0,300]×[3100,3550]. Boxes include surrounding anatomy and permit every point, not just chosen endpoints. The target is the bounding rectangle of all grayscale values <160 in the upper 2100 rows, containing the printed rune field. No rune identities or language score enters.

At horizontal target coordinate x, a ray from E through D has y = Ey+(Dy−Ey)(Ex−x)/(Ex−Dx). Since every eye x exceeds all possible digit and target x, each coordinate is monotone with others fixed, or constant. Exact extrema are therefore attained at box corners. This even relaxes the actual post-digit requirement to the entire forward ray.

Local original-image execution returned 259,965 dark target pixels, x=600…1779, y=673…1799.

| Ray | Minimum y at target x | Maximum y | Result |
|---|---:|---:|---|
| Hand | 68700/37 = 1856.757 | 171600/37 | Disjoint by at least 57.757 px |
| Foot | 6536900/2099 = 3114.293 | 7436450/2099 | Disjoint by at least 1315.293 px |

Synthetic control E=(10,10), D=(8,8), target=(2,2) intersects exactly. Reproducer: `python sims/lp2_masquerade_p22_ray_gate_sft.py path/to/39.jpg` (Pillow). It was executed locally on the supplied archive; no workflow was needed.

## Decision

Reject this specific literal forward-projection transfer for the frozen visual landmarks and target. The boxes are visual annotations, not author-defined coordinates; the result does not reject reversed projections, other landmarks, or other possible illustration mechanisms, none of which were independently selected by the precedent. The general lesson is to require a source-specified landmark, operator, target and ordering, rather than adding degrees of freedom until a pattern appears. Reopen only for a concrete first-party selector or a distinct source-visible geometry with a prospective extraction prediction. No unknown plaintext recovered.
