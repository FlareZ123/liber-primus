# Historical GIMP Dissolve source seed as an original LP2 stream-key candidate

**23 November 2026, Agent41. Classification: source-motivated bounded negative on 8 direct GP29, 8 no-repeat GP28, and 5 table-byte receivers. No recovered unknown LP2 plaintext, authenticated cipher key, or final destination.** This study tests whether the known image-production pseudorandom stream operates as an actual reversible manuscript cipher or external 256-byte table key, without treating its software default as an authored instruction.

**Prior work and genuinely new scope.** [Agent21's 17 November source-seed audit](lp2-final-mayfly-gimp-dissolve-directkey-gate.md) had already established the GIMP/GLib seed, verified the exact first eight MT words, and rejected twelve direct GP29 additive pads based on the **4096-entry row-seed table**, little-endian and big-endian serializations. This report does not claim a new software fingerprint or a first source seed test. Its separate bounded additions are (1) *uninterrupted* MT draws instead of periodic reuse of the GIMP row-seed table, with physical-page vs book RNG clocks, (2) ciphertext-feedback inverses, (3) an exact GP28 nonrepeat chain with 86 preserved equality exceptions, and (4) source-shaped p50 GIMP raster thresholds against all 256 original bytes. All are negative; the existing Agent21 gate remains the primary provenance audit. The two reports together retire this wider fixed-seed direct-consumer family without treating the image-rendering source as a cipher key.

## Source-to-receiver motivation

The published independent [mayfly stippling investigation](https://secra.tech/research/liber-primus-strongest-findings/) reports a strong registration of the original p57 dissolving insect to the fixed pseudorandom Dissolve pattern in historical GIMP. [GIMP's 2013 source-control record](https://mail.gnome.org/archives/commits-list/2013-May/msg02217.html) explicitly seeds the 4,096-entry row table using `g_rand_new_with_seed(314159265)`, then seeds a fresh row-specific `GRand` with `random_table[y mod4096]` and calls `g_rand_int_range(0,255)`. The [period GLib implementation](https://fuchsia.googlesource.com/third_party/glib/+/refs/tags/2.43.3/glib/grand.c) uses a 32-bit MT19937 stream and an unbiased modulo/rejection range conversion.

This is a concrete historical algorithm that a 2014 player could reproduce if they recognized the stippling software. Its **source-first limitation** is severe: 314159265 is a GIMP default used in image compositing; the original manuscript does not say to employ that seed as a GP29 keystream, and mayfly p57 is itself one of the two known solved LP2 pages. The other 56 pages and p50 grid have no independently selected pixel-to-symbol address convention. Therefore this is a finite, explicitly conditional cipher-consumer test, with no brute-forced offsets or arbitrary secret S-box.

## Frozen reversible GP29 receiver and exact original outcome

On every original 55 rune-bearing unknown physical page p0–p55, concatenate all **12,956** unchanged GP29 indices without altering printed rune values, word breaks, carries, or page order. Fix K as `g_rand_int(seed314159265) mod29`, with either (a) one continuous RNG book clock or (b) an RNG restart at each physical page. Check these four direct inverse types, each sign ±1:

- **Additive inverse:** `P_i = (C_i ± K_i) mod29`.
- **Previous-ciphertext feedback inverse:** `P_i = (C_i - C_(i-1) ± K_i) mod29`, setting `C_(i-1)=0` at page start.

For each case, the independent native p57 95-rune cleartext is encrypted, split into two held-out control chunks, and recovered 95/95. The original unknown 12,956 runes are decoded and then **all exactly re-encrypted** under the frozen inverse. Complete exact reencryption establishes implementation correctness only.

| Clock | Model | Addition sign + IoC | Addition sign − IoC |
|---|---|---:|---:|
| Book global | Direct | 0.0344628 | 0.0344640 |
| Physical page reset | Direct | 0.0345112 | 0.0344862 |
| Book global | Ciphertext feedback | 0.0344914 | 0.0344833 |
| Physical page reset | Ciphertext feedback | 0.0345116 | 0.0344671 |

Original ciphertext IoC **0.0344783979**; actual native solved p57 IoC **0.0627099664** (its length is only95, so use as a source-native implementation positive rather than a length-matched formal significance test). All eight complete-original outputs remain near uniform GP29, with no long plaintext. These outputs retire only the eight literal key rules, not hidden GIMP image coordinates, alternate serializations or further cipher layers.

## Frozen 32×8 p50-byte source counterpart

Read all 256 printed table cells in unchanged row-major order using the already-established conditional base60→byte convention. Five predeclared GIMP-native byte streams are (i) the initial 256 MT words' low8, (ii) the initial 256 MT words reduced to historical `g_rand_int_range(0,255)`, (iii) for each printed row y=0..31 and column x=0..7 a fresh MT with the GIMP 4,096-seed table entry for row y, emitting low8, (iv) the same row-state emitting historical range255, (v) the same row-state emitting high8.

| Fixed key stream | Equal source cells /256 | Printable cells after XOR /256 | Longest printable ASCII run |
|---|---:|---:|---:|
| Initial MT low8 | 1 | 87 | 4 |
| Initial MT range255 | 0 | 95 | 4 |
| GIMP 32×8 row MT low8 | 1 | 95 | 6 |
| GIMP 32×8 row MT range255 | 2 | 92 | 5 |
| GIMP 32×8 row MT high8 | 1 | 92 | 4 |

No direct copied key/table, readable bytewise XOR or obvious file header emerges. The five choices are historically typed serialization choices; scanning unknown row offsets and mixtures would add an unsupported key-hunt degree of freedom.

## Additional source-constrained no-repeat GP28 receiver

The GP29 direct/feedback experiments above preserve all rune values but do not explain the original **86/12,901 matching adjacent within-page ciphertext pairs**. A second explicit *reversible* decoder instead treats the first original rune of each page as a preserved IV, and each following nonzero ciphertext difference (1..28) as a member of a 28-symbol alphabet in printed GP order. The zero difference is the 29th symbol F (index0), so the 86 genuine exceptions remain completely reconstructible without hidden side bits. For all nonzero differences `D_i=(C_i-C_(i-1)) mod29` it yields `P_i=1+((D_i-1 ± K_i) mod28)`, with a zero difference emitting F. The authentic GLib MT seed314159265 advances once per original non-IV rune, as either native `g_rand_int()%28` or the actual GIMP range255 threshold reduced modulo28. The RNG is global or page-reset and sign is fixed ±1; these **eight** original-input constructions cover no other hidden parameters.

The original 12,901 resulting rune slots have exactly **86 F** and all eight decoder outputs remain near-uniform over the 28 non-F symbols:

| Native key arithmetic | Book continuous, negative/positive sign | Page-reset, negative/positive sign |
|---|---:|---:|
| `g_rand_int()%28` | 0.035308903 / 0.035286550 | 0.035265435 / 0.035280001 |
| `g_rand_int_range(0,255)%28` | 0.035247902 / 0.035338730 | 0.035301163 / 0.035305490 |

The unchanged 55 original page-IV runes are retained independently, so all 12,956 original runes **re-encrypt exactly**. Each of the eight complete models also correctly round-trips a separate genuine **95-rune native solved p57 plaintext** through the matching synthetic encoder. This does not reproduce the original author's cipher. The sharp weakness is independent of the seed: mapping every rare source repeat to literal GP F would yield only **86 F in 12,901 recovered runes**. A different exception semantics may be viable but would require an authored locator, not a freely assigned alphabet.

[Additional Windows Node22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45091490404). The source-led MT candidate is now tested both in direct GP29 and the no-repeat-compatible GP28 chain architecture. Neither recovers contiguous original plaintext.

## Reproducer and next research fork

The single-run read-only [Node22/CommonJS original-source SFT](../sims/lp2_gimp_dissolve_seed314159265_original_key_gate_sft.cjs) checks GLib's first eight actual `g_rand_int` draws, every literal GP29 receiver over the unchanged full book, native p57 positive plants, full original forward reconstruction, and the authentic 256-cell table tests. No network access, fake ciphertext, unconstrained phase search, or additional files required.

**Research decision:** The page57 image-production fingerprint does **not** supply a direct GP29 additive/feedback cipher seed or unshifted 32×8 table XOR key. The missing causal bridge is an author-origin instruction to convert the raster PRNG into *specific manuscript symbol coordinates and a typed cryptographic operation*. A new source-located original-page prediction or independently confirmed output would be required before further GIMP-seeded cryptanalysis. Continue seeking entirely independent source operations and original plaintext.
