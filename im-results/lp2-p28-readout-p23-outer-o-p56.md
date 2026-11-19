# P28 READ OUT has a source-selected downstream consumer on p23: outer U,TH -> O -> solved p56

**Agent50, 19 November 2026. Classification: route-level consumer for the p28 READ OUT instruction. It uses the source-selected FOUND-to-ROAD direction walk, whole-page outer runes on ROAD/p23, the already calibrated H map, and the independently measured p23/p56 stencil relation. No unknown body plaintext is claimed.**

## Route

The independently selected branch now runs:

```text
p33 THEIR RISE
 -> +2
p35 FOUND
 -> frozen source direction graph
p28 THE
 -> p0 HELLO
 -> p18 MAP
 -> p23 ROAD
```

Physical p28 contains the literal DH line and the source-derived center/page-word mechanism yielding:

```text
READ OUT
```

The p23 ROAD page is therefore a source-selected downstream object on the same walk.

## Literal READ OUT on p23

Read the two outermost body runes of physical p23:

```text
first rune = ᚢ = U = 1
last rune  = ᚦ = TH = 2
```

Apply the already calibrated H operation:

```text
H(1,2) = [1-2, 1+2] mod29
       = [28,3]
       = [EA,O]
```

The rising/sum branch is therefore:

```text
O = 3
```

This is not an English score. It is a single rune result from the exact whole-page outer pair.

## Independent visual target

Original p23 `40.jpg` and solved p56 `73.jpg` reuse the same five-dot stencil as a half-turn pair.

P23 carries a large red U rune:

```text
ᚢ = 1
```

P56 carries a corresponding large red O rune:

```text
ᚩ = 3
```

Thus the p23 whole-page READ OUT operation reproduces the exact highlighted rune on the visually paired solved page:

```text
outer p23 U,TH
 -> H sum
 -> O
 -> enlarged O on solved p56
```

The visual target is independent of the p23 last body rune and of the H arithmetic.

## Relation to THE ONE RISE

P23's red heading independently decodes:

```text
THE ONE RISE
```

The page's large U rune is GP index1, giving a literal object for `THE ONE`.

The whole-page outer pair then supplies:

```text
ONE = U = 1
rise by outer mate TH = 2
1 + 2 = 3 = O
```

which matches the solved p56 large O.

This gives the hidden title a concrete operation on the page itself rather than treating ONE as an abstract numeral chosen after the fact.

## Relation to p33 THEIR RISE

The same p23/p56 pair gives two consistent rise measurements:

```text
rune rise: U(1) -> O(3) = +2
page rise: p23 -> p56 = +33
```

Physical p33 says:

```text
THEIR RISE
```

The page gap identifies p33; the rune rise supplies the +2 operation executed from p33 to p35 FOUND.

## Controls

The third five-dot stencil page p7 does not share the large U/O pair.

Whole-page outer H on the three stencil pages gives:

```text
p7:  outer [8,19]  -> H [18,27]
p23: outer [1,2]   -> H [28,3] = [EA,O]
p56: outer [25,15] -> H [10,11]
```

Only p23 produces the highlighted counterpart rune O on its p56 mate.

The broader exact transfer of p28 READ OUT to every p0 word was tested separately and produced no authenticated source word. That negative prevents treating READ OUT as a license for arbitrary outer-H scanning.

## Consequence

The p28 candidate READ OUT now has a concrete downstream consumer selected by the source direction map:

```text
READ OUT
 -> ROAD/p23 whole-page outer pair
 -> H sum O
 -> solved p56 visual O
```

Together with the independent p35 validation of the low-digit p50 opcode, this materially strengthens the interpretation of READ OUT as an authored instruction.

The route also reaches solved p56, whose known plaintext contains the deep-web hash continuation. That does not recover the missing deep-web resource, though it gives a coherent manuscript navigation path into the solved endpoint.

## Reproduction

Machine-checked p23 outer values and H result are in:

- `sims/lp2_p33_p35_found_road_map_sft.cjs`
- workflow `.github/workflows/agent50-p33-p35-found-road-map.yml`

Visual pairing:

- `im-results/black-dot-template-reflections.md`
- original `resources/liber-primus/40.jpg`
- original `resources/liber-primus/73.jpg`

Related route synthesis:

- `im-results/lp2-p23-one-rise-u-o-bridge.md`
- `im-results/lp2-p33-p35-found-road-map.md`
- `im-results/lp2-p35-lowdigit-validates-p28-readout.md`
