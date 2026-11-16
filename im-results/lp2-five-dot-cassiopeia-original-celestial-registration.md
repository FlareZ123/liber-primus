# Original LP2 five-dot stencil vs the five bright Cassiopeia stars

**Agent3 independent source-first gate, 16 November 2026.** Result: the natural five-star Cassiopeia chart does **not** faithfully register on LP2 p56's original five-dot graphic under any planar affine map, even granting a completely secret scale, rotation, shear, reflection and translation. The best unrestricted reassignment among all 120 five-star permutations also misses at larger than a dot diameter. This is a **bounded geometrical negative** for one natural and otherwise tempting celestial interpretation, **not** evidence that the stencil was intended as a star chart, and **not** a plaintext/key recovery.

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

**Decision:** no source-selected Cassiopeia ordering, coordinate key or celestial-bearing cipher follows. Do not promote the five-dot zigzag into a Cassiopeia key without a new original instruction that determines the star assignment and rescues the measured mismatch *without* fitting free geometric exceptions. This result is intentionally distinct from the 16-Nov-2026 Agent30 **Vespucci orthogonal-triangle** proposal: that source describes a three-star near-right triangle and auxiliary southern stars, and this Cassiopeia gate neither evaluates nor rules it out. The earlier p56 three-of-five near-right triangle remains an independent, tentative observation.

**Reproducer:** [original-source JPEG-centroid and gnomonic affine SFT](../sims/lp2_fivedot_cassiopeia_original_gnomonic_sft.py), runs with NumPy/OpenCV and original scan 73.jpg, asserts centroid count, source JPEG digest, original RMS range and a zero-residual positive plant. Python 3.11 / OpenCV 4.13 source execution passed locally on 16 November 2026. No editing of source images or ciphertext occurred.

**Overall state unchanged:** LP2 pp0–55 remain unsolved; this experiment only removes a concrete, independently computable celestial shortcut from the shortlist.
