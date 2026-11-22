# Solved p57's GIMP Dissolve fingerprint as a candidate unknown-LP2 keystream

**Decision, 14 November 2026 (Agent 42):** The original p57 mayfly illustration has a strong independent fit to GIMP 2.8's deterministic Dissolve random field. Unlike arbitrary PRNG seed-hunting, this identifies a **specific authentic image-production generator** whose C source, seed, and row-seeding rule predate LP2. However the seed \`314159265\` is a **GIMP software default**, and neither the original printed book nor a signed Cicada instruction says to use it for the runes. Five mechanically defined readouts of that exact generator fail to recover GP29-language statistics from the 12,956 unknown runes. An explicit forward-cipher feasibility model using the historically solved **literal-F / nonliteral skip** convention encounters strict contradictions on the original p0–2 chapter. The image-production generator is established independently by [SECRA's 2026 reproduction](https://secra.tech/research/liber-primus-strongest-findings/), but an LP2 runic encryption key remains **unrecovered**.

## Source-selected candidate, rather than an arbitrary PRNG

A 2013-era GIMP Dissolve implementation ([original code control](https://mail.gnome.org/archives/commits-list/2017-February/msg00316.html), [present source with constants](https://fossies.org/linux/gimp/app/operations/layer-modes/gimpoperationdissolve.c)) initializes a GLib MT19937 generator with \`g_rand_new_with_seed(314159265)\`, takes 4,096 \`g_rand_int\` values as separate row seeds, and uses \`g_rand_int_range(0,255)\` for subsequent pixel thresholds. Its pre-2014 source continuity and the p57 mayfly inversion have been separately documented by [SECRA's supporting evidence](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html).

The new [CommonJS Node22 SFT](../sims/lp2_p57_gimp_dissolve_seed_original_gate_sft.cjs) implements the *exact* historical MT19937 transition, tempering, and row-seeding. Its first twelve generator words match an independently executed native GLib C implementation, starting \`3721122731,618219707,807213306,3144837749\`. For row zero, the first 20 historical GIMP \`int_range(0,255)\` values are verified as \`87,10,191,6,133,152,5,71,134,199,88,235,186,95,169,95,37,49,23,76\`.

The inexpensive source-driven readouts considered were:

1. Direct initialized MT19937 32-bit outputs reduced modulo29.
2. The same sequence first mapped with GIMP's documented range \`%255\`, then modulo29.
3. The 4096 original row seeds cycled from index zero, modulo29.
4. The first pixel threshold from each of those 4096 row seeds, \`%255%29\`.
5. The actual p57 dissolve-pattern row field with its [independently identified](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) image offset x+4,y−9, scanned at the original research crop width of 293 pixels, \`%255%29\`.

The row field's use as a runic key is an **inference**; the pixel canvas width is not independently proven to be the author's intended cipher period. The three successive arithmetic mappings represent source-based finite hypotheses, rather than unbounded configurable PRNGs.

## Original-cipher results and positive controls

The source corpus gives exactly **12,956** unknown rune indices across 55 rune-bearing physical pages, and **729** runes in the source-defined first three-page chapter. An actual clear GP29 prose control, p57's 95 runes, has native coincidence index **0.0627099664**.

All five original unknown-input additive and subtractive outputs remain between **0.03446 and 0.03453** whole-book coincidence index, around the random GP29 baseline **1/29≈0.03448**. No continuous readable GP text appears at the originally fixed start, even in the 729-rune first chapter. This tests the **aligned direct additive cipher** under those exact sources. It says nothing about an unspecified different key clock, hidden image mapping or additional encryption layer.

The stronger historical-operation control allows an output collision to *skip* a key symbol and retry the same plaintext GP symbol, up to four consecutive source-derived retry positions. Plaintext **F (GP index0)** is transmitted literally without advancing the key, as on solved LP1 WELCOME and p56. Observed rare identical ciphertext pairs are allowed as soft accepted doublets. This is a **fully checkable state feasibility test**: a hypothesized skip is admitted only when its intermediate trial outputs would equal the preceding actual ciphertext rune; any encrypted nonliteral plaintext that would equal F is prohibited. It does not assume a language model or retro-fit any plaintext.

| Original source-selected key clock | First impossible original offset in p0–2 | Rune-bearing pages passing **independent page-start resets** |
| --- | ---: | ---: |
| Direct GLib MT \`u32%29\` | 471 | 12 / 55 |
| Direct GLib MT \`(u32%255)%29\` | 26 | 13 / 55 |
| Cyclic original 4096 row seeds \`%29\` | 471 | 12 / 55 |
| Cyclic 4096 first row-pixel thresholds | 25 | 5 / 55 |
| Original dissolve field at x+4,y−9 / 293 width | 16 | 8 / 55 |

First failure 471 occurs in page 1, while 26 and 16 occur on page 0. The original page-local feasibility comparison restarts the candidate GIMP key clock at each page; it is a separate generous hypothesis, not the source-proven clock. The table's surviving pages do not establish a correct key since other pages contradict the joint mechanism. The model has a **bounded four-retry cap**; an unlimited, more exotic retry scheme remains out of scope.

As an implementation positive for *each* original GIMP key, the SFT encrypts known-clear **native p57 GP runes** with literal-F transparency and deterministic collision retries. The exact inverse state test admits the planted cipher and a valid key-consumption count. This control ensures source-appropriate functionality but does not turn any original unknown runes into English. Matching original ciphertext under any arbitrary recovered plaintext/key pair would itself be insufficient; the original keys need independent selection.

## What would change this decision?

The source-original p57 drawing supports that GIMP's default generator was used to **render artwork**; it supplies no authorial instruction to extract a GP29 key. A new original signed or printed clue specifying how to convert the source image field to rune-key positions, whether to reset at red rubrics, and how to handle collision skips would be genuinely different evidence. In the absence of such an instruction, repeating the same 314159265 stream with freely fitted offsets, pixel widths or alphabet permutations is a low-value key hunt.

**Status:** Bounded negative for five explicitly frozen source readouts and one historical cipher architecture; **no newly recovered LP2 plaintext, authenticated key, complete inverse, or destination**. The [exact original-input SFT](../sims/lp2_p57_gimp_dissolve_seed_original_gate_sft.cjs) supplies source assertions and planted controls.
