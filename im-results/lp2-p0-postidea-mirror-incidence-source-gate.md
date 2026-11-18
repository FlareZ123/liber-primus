# p0 post-IDEA mirror-incidence source gate

**Agent 29, 18 November 2026. Classification: intermediate source-only topology result, not authenticated plaintext.**

The source-bounded p0-p2 bootstrap conditionally reaches `IDEA` on original cells `(15,20) -> (16,19) -> (17,18)` under key `U-A-A`. The last ciphertext cell is original rune `D` at `(17,18)`. This note asks a narrower question than the external 38-block proposal: once that endpoint is frozen, does the untouched 27x27 source itself determine any next key material before English is inspected?

It does. The result fixes a short **mirror-node key-source chain**, while leaving the next ciphertext start, direction and length unresolved.

## Source-only mirror census

Enumerate every axis-aligned or 45-degree three-cell node in the 27x27 original grid with equally spaced cells and equal outer runes, using every in-bounds radius. There are **479** such mirror nodes.

At the conditional `IDEA` source endpoint `D (17,18)`:

1. The cell participates in **exactly one** mirror node in the entire source, and is its center:
   `J (15,20) - D (17,18) - J (19,16)`, radius 2 on the down-left diagonal.
2. Of those two `J` outers, the upper `J (15,20)` is the center of **zero** mirror nodes.
3. The lower `J (19,16)` is the center of **exactly one** mirror:
   `OE (18,16) - J (19,16) - OE (20,16)`, vertical radius 1.
4. That same lower `J` touches exactly three mirror nodes total. After removing `J-D-J` and `OE-J-OE`, the only remaining one is
   `J (19,16) - B (23,12) - J (27,8)`, radius 4 on the same down-left diagonal.
5. The center `B (23,12)` itself touches no other mirror node.

This is a locally forced incidence chain. It is obtained from original rune equality and coordinates only.

## Derived keys

Apply the route's already-frozen center-totient and Möbius phase operation to the two forced nodes:

- `J-D-J -> J-OE-J`, phase 0.
- `OE-J-OE -> OE-I-OE -> OE-OE-I`, phase 2.

These are exactly the key-source nodes and aligned keys used by the external proposal for its next two claimed blocks, `OF` and `THE`. That agreement is new source-side support for the **key-node topology**. It does not authenticate those plaintext words, because the source still does not determine the corresponding ciphertext starts, read directions or stop lengths.

The shared `J (19,16)` also has only one further mirror incidence, `J-B-J`, which is the external proposal's later key node for both `END` and `DEATH`. This makes the local mirror graph more structured than a free key hunt, but it still does not supply a complete decipherment rule.

## Locked post-IDEA checksum: direct 12-rune interpretation fails

A separate pre-existing cross-text target leaves the next five words after `THE IDEA` at exactly:

```
12 runes
index sum 151
GP-prime sum 553
```

The simplest interpretation would make those five words one straight 12-rune continuation under a single mirror-derived key. A widened source-only control grants every mirror node centered on any of the **34 unique ciphertext cells already selected through IDEA**, all eight straight read directions from the IDEA source endpoint, and the same center-totient/Möbius key operation.

That family contains **35 candidate mirror nodes**. Boundary limits leave **105** complete 12-rune decryptions. **None** has both index sum 151 and GP sum 553.

Therefore the locked five-word residual cannot be satisfied as one direct 12-rune straight block inside this generous continuation family. If the proposed second passage is genuine, its five words must span multiple transitions or use a different source-authored operation.

## What this changes

The strongest new fact is the local source topology:

```
IDEA source endpoint D
  -> unique J-D-J
  -> unique outer J that is itself a mirror center
  -> OE-J-OE
  -> only remaining mirror at that shared J is J-B-J
```

This gives an original-input reason to consider the same key-source nodes that the external route uses immediately after IDEA. It is materially stronger than selecting those nodes because they decrypt to English.

The unresolved step is still decisive: no original clue yet fixes the next ciphertext cell, read direction, or word boundary. Do not promote `OF THE END IS DEATH` from this result alone.

## Reproduction

Run:

```
node sims/lp2_p0_postidea_mirror_incidence_sft.cjs
```

The SFT reads only `resources/liber-primus/lp2-corpus.json`, reproduces the conditional IDEA arithmetic, exhausts all 479 source mirror nodes, proves the local incidence counts above, derives the two forced keys, and performs the 105-candidate direct-12-rune checksum control.
