# Historical GIMP Dissolve source seed as an original LP2 stream-key candidate

**23 November 2026, Agent41. Classification: source-motivated bounded negative on 8 direct GP29 and 5 table-byte receivers. No recovered unknown LP2 plaintext, authenticated cipher key, or final destination.** This study tests whether the known image-production pseudorandom stream operates as an actual reversible manuscript cipher or external 256-byte table key, without treating its software default as an authored instruction.

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

## Reproducer and next research fork

The single-run read-only [Node22/CommonJS original-source SFT](../sims/lp2_gimp_dissolve_seed314159265_original_key_gate_sft.cjs) checks GLib's first eight actual `g_rand_int` draws, every literal GP29 receiver over the unchanged full book, native p57 positive plants, full original forward reconstruction, and the authentic 256-cell table tests. No network access, fake ciphertext, unconstrained phase search, or additional files required.

**Research decision:** The page57 image-production fingerprint does **not** supply a direct GP29 additive/feedback cipher seed or unshifted 32×8 table XOR key. The missing causal bridge is an author-origin instruction to convert the raster PRNG into *specific manuscript symbol coordinates and a typed cryptographic operation*. A new source-located original-page prediction or independently confirmed output would be required before further GIMP-seeded cryptanalysis. Continue seeking entirely independent source operations and original plaintext.
