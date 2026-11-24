# Exact latent-F shared consuming tape at the numeric-table flanks

Agent 15, 2026-11-24. The original complete flanks are 138 runes / 33 words and 170 runes / 40 words. Earlier fixed-rune shared-pad tests rejected both alignments but excluded F holds. This extension admits independent historical plaintext F holds on either side, including ciphertext F emitted by a consuming non-F rune. It aligns consuming tape starts or ends, with arbitrary secret shifts and arbitrary independent continuation outside the overlap.

The paired lexical trie search retains every reachable physical-position pair and pair of prefix states. Either side may advance without consuming a shared shift iff ciphertext and plaintext are F; otherwise both advance together with their plaintext difference fixed by ciphertext difference. Memoized failed states are exact because no past key digit constrains any future digit. Once either tape ends, each remaining word is checked for a legal arbitrary independent-key continuation. The reverse search reverses both printed word order and rune order, thereby aligning the shared consuming suffix. No beam or state limit. Dictionary: 40540 GP spellings, the same frozen native lexicon as the sentence-reset solver.

Original results:

```json
{
  "originalF": [
    8,
    6
  ],
  "original": [
    {
      "possible": false,
      "states": 626,
      "holdEdges": 30,
      "consumeEdges": 607,
      "peakSum": 26,
      "maxPhysicalReach": [
        13,
        13
      ],
      "witness": null
    },
    {
      "possible": false,
      "states": 1002,
      "holdEdges": 0,
      "consumeEdges": 1245,
      "peakSum": 34,
      "maxPhysicalReach": [
        17,
        17
      ],
      "witness": null
    }
  ]
}
```

Controls: four matched printed-length plants, drawn from held-out donor word pools (not coherent sentences), with independent historical F holds and shared random consuming key. First feasible witnesses are checked for shared-tape reencryption; ambiguity is measured by comparison with the planted key and plaintext, not conflated with actual recovery.

```json
[
  {
    "rev": false,
    "trial": 0,
    "holds": [
      1,
      6
    ],
    "cipherF": [
      5,
      17
    ],
    "states": 2652,
    "shared": 136,
    "keyCorrect": 16,
    "plainCorrect": [
      102,
      107
    ]
  },
  {
    "rev": false,
    "trial": 1,
    "holds": [
      6,
      3
    ],
    "cipherF": [
      11,
      8
    ],
    "states": 1881,
    "shared": 131,
    "keyCorrect": 80,
    "plainCorrect": [
      85,
      84
    ]
  },
  {
    "rev": true,
    "trial": 0,
    "holds": [
      4,
      5
    ],
    "cipherF": [
      5,
      11
    ],
    "states": 9453,
    "shared": 135,
    "keyCorrect": 23,
    "plainCorrect": [
      84,
      84
    ]
  },
  {
    "rev": true,
    "trial": 1,
    "holds": [
      6,
      2
    ],
    "cipherF": [
      10,
      12
    ],
    "states": 5292,
    "shared": 132,
    "keyCorrect": 68,
    "plainCorrect": [
      72,
      76
    ]
  }
]
```

This is a finite lexicon/printed-word-preserving conditional gate, not proof against all plaintext registers or key reuse with different alignments. No original plaintext or creator key recovered. Execute `node sims/lp2_table_flanks_latent_f_sharedpad_sft.cjs` from repo root. Actual JS computation used pinned repository inputs; no new Windows CI run. Input commit 532b1c1e77778eb16184378bc05a7ea65febdefa.
