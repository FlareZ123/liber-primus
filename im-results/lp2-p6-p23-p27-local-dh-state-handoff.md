# P6 → p23 → p27 local DH23 branch selector

**Agent16, 28 November 2026. Classification: source-only structural state handoff; no unknown plaintext, cipher key, body-text inverse, or continuation endpoint recovered.**

## Decision

Three independently preserved original-source observations now compose into a tighter causal chain than their earlier separate readings:

1. **P6 predicts the p23 red heading.** P6's four red word lengths are `[4,1,4,2]`. Adjacent forward `H(x,y)=[x-y,x+y] mod29` gives `[3,5,2,6]=[e,g,K,a]`; swapping the two output pairs gives `[2,6,3,5]=[K,a,e,g]`, exactly the p23 four-word red heading. The charged eight pair-order/orientation conventions leave this one match, and the full 2,802-window manuscript census makes p6 the only H-family producer and p23 the only raw `[2,6,3,5]` occurrence.

2. **The p24–p26 mayfly count triangle independently supplies A.** Original rune counts `[270,273,265]` have edge differences `p24↔p25=3=e`, `p24↔p26=5=g`, `p25↔p26=8`. Using the p6→p23 typed values `g=5,a=6,K=2,e=3` and the established DH modulus `p=23`, ordinary DH predicts `A=g^a mod p=8`, exactly the held third edge. P24–26 is the unique contiguous three-page window among 54 whose unordered count-difference set is `{3,5,8}`.

3. **That state leaves exactly two ordinary DH branches for b/B, and p27 selects one literally.** With `(p,g,a,A,K)=(23,5,6,8,2)`, solving both `A^b=K` and `B^a=K` over `b=1..22` leaves exactly:
   - `(b,B)=(4,4)`;
   - `(b,B)=(15,19)`.

   P27's opening red rubric has source fields
   `red length = 19`, `red GP0 sum mod29 = 15`, and the immediately following black word has `GP0 sum mod29 = 2`. Thus its literal typed triple is `[B,b,K]=[19,15,2]`, selecting the second DH branch.

The important change is in the status of the p27 `(19,15,2)` observation. Earlier work could only say that p27's red length/sum/successor sum *retrospectively resemble* `(B,b,K)`. In the composed chain, p23/p24–26 first reduce the DH state to **two exact b/B possibilities**. P27 then acts as a finite branch selector rather than an unconstrained lookup for familiar state numbers.

## Finite source controls

The exact reproducer scans all **16 original red spans** on physical p0–55.

Grant both possible assignments of p27's two red observables:

```
(red length, red sum mod29) = (B,b)
or
(red length, red sum mod29) = (b,B)
```

and grant both surviving DH branches `(b,B)=(4,4)` and `(15,19)`.

Across all 16 red spans there is exactly **one** two-field hit:

```
p27 start0: (length,sum) = (19,15) = (B,b)
```

Requiring the first following-black-word residue `K=2` leaves the same single hit:

```
p27 start0: [length, red-sum, successor-sum] = [19,15,2] = [B,b,K].
```

This charge matters because it does not simply ask whether p27 contains 19 and15 somewhere. It fixes the two DH alternatives first, grants the field swap, then applies the same observable types to every red span.

## Human-solve-path interpretation and caveat

This is a plausible **state handoff**, not a decryption:

```
p6 red lengths
  --adjacent H + pair swap-->
p23 [K,a,e,g]
  --ordinary DH, with p=23-->
A=8
  --p24–26 source count triangle confirms [e,g,A]-->
two viable (b,B) branches
  --p27 red length/sum + following-black residue-->
(b,B,K)=(15,19,2).
```

The local objects are visible or countable source features, and the arithmetic is ordinary DH once its field roles are granted. That is materially better constrained than assigning p27's 19/15 after looking at the completed state.

The remaining weakness is still important: **the semantic role labels are post-discovery.** Neither p6 nor p23 prints the words `K,a,e,g`, and no first-party instruction says that red length, GP0 sum, and following-black sum should be read as `B,b,K`. The p15 red/grid state circuit now supplies an independent original-artifact reconstruction of the same DH state, which strengthens the shared-state interpretation but does not convert this route into an authored cipher opcode.

Accordingly, do not promote this result to recovered plaintext or a body decoder. Its useful consequence is narrower: p27 is now a source-local discriminator between two exact DH continuations. A next operation should consume the selected `(b,B,K)` on a receiver fixed independently of plaintext, rather than mining another state equality.

## Reproduction

Run:

`node sims/lp2_p6_p23_p27_local_dh_state_sft.cjs`

The test reads the canonical LP2 corpus, ink annotations, and transcription; reconstructs p6/p23 red-word lengths; derives the p24–p26 count edges; enumerates the complete DH b/B branch set; and charges both p27 field orientations across all 16 red spans.

Related source reports:

- `im-results/lp2-p6-adjacent-h-length-schedule-p23.md`
- `im-results/lp2-p24-p26-mayfly-dh23-count-triangle.md`
- `im-results/lp2-p6-p27-original-red-rubric-link.md`
- `im-results/lp2-p15-red-dh-state-packet.md`
