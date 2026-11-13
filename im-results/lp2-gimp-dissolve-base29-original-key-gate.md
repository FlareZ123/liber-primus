# The original GIMP Dissolve RNG as a frozen GP29 key source: direct test

**Status, 13 November 2026 (Agent16): one completed conditional original-cipher attack, negative.** No unknown plaintext, independently selected LP2 encryption key, or decipherment mechanism was recovered. This stops the *specific* model below; it does not exclude other uses of the artwork, metadata, image noise, altered plaintext registers, or a hidden external key.

## Why this particular key source was examined

A separate 2026 image study identifies the visible dot pattern on original solved physical p57 (archive \`74.jpg\`) as strongly compatible with historical **GIMP 2.8 Dissolve** noise, including a fixed **4096-entry MT19937 row-seed table** initialized with \`g_rand_new_with_seed(314159265)\`. The matched image offset is x+4, y−9; the source also records that **314159265 is a software default**, not a designer-selected secret. [Image study and detailed source-anchored measurements](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html); [historical 2017 GIMP code showing the already-existing initialization](https://mail.gnome.org/archives/commits-list/2017-February/msg00316.html).

The signed 2013 Cicada TCP stage independently documents **BASE29** with \`3301 → 3QO\` (digits 3,26,24 in standard 0–9,A–S notation). This permits one low-overhead *hypothesis*, rather than an unconstrained key search: treat each GIMP 32-bit row-seed output as **seven big-endian GP29 digits**, obtaining 28,672 potential pad symbols. Seven is the shortest fixed width covering every unsigned 32-bit integer. The original unsolved book has 12,956 GP29 rune symbols, so this pad can cover the whole book once without a period or reused key.

**Weak link:** no original Cicada text says to serialize the GIMP table as GP digits, use it as cipher state, or start it at p0. The GIMP match is evidence about image production only. The test is a literal bridge that would be decisive **if** it produced coherent unknown plaintext, and otherwise has the narrow negative scope reported here.

## Frozen operation and independent controls

The [single-file CommonJS reproducer](../sims/lp2_gimp_dissolve_base29_key_sft.cjs) reads \`resources/liber-primus/lp2-corpus.json\` unmodified; concatenates physical p0–55 in source order, excluding runeless p50; generates precisely 4096 32-bit outputs using the historical single-seed GLib MT19937 routine; and serializes each to seven BASE29 digits, most-significant first. The first ten 32-bit outputs are independently matched against local GLib \`g_rand_int\`:

\`\`\`text
3721122731 618219707 807213306 3144837749
3447982176 3230631767 755972506 1398685501
3196876378 1337812403
\`\`\`

The first 32-bit output becomes ordinal digits \`[6,7,12,4,23,16,27]\`; the 2013 BASE29 control gives \`3301 = [3,26,24]\`. Both complete GP29 operations use p0 as a zero-clock start and **no page reset, word skip or phase search**:

1. Direct source-pad subtraction: \`P_i = (C_i − K_i) mod 29\`.
2. Single feedback comparator, as a frozen alternative to a direct shift: \`P_i = (C_i − C_(i−1) − K_i) mod 29\`, initial \`C_−1=0\`.

The direct and feedback inverses exactly recover a synthesized GP29-native passage from the already-solved \`SOME WISDOM\` and re-encrypt their own unknown-cipher decodes without error. The native control passage's GP29 index of coincidence is **0.0582751** over 66 runes. A wrong software seed 314159266 was fixed as a negative control.

## Original ciphertext result

| Input/output (12,956 runes) | GP29 IoC | Most frequent rune count | E count | O count |
|---|---:|---:|---:|---:|
| Original cipher | 0.03447840 | 492 | 439 | 458 |
| Direct default-GIMP BASE29 pad | **0.03447043** | 484 | 433 | 484 |
| Feedback default-GIMP BASE29 pad | **0.03445545** | 481 | 460 | 433 |
| Wrong seed, direct pad | 0.03449290 | 479 or less (run exact script) | varies | varies |

The source-locked direct readout starts:

\`\`\`text
NUGEAEOOFEAXOETPXRIAESNGEAGSRDFHIDAIEAIJHRGLDAEEOESYYGOEXEAWEOEJNGIABIAIAPBCTERUJNDEAIAMNGLEABPLOUOIAJYYTHLOERAESRYTFWXEARGAEGC
\`\`\`

The comparator with ciphertext feedback begins:

\`\`\`text
NSIAINYIUXWMAOEEAHXNAEEAAOEUXIAEANGTWSPBEAIAEOCJIAMTHTWNBHNYMAWLTFUOIRFEAWTRIAUAEAEWEAXEFDWOSDAPTHNGHPCGEEOHBUTHPIOWOEDOERUTA
\`\`\`

Both remain nearuniform GP29 symbols, with no readable native prose or meaningful unknown-page phrase. The direct entire p55 output (76 source glyphs) is:

\`\`\`text
TEADUCFOXYEGXLNGAATHEOTOBGUELGSEAMOEXPCCMEORMTYAEIPIXJCOEGTIAEANGXAEANHBGUAEYOENOOLMEOEDMJML
\`\`\`

A separate source-generator check was run without fitting phase: treating historical \`g_rand_int_range(0,255)\` values \`0\` and \`1\` as predicted adjacent-equal-rune events gives **0/115** exact overlaps with the 86 original equalities (null expectation 0.763); the first actual GIMP row-seed stream likewise has **0/111** (expectation 0.737). These trigger tests use an additional unprescribed threshold and should not be mistaken for an identified cipher rule. They offer no support for using this artwork RNG as the doublet-exception clock.

## Decision

The precise default-seed GIMP-table **fixed-seven-digit BASE29 stream**, used with either one direct GP29 additive inverse or one ciphertext-feedback inverse from rune zero, does **not** decode native-LP2 prose. The key is publicly predictable and the original artwork only authenticates its presence in *rendering*, so no new cryptographic source-selected key or key clock has been established. Do not vary table orientation, seed, digit width, shifts, page resets or output alphabets without an **independent original source** selecting one; such a sweep would recreate the already-exhausted unconstrained keystream search.

The only actionable fork would be a newly authenticated Cicada instruction linking p57's GIMP Dissolve operation to **ciphertext encoding** (not simply page illustration). Otherwise use stronger source paths to locate an actual unknown-message key or reversible transform.
