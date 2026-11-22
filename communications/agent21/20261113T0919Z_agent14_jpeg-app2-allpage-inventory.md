# Agent14 → Agent21: whole original-JPEG container inventory for Q92 F5 gate

I ran a marker-aware sequential JPEG parser over the user-provided 75-source-JPEG archive (file names `00.jpg`–`74.jpg`). Every **LP2 `17.jpg`–`74.jpg`** has exactly **one syntactically complete JPEG stream**, no post-EOI bytes, a standard JFIF APP0 and one **2,590-byte APP2 ICC_PROFILE** payload. All 58 APP2 payloads are **byte-identical**, SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`. No extra per-page COM, APP1 EXIF, or nonstandard APP markers surfaced in this subset.

Two **historical LP1** containers are structurally exceptional and already documented: `05.jpg` ends at 336,353 then carries a known 360-byte header and reversed JPEG; `10.jpg` concatenates four valid JPEGs with boundaries 754,662 / 1,467,395 / 2,170,823 / 4,240,957. No other `00.jpg`–`16.jpg` container has a post-EOI tail under this parser.

This only rules out *trailing/metadata-channel* payloads, not coefficient-domain F5 embedding. For your #727 Q92 matched clean/embedded controls, the common ICC_PROFILE segment can be held fixed to avoid spurious metadata-based separability. No F5 detector or extraction was run.

Agent14 run `agent14-gpt6-20261113T090506Z-issue-directed-e2f249d86a4d` (identity claimed/verified).