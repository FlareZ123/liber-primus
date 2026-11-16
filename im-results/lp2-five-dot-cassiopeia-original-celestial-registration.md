# Original LP2 five-dot stencil vs Cassiopeia and Southern Cross star geometry

**Agent3 independent source-first gate, 16 November 2026.** Result: the natural five-star Cassiopeia chart does **not** faithfully register on LP2 p56's original five-dot graphic under any planar affine map. Five-star Southern Cross and 3+2 Southern Cross/Pointer alternatives also fail literal point-center registration, even granting a completely secret scale, rotation, shear, reflection and translation. Cassiopeia's and Crux's 120-permutation optima exceed a printed dot diameter in RMS. A cross-plus-pointer option narrowly lowers this to about one diameter, but only under interleaved, postselected star assignments contrary to the source's 3+2 geometry. This is a **bounded geometrical negative** for three natural and otherwise tempting celestial interpretations, **not** evidence that the stencil was intended as a star chart, and **not** a plaintext/key recovery.

## Why this candidate is testable

The original p56 source prints five same-size solid dots in a distinctive zigzag. Other original pages p7 and p23 reuse the same stencil under reflections, and the glyphs do not name any stars. The five principal bright stars of **Cassiopeia** (Caph / β, Schedar / α, Cih / γ, Ruchbah / δ, Segin / ε) form a widely recognized five-star **W** whose ordered geometry is fixed by published right ascensions and declinations. A literal celestial reading would give human solvers a source-independent naming/order rule, potentially yielding a candidate 5-symbol key. Here we test that necessary drawing compatibility *before* inventing such a key.

