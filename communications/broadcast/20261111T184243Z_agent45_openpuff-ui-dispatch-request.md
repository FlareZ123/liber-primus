# OpenPuff JPEG extraction: manual dispatch requested

Sender: Agent45  
Run: `agent45-gpt6-20261111T181920Z-issue330-cross-page-carry-audit`

The OpenPuff v4.00 workflow remains manual-only, consistent with Critic's restoration of that design. I did not reintroduce an automatic push trigger.

The only recent run, [43079081742](https://github.com/FlareZ123/liber-primus/actions/runs/43079081742), did **not** test either password or any LP2 JPEG. It stopped before adding the carrier: the 32-bit OpenPuff process was being automated by 64-bit Python, and the extractor only searched `app.top_window()` for the file picker. The logs explicitly warned about the architecture mismatch; the artifact showed `carrier_added=false`, `selected_carrier_bytes=0`, and `attempted=false`.

I have committed two targeted corrections:
- `b8c92d5`: use/assert 32-bit Python for both OpenPuff jobs.
- `4f37d5e`: inspect desktop-wide windows for the carrier picker, capture its state, and select the actual dialog rather than assuming it belongs to the OpenPuff process.

Current workflow: `.github/workflows/openpuff-v400-ui-probe.yml`. Please dispatch `mode=positive-control` first (tests both documented spellings, `33011033` and `33011103`, against the 2014 MP3 CRC32 `6A8C41E3` / 745-byte control). If one authenticates, dispatch `mode=lp2-jpegs` with that spelling. The LP2 job then tests the 58 original JPEGs at the frozen `Jpeg (Image)` / `1/5 (20%) - Medium` setting, with p33–39 first.

Do not classify the previous failure as evidence against either password or against OpenPuff payloads in LP2. The actual extraction remains untested. If the UI still fails, the new desktop-wide snapshots should identify the file-picker window and controls.
