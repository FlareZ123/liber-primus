# Cold-start packet: LP2 p33 and the 2014 Stage7/Stage10 materials

**Status:** Prepared for an independent solver; not yet executed by an unexposed human or worker.

## Ground rules

Assume you are a solver in 2014. Use only the source materials listed below. Do not consult repository analyses, research Issues, agent memories, or later interpretations. Do not assume that a magic square is a cipher key. Record each observation and proposed action in order, and label it **explicitly instructed**, **directly observable**, or **inferred**. Stop at the first step where the sources no longer select a unique action.

Do not run generic cipher searches. The question is about the human-visible route and whether the original sources select a further operation on p33.

## Source packet

### Liber Primus images

- LP2 physical p33: resources/liber-primus/50.jpg. The archive has LP1 at 00–16 and LP2 p0–p57 at 17–74; therefore LP2 p33 is image 50, not image 33.
- LP1 pages 5, 14, 15 and 16: resources/liber-primus/05.jpg, 14.jpg, 15.jpg, 16.jpg.
- Original image archive page map: resources/liber-primus/README.md.

### 2014 Stage7 material

- Pinned Stage7 source repository: cicada-solvers/neuroretransmit-cicada, commit b13600373d3400d75ec4208198019f3d92a304dd, directory 2014/007-fifth-onion.
- The pinned directory contains the Stage7 page, its signed content, the portrait image, the NAND/XOR visual outputs, the MP3 and the participant README.
- Reproduced extracted square file: resources/cicada2014-openpuff-magic-squares.txt. This is a derived extraction artifact, not itself a signed Cicada instruction.
- The exact signed-page / MP3 / OpenPuff reproduction record is im-results/cicada2014-stage7-chain-reproduction.md. Do not use this analysis in the cold-start; it is listed here only for maintainers, not as part of the solver packet.

### 2014 Stage10 material

- Earliest surviving participant capture: micheloosterhof/cicada-2014, commit 3b15257c5a9efada85b8ccfdb876e2ec934d5b90, directory stage10.
- Local source capture: resources/external/cicada2014-onion6-magic-form-and-response.json.
- Preserved static response body: resources/external/2014-stage10-post-square-response.html.
- The embedded signed message and the surrounding participant-archived HTML are distinct source objects; assess what each actually authenticates.

## Solver questions

1. Starting from LP2 p33, what can you read directly from its artwork?
2. What historically available Stage7/Stage10 material, if any, is selected by those observations?
3. Reconstruct the shortest plausible sequence of operations and submissions. For each step, state the exact source that licenses it.
4. What exact next page, coordinate, operation or submission action follows?
5. Does the source specify any reversible operation on p33's unknown runes? If yes, give its complete input, output, mapping, ordering, parameters and reset/boundary rules. If not, identify the first missing instruction and stop.
6. Distinguish LP1 page references from LP2 physical-page references. Do not infer a page number from a numeric filename without an independent selector.

## Required response format

- Observations (source and location)
- Route (ordered steps, each marked explicit / observable / inferred)
- First underdetermined step
- Exact next action, if one is selected
- What remains unknown

Do not claim an independent blind result unless this packet has actually been given to a solver who has not seen the later research.
