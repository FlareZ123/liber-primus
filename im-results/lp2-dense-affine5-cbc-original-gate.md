# Exhaustive five-rune affine CBC receiver on the numerical chapter

Distinct from the already tested fixed historical square CBC and from direct affine-five projections: the unknown dense inverse is `P_i=M*C_i+b-C_(i-1) mod 29`. Natural complete chapter pp33–39 (336 five-rune blocks) selected by the repeated 1033/3301 motif and historical order-five squares; pp3–7 (229 blocks) withheld. Each chapter's first block is omitted because its IV is unknown. No phase, arbitrary transposition or key material claimed by this experiment.

Enumerate all 29^5−1 nonzero rows for each lane. For each row count unordered equal-symbol pairs of `a*C_i-C_(i-1)[j]` on n=335 blocks. Bias does not change collisions. For d=5, Cauchy–Schwarz gives the all-key pooled IoC bound `(2*d*sum(max_pairs_j)+d*(d-1)*n)/(d*n*(d*n-1))`, even allowing arbitrary post-row bijections and relaxing matrix invertibility. C++ splits each dot product into precomputed two- and three-coefficient parts; scans 102,555,740 rows per tape. Retain top32 per lane by collision count; fit all offsets, retain four unigram-ranked offsets per row, then top16 labels per lane using independent first-half Gibran GP unigram counts. Exact conditional-bigram dynamic programming over the 16 labels per lane maximizes train score including cross-block transitions. Freeze recovered key for independent chapter. This candidate-selection algorithm is heuristic; the collision ceiling is exhaustive.

Native solved GP plant uses fixed dense invertible key and distinct chapter IVs printed in output. Actual C++ scan executed locally against repository-derived tapes (FNV-1a: original a88adc88, holdout 7c0a9cad, native fd6a4160), then top-row output used in actual JS fit against the repository sources. Each scan took approximately 14 seconds on four CPU quota. Source and wrapper reproduce end-to-end. The first calculation of the collision bound omitted the term d(d−1)n; the corrected formula and numerical values below include it. The measured key recovery, replay and scores are unchanged.

```json
{
  "original": {
    "rowsPerLane": 20511148,
    "topRows": [
      {
        "a": [
          26,
          9,
          7,
          11,
          25
        ],
        "pairs": 2297
      },
      {
        "a": [
          3,
          26,
          18,
          20,
          25
        ],
        "pairs": 2276
      },
      {
        "a": [
          10,
          1,
          28,
          7,
          22
        ],
        "pairs": 2314
      },
      {
        "a": [
          15,
          23,
          19,
          19,
          24
        ],
        "pairs": 2329
      },
      {
        "a": [
          21,
          17,
          11,
          28,
          24
        ],
        "pairs": 2283
      }
    ],
    "pooledUpper": 0.04339949000517128,
    "key": {
      "M": [
        [
          24,
          15,
          7,
          18,
          4
        ],
        [
          24,
          2,
          5,
          27,
          6
        ],
        [
          25,
          20,
          1,
          4,
          12
        ],
        [
          12,
          11,
          16,
          12,
          20
        ],
        [
          18,
          25,
          26,
          7,
          21
        ]
      ],
      "b": [
        7,
        11,
        23,
        21,
        27
      ]
    },
    "invertible": true,
    "train": {
      "n": 1675,
      "ioc": 0.03704844950872876,
      "mean": -4.1968001093053315
    },
    "holdout": {
      "n": 1140,
      "ioc": 0.03514779045946737,
      "mean": -4.499097762004218
    }
  },
  "plant": {
    "rowsPerLane": 20511148,
    "topRows": [
      {
        "a": [
          0,
          11,
          12,
          24,
          0
        ],
        "pairs": 3250
      },
      {
        "a": [
          17,
          20,
          0,
          17,
          0
        ],
        "pairs": 3327
      },
      {
        "a": [
          5,
          20,
          2,
          13,
          21
        ],
        "pairs": 3966
      },
      {
        "a": [
          21,
          4,
          22,
          19,
          4
        ],
        "pairs": 3159
      },
      {
        "a": [
          26,
          23,
          26,
          3,
          6
        ],
        "pairs": 3311
      }
    ],
    "pooledUpper": 0.06306460528896735,
    "key": {
      "M": [
        [
          0,
          11,
          12,
          24,
          0
        ],
        [
          17,
          20,
          0,
          17,
          0
        ],
        [
          5,
          20,
          2,
          13,
          21
        ],
        [
          21,
          4,
          22,
          19,
          4
        ],
        [
          26,
          23,
          26,
          3,
          6
        ]
      ],
      "b": [
        16,
        15,
        20,
        2,
        17
      ]
    },
    "invertible": true,
    "train": {
      "n": 1675,
      "ioc": 0.06085415217817722,
      "mean": -2.6087399403384537
    },
    "holdout": {
      "n": 1140,
      "ioc": 0.06218135329544229,
      "mean": -2.671862475943577
    },
    "trueKey": {
      "M": [
        [
          0,
          11,
          12,
          24,
          0
        ],
        [
          17,
          20,
          0,
          17,
          0
        ],
        [
          5,
          20,
          2,
          13,
          21
        ],
        [
          21,
          4,
          22,
          19,
          4
        ],
        [
          26,
          23,
          26,
          3,
          6
        ]
      ],
      "b": [
        16,
        15,
        20,
        2,
        17
      ],
      "ivs": [
        [
          25,
          26,
          13,
          28,
          6
        ],
        [
          26,
          7,
          1,
          25,
          14
        ]
      ]
    },
    "trainExact": 1675,
    "holdoutExact": 1140
  }
}
```

**Decision:** original all-key pooled IoC ceiling 0.04339949; original frozen heldout IoC 0.03514779. Plant 1675/1675 training and 1140/1140 heldout exact. No unknown plaintext. Retire this natural-framed dense CBC-five receiver under native GP frequency assumptions; no further arbitrary matrices/offsets/IVs on this branch. Not a universal exclusion of layered ciphers or alternative framing.

Reproducer: `sims/lp2_dense_affine5_cbc_inverse_sft.cjs` (Node.js and C++17/OpenMP compiler). Scan source `sims/lp2_dense_affine5_cbc_scan.cpp`.