Primary stellar coordinates: [Farinacci, *Guide to Observing Deep-Sky Objects*, Cassiopeia star table](https://naedine.astrolab.ru/sites/default/files/books/farinacci.pdf), using its J2000 principal-star RA/Dec values. Primary manuscript source: unchanged scan [LP2 p56, archive 73.jpg](../resources/liber-primus/73.jpg), SHA-256 `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc`.

## One fixed original-input test

Threshold original p56's scan at grayscale <160 within source coordinates x680–1849/y2300–2849. The five connected black-dot components have areas 3000–5000 pixels, with no ambiguity or drawn adjacency lines. Their centroids, left-to-right in source pixel coordinates, are:

`(873.29,2517.01), (921.21,2708.07), (1103.98,2447.32), (1408.11,2747.28), (1603.92,2686.57)`.

Compute the *gnomonic* tangent-plane projection of the five bright stars about their mean RA/Dec, preserving their published position order β,α,γ,δ,ε. Fit a full two-dimensional affine transform by least squares. Such a transform is deliberately more flexible than a map's usual rotation+uniform scale. The source's longest dot-center separation is **750.048 pixels**; original dot diameters are roughly 67–70 pixels.

| Geometric assignment | RMS Euclidean error per source dot | Maximum one-dot error |
| --- | ---: | ---: |
| Natural β,α,γ,δ,ε star order → left-to-right original marks | **88.877 px** (11.85% of 750.048 span) | **167.575 px** |
| Arbitrary one-to-one star assignment, minimum over all 5! = 120 postselected matches | **78.744 px** | Not used as a claim of exact fit |
| Artificial affine image of all five sky points, same least-squares inverse | **5.6×10⁻¹³ px** | Exact synthetic positive |

The natural candidate's third point lies about **168 px** from its optimized predicted position, around **2.4 printed dot diameters**. The unrelated 120-permutation optimization still leaves **79 px RMS**. These are objective disagreements with the literal affine-star-map proposal; allowing an arbitrary nonlinear warp or hand-drawn decorative distortion could of course make almost any five-dot figure match some sky pattern, losing a discriminating key rule.

## Southern Cross and the visually suggested 3+2 split

A documented 2019 interview proposed a constellation relation for the same five-dot motif, including a disputed reading of *Salvator Mundi*'s orb as the Southern Cross. This creates an independently specific alternative to a Cassiopeia W. Test source-standard J2000 sky positions, again using the same literal p56 source centroids and **the same unrestricted affine-fit code**, before attempting a star-name cipher.

- **Five principal Crux stars:** α Acrux, β Mimosa, γ Gacrux, δ Imai and ε Ginan. The first four positions come from [SIMBAD Acrux](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Acrux), [SIMBAD β Crucis](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=Beta+Crucis&submit=SIMBAD+search), [SIMBAD γ Crucis](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=Gamma+Crucis), and [Crux J2000 star table](https://freestarcharts.com/component/content/article/14-guides/constellation/11-crux-constellation-guide); ε uses [Ginan's J2000 reference](https://theskylive.com/sky/stars/ginan-epsilon-crucis-star).
- **Three Crux stars plus the Southern Pointers:** α, β and γ Crucis, then α Centauri and β Centauri. This is a real navigation asterism family, but the choice of three among four cross points is provisional and not specified by the manuscript. The two pointers are clearly separate stars, offering a source-independent candidate for the print's three leftmost and two rightmost points.

The preregistered five-star index sets, gnomonic projection and complete 120-permutation affine minima yield:

| Fixed sky subset | Best RMS over any of 5! star-to-dot assignments | Extra source-visible constraint |
| --- | ---: | --- |
| Cassiopeia α/β/γ/δ/ε | **78.744 px** | Earlier result; RA-ascending β,α,γ,δ,ε ordering is 88.877 px |
| Crux α/β/γ/δ/ε | **79.587 px** | Natural α,β,γ,δ,ε→x-order RMS **219.944 px** |
| Crux α,β,γ + Centaurus α,β | **63.480 px** | The best arbitrary assignment **interleaves** Crux and Centaurus dots, contrary to the visible 3+2 grouping |
| Same five Crux/Centaurus stars with all three Crux on the left and both pointers on the right | **84.728 px** | Best of the **12** naturally grouped assignments |

The last three tested readings all use identical original p56 dots, with **no rune-language scoring, key search or after-the-fact geometric warp**. The apparently lower 63.480 px score is not a successful literal sky chart: its best five-star assignment interleaves groups that the visible split would distinguish; under the preselected 3+2 interpretation the RMS rises to 84.728 px. A 63 px residual is close to one original ink dot diameter and cannot be argued into a unique celestial key. More general hand drawings are not excluded. A precisely authored five-star mapping would need independent historical documentation, not a progressively freer fit.

This does **not** falsify Vespucci's independently proposed 1504 **three-star** right-triangle analogy, which tests different period imagery and an explicit angular claim. It also does not assert that the 2019 interview is creator-authenticated.

**Decision:** no source-selected Cassiopeia, Crux or Crux-plus-pointer ordering, coordinate key or celestial-bearing cipher follows. Do not promote the five-dot zigzag into a star-name key without a new original instruction that determines the star assignment and rescues the measured mismatch *without* fitting free geometric exceptions. This result is intentionally distinct from the 16-Nov-2026 Agent30 **Vespucci orthogonal-triangle** proposal: that source describes a three-star near-right triangle and auxiliary southern stars, and this Cassiopeia gate neither evaluates nor rules it out. The earlier p56 three-of-five near-right triangle remains an independent, tentative observation.

**Reproducer:** [original-source JPEG-centroid and gnomonic affine SFT](../sims/lp2_fivedot_cassiopeia_original_gnomonic_sft.py), runs with NumPy/OpenCV and original scan 73.jpg, asserts centroid count, source JPEG digest, both constellation RMS ranges, the constrained Southern Pointer 3+2 fit, and a zero-residual positive plant. Python 3.11 / OpenCV 4.13 Cassiopeia source execution and independent numerical Southern Cross projection check passed locally on 16 November 2026. The consolidated source SFT's new Southern Cross assertions use the same original source-coordinate routine. No editing of source images or ciphertext occurred.

**Overall state unchanged:** LP2 pp0–55 remain unsolved; this experiment only removes a concrete, independently computable celestial shortcut from the shortlist.
