# LP2 256-byte table is not a direct legacy-PHP MT byte stream under natural traversals

**Status:** complete exact finite-domain negative, Agent 39, 2026-11-10. No source-grid key, plaintext or destination recovered.

## Question and exact inversion

The LP2 pages 49–51 contain a **32-row × 8-column table of 256 base-60 byte values**. If it is direct output from a small-state random-number generator rather than key material or a ciphertext, a **32-bit PHP legacy MT19937 seed** can be tested exhaustively by regenerating the first several bytes.

`sims/php_mt_grid.c` implements the historical PHP 5.x Mersenne Twister (not the later PHP 7.1+ algorithm) and two natural one-byte extractions from each new 31-bit `mt_rand()` output: `high8` for the historic 0–255 ranged result and `low8` for the low eight bits. It tests all **eight natural row/column/serpentine orientations**, their reversals, and all **256 cyclic offsets** per orientation, making **2,048 source-table byte arrangements**. Each seed and byte reducer are compared with an eight-byte prefix from every arrangement. The exact six-byte match gate alone is already decisive for this finite family.

The canonical input is `resources/liber-primus/lp2-grid-256.json`, SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. Source integrity is enforced in CI before generation.

A 24-bit-prefix hash index speeds up the search by discarding almost every candidate after its first three bytes; every surviving pair is then checked byte by byte through eight. Source seed0's first six historical 31-bit outputs are checked at run time; an artificial plant replaces the first eight table bytes with **actual seed777 `high8`** outputs and recovers `HIT seed=777 reducer=high8 traversal=0 offset=0 bytes=8` exactly (the row-serpentine traversal yields an intentional second equivalent hit).

## Full-domain results

[Successful full 128-shard workflow run 42758815011](https://github.com/FlareZ123/liber-primus/actions/runs/42758815011) covered each integer seed in `[0,4294967296)` exactly once, with interval partitions of 33,554,432 seeds. The independent [reconciliation workflow run 42760997527](https://github.com/FlareZ123/liber-primus/actions/runs/42760997527) validated every shard's exact span, candidate-line count, and all summed counters.

| Longest consecutive byte prefix matched | Candidate search paths surviving that many bytes |
| --- | ---: |
| 3 bytes | 1,050,091 |
| 4 bytes | 4,239 |
| 5 bytes | **12** |
| 6 bytes | **0** |
| 7 bytes | 0 |
| 8 bytes | 0 |

Numbers count matched seed/reducer/table-orientation/offset paths, not unique seed values. At most five bytes ever match any declared direct table arrangement. The full eight-byte hit list is empty. The independent [million-seed pilot run 42758716253](https://github.com/FlareZ123/liber-primus/actions/runs/42758716253) already recovered seed777 in the planted gate, scanned one million real seeds and returned 231 three-byte coincidences with no longer match; its separate aggregate run 42758925327 also succeeded.

## Bounded interpretation

No unsigned 32-bit seed of the historical PHP generator, with the tested direct output-byte conventions and natural 32×8 byte traversals/cyclic offsets, generates even the first **six** table bytes in any arrangement. Therefore the table is **not** an unmodified output byte stream of that exact family. This says nothing about encrypted or hashed generator output, unknown seed salts, discarded draws, generator families outside the specified PHP branch, a state advanced before recording, bytewise transforms, block shuffling, or source glyph-transcription errors. The source grid may still be a key, encrypted payload, or other cryptographic artifact.

Reproduction: `sims/php_mt_grid.c`, `sims/aggregate_php_mt_grid.cjs`, and two dispatch-only workflows `.github/workflows/php-mt-grid-sweep.yml` and `.github/workflows/php-mt-grid-aggregate.yml`. The full-domain aggregate JSON and all original per-shard logs are preserved in GitHub Actions artifacts. Re-running the same domain under these precise assumptions is unnecessary.
