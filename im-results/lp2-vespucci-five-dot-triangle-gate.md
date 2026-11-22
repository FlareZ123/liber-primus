# LP2 five-dot emblem: partial Vespucci triangle resemblance, failed five-point map

**Classification:** intermediate geometric observation; no plaintext, key, cipher operation, or destination recovered.

## Human solve-path hypothesis

The repeated five-dot stamp on LP2 p7, p23, and p56 naturally invites a search for a five-star asterism. The p56 orientation has a visually salient 3+2 split: its first three dots form a near-right triangle, followed by two dots. This resembles the structure in Amerigo Vespucci's 1504 *Mundus Novus* account: three stars forming an orthogonal triangle, followed by two other stars.

Neri's 2026 preprint proposes identifying the first group as **β Hydri, α Hydri, and α Tucanae**, and the subsequent pair as **γ Hydri** and **α Reticuli** (with **α Pictoris** discussed as an alternative). This is an external historical interpretation, not a Cicada-authenticated instruction.

## Inputs

- LP2 p56 original image: `73.jpg`. Five dark circular dot centroids, in image pixels and left-to-right order:
  `(873.2619,2517.0000)`, `(921.1467,2708.0625)`, `(1103.9297,2447.2149)`, `(1408.0673,2747.2780)`, `(1603.9248,2686.5000)`.
- Centroids were measured from grayscale pixels below 80, retaining the five near-circular connected components with area 2,000–4,000 px.
- Star positions are J2000 catalogue coordinates, projected stereographically from the South Celestial Pole. A reflected similarity transform is allowed for page orientation.
- The repeated p7/p23/p56 motif and its reflection relationship are already documented in [the five-dot source bridge](lp2-mirrored-five-dot-original-page-bridge.md); this report tests only the new astronomical lead.

## Results

The first three p56 dots have angles **92.763°, 49.090°, 38.148°**. The candidate star triangle has projected angles **90.414°, 48.730°, 40.856°**. Maximum difference between sorted angle sets: **2.709°**.

Among all ten possible three-dot subsets, the first three (indices 0, 1, 2) are the best match. A reflected similarity fit from those three stars to those three dots has **4.689 px RMS** residual. This is a source-motivated partial resemblance, not a recovered cipher mechanism.

The same transform fails to place the two subsequent stars on the two remaining dots:

| Candidate star | Predicted image point | Actual dot | Error |
|---|---:|---:|---:|
| γ Hydri | (765.5, 2606.8) | (1408.1, 2747.3) | **657.7 px** |
| α Reticuli | (736.6, 2746.7) | (1603.9, 2686.5) | **869.4 px** |
| α Pictoris alternative | (536.3, 2671.3) | (1603.9, 2686.5) | **1067.8 px** |

The full 3+2 motif is therefore **not** a literal five-star chart under the same natural projection and page transform.

## Decision

- **Retain cautiously:** the p56 three-dot subset may allude to the orthogonal triangle in *Mundus Novus*.
- **Do not claim:** the complete five-dot emblem maps to Vespucci's five proposed stars.
- **No cryptanalytic consequence:** the star names or coordinates specify no reversible operation, key, or ciphertext selection. No plaintext is recovered.
- Do not expand into unconstrained star-catalogue searches or fitted projective maps. Continue only if an independent Cicada source identifies the two auxiliary points or supplies a specific operation.

## Reproduction

Run from the repository root:

```sh
python3 sims/lp2_vespucci_five_dot_geometry_sft.py
```

The script uses only the Python standard library.

## Sources

- Neri, “Amerigo Vespucci and the discovery of the Southern Sky” (2026 preprint): https://arxiv.org/abs/2604.11826
- 1504 *Mundus Novus* scan: https://archive.org/details/mundusnouus00vesp
