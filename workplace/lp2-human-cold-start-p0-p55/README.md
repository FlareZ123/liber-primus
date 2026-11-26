# Whole-manuscript human cold-start packet (facilitator record)

**Prepared:** 26 November 2026. **Status:** packet and protocol prepared; no participant contacted and no human session claimed.

## Scope and source mapping

The packet contains LP2 physical pages p0–p55 in original release order. The repository's original-image archive combines LP1 and LP2: LP1 occupies 00.jpg–16.jpg, and LP2 p0–p57 occupies 17.jpg–74.jpg. Therefore LP2 page pN maps to resources/liber-primus/(N+17).jpg. This packet uses exactly 17.jpg–72.jpg; it does not include LP2 p56 or p57.

All 56 page images are copied byte-for-byte and renamed p00.jpg–p55.jpg inside the packet. The manifest records SHA-256 and byte length for each. The packet also contains the exact original Cicada-signed 2014 release message, the original static index, and the published Cicada verification key. The three context files were checked against their repository Git blob IDs.

## Artifacts

- participant_packet.zip — participant-facing images, first-party context, instructions and manifest.
- PACKET_README.md — neutral participant instructions, copied into the ZIP as README.md.
- ALLOWED_CONTEXT.md — dated first-party source allowlist, copied into the ZIP.
- SESSION_PROTOCOL.md — facilitator-only protocol; deliberately not included in the participant ZIP.
- manifest.csv — page-to-file mapping and exact SHA-256/byte counts.
- sims/build_lp2_human_cold_start_packet.py — deterministic builder, with source-byte checks.

## Blindness controls

Do not show the participant this file, the issue title/body, repository reports, transcriptions, candidate keys, agent memories, or prior hypotheses. The participant receives only participant_packet.zip. No human has been contacted; do not recruit or publish externally without maintainer approval. The packet is prepared, not a claimed human result.

## Rebuild

From the repository root:

    python sims/build_lp2_human_cold_start_packet.py --output /tmp/lp2-p0-p55-blind-packet.zip

The builder checks each original JPEG against the fixed manifest and checks the included context files against their exact Git blob IDs before writing the packet.
