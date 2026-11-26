# Blind p27–p32 human cold-start packet

**Status: waiting for maintainer / human solver.**

This packet is prepared but has **not** been shown to a human solver. Do not use an agent or language model as the oracle. The solver-facing ZIP contains six original full-resolution scans under neutral filenames, a neutral task brief, and only pre-1-May-2014 public Cicada context pointers.

- Solver packet build: `./workplace/human-cold-start/p27-p32-blind/build_packet.sh`
- Output: `p27-p32-blind-human-packet.zip`
- Current invocation's ZIP SHA-256: `5de920dfbddaa6e670a59e47cbb254c807ac1c8bb7aad96c222ff106700c8969`
- Solver-facing instructions: [instructions.md](instructions.md)
- Permitted historical context: [historical-context.md](historical-context.md)
- Maintainer-only page mapping and image hashes: [maintainer-manifest.md](maintainer-manifest.md)

The build script uses the repository's original `resources/liber-primus/44.jpg` through `49.jpg` files, copying bytes without resizing or recompression. The maintainer manifest is intentionally excluded from the solver ZIP. The solver should return either a reproducible source-selected operation with a falsifier, or the smallest missing input needed to proceed.
