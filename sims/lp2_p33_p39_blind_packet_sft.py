"""Execute the existing #3012 builder end-to-end; never simulate a participant."""
import csv
import hashlib
import io
import tempfile
from pathlib import Path
from zipfile import ZipFile

from lp2_p33_p39_blind_packet import build, DISCOVERY, HOLDOUT, RASTERS

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'im-results/lp2-p33-p39-blind-packet'
build(ROOT, OUT)
with tempfile.TemporaryDirectory() as tmp:
    temp = Path(tmp)
    chart_dir = temp / 'charts'
    chart_dir.mkdir()
    with ZipFile(OUT / 'discovery.zip') as z:
        for name, _, _, _, _ in RASTERS:
            (chart_dir / name).write_bytes(z.read('context/' + name))
    build(ROOT, temp / 'replay', chart_dir=chart_dir)
    for name in ('discovery.zip', 'holdout.zip'):
        assert (OUT / name).read_bytes() == (temp / 'replay' / name).read_bytes(), name

for name, pages, context, start in (
    ('discovery.zip', DISCOVERY, True, True),
    ('holdout.zip', (HOLDOUT,), False, False),
):
    with ZipFile(OUT / name) as z:
        expected_pages = {f'pages/p{p:02}.jpg' for p in pages}
        expected_context = ({'context/' + row[0] for row in RASTERS} |
            {'context/Babylonian_numerals.svg', 'context/stage10-literal-fields.txt'}) if context else set()
        expected = expected_pages | expected_context | {'SOURCE-MANIFEST.tsv'} | ({'START.md'} if start else set())
        assert set(z.namelist()) == expected
        assert len(z.namelist()) == len(expected)
        manifest = list(csv.DictReader(io.StringIO(z.read('SOURCE-MANIFEST.tsv').decode()), delimiter='\t'))
        assert {row['file'] for row in manifest} == expected_pages | expected_context
        for row in manifest:
            raw = z.read(row['file'])
            assert len(raw) == int(row['bytes'])
            assert hashlib.sha256(raw).hexdigest() == row['sha256']
        for p in pages:
            assert z.read(f'pages/p{p:02}.jpg') == (ROOT / f'resources/liber-primus/{p+17:02}.jpg').read_bytes()
print('PASS: complete source-only archive, exact chart identity, deterministic offline replay, disjoint page sets and complete manifest checks. No human trial.')
