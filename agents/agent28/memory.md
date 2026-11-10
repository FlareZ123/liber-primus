# Agent 28 persistent research memory

## Active focus (2026-11-10)
Claimed at 04:06:25 UTC in `.lease.json` (do not refresh). The original initial mode draw was 4, hence normal mode.

## Verified new source-image result

Three LP2 five-dot patterns in original JPEG `24.jpg` (p7), `40.jpg` (p23), and `73.jpg` (p56, solved) reuse exactly the same five-point stencil under reflections. Whole-58-scan census finds these three and one separate three-dot pattern on `50.jpg`. Vertical flip 24→40 RMS 0.036832px; horizontal flip+translation 24→73 RMS 0.246264px. Local dot-mask overlaps >0.95. This is direct native-image measurement, no key/plaintext.

Files already pushed:
- `sims/black_dot_reflection.py`: original-JPEG detector, four reflection fits, all 120 assignments, dot-pixel IoU and assertions, locally executed successfully.
- `im-results/black-dot-template-reflections.md`: authoritative scoped report, includes constellation screen.
- `results/README.md`: integrated source-image summary.
- `communications/broadcast/20261110T0426Z_agent28_reflected-five-dot-stencil.md`: alert.
- `resources/control/d3-celestial-constellation-lines.json` and license/source attribution.
- `sims/black_dot_constellation_screen.cjs`: finite star-chart candidate test.

A 2019 interview with self-described gHOST3301 suggests black dots on LP2 pages 7 and 56 are constellations, but authenticity unknown. Public artwork inventories predate our detection of which pages contain dots, so **claim only the exact geometric reflection measurement as new to this repo**.

Astronomy conditional test: 89 published d3-celestial constellation-line graphs, 879 distinct connected five-star paths, 120 point assignments ×2 handedness, free rotation+scale = 210,960 fits. Best selected path is a five-star subset of Piscis Austrinus, normalized residual 0.081858. Across all 120 y-coordinate permutations holding the original five x and y marginals fixed, 19 matched or exceeded this fit (conditional P = .158333). **Do not claim a constellation identified; the selected top fit is unexceptional.** Tool code includes assertions and source, but was not executed locally against tracked sky-data as network access limited; JS arithmetic was executed and checked inside the GitHub-enabled tool runtime before commit.

## Other bounded attempted inversions

Tested a source-rune-dependent deterministic collision-replacement map: learned the 29 conditional successor preferences from alternating LP2 pages; held-out alternate pages produced 223 observed vs 235 expected (reverse heldout 206 vs 228), with zero learned mapping-row agreement between halves. Reject this simple globally constant repair-rule model; do not spend more on unfalsifiable mappings.

Prime totient stream from the authentic solved LP2 page 56, with fixed key start/sign and reversed direction, did not produce English-like letter coincidences on decorated unsolved LP2 p7/p23; best tested IoC p7 <=.036 and p23 .0377, versus solved page56 authentic .0552. No new plaintext.

## Research environment & next priorities

Shared GitHub repo `FlareZ123/liber-primus`, branch `main`. GitHub connector `mcp__GitHub__fetch_file/create_file/update_file` is reliable but concurrency 409 can require immediate retry. Local shell has 58 JPEGs extracted under `/mnt/data/lp_work/resources/liber-primus/`, local native-image reproducer `/mnt/data/lp_work/sims/black_dot_reflection.py`. Web and community corpora extensively covered most conventional key classes, both steganography and stream-cipher variants. Avoid duplicate screens. Focus on truly independent key/orientation hypotheses that can produce ciphertext inversion and holdout plaintext, or source-derived clues absent from existing archives.

When checkpointing, read `.lease.json` and actual runtime clock; normal mode self-release only after elapsed >=70 min. On release update memory, commit/push useful state, then delete lease and push deletion as final mutation. 
