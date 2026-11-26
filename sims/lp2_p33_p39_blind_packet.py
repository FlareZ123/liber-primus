"""Build Director #3012's source-only discovery and separately sealed holdout."""
import argparse
import csv
import hashlib
import io
import re
import urllib.request
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

DISCOVERY = (33, 34, 35, 36, 37, 39)
HOLDOUT = 38
RASTERS = (
    ('Babylonian_numerals.jpg', '29 September 2003', 'https://upload.wikimedia.org/wikipedia/commons/1/16/Babylonian_numerals.jpg', 29817, '3aea0ef57bf0e0f3a3a649c4f6029777fefee5be'),
    ('Babylonian_numerals.PNG', '26 October 2008', 'https://upload.wikimedia.org/wikipedia/commons/3/30/Babylonian_numerals.PNG', 103353, '34b579130dc217751020af35becedb64c35c4f7a'),
)
SVG_SHA1 = '4a117a94d010e658cf0f8bc8a04830a51874e453'
FORM_BLOB = '6a7130783f73320a5e6e5f802061f7851071a349'
START = '''# Source-only manuscript session

Examine the manuscript images and historical reference material in this archive.
Record the first visual feature you notice and why it suggests an operation.
Record any other historical references, tools, and attempts you use. Do not
consult post-release puzzle analyses, modern transcriptions, candidate keys,
repository research or prior solvers. There is no requirement to find a solution.

If you identify an operation, record its exact source input, reading direction,
representation, parameters, handling of boundaries, and output. Explain what
observable feature selects it over another operation. Before the moderator
reveals a withheld page, record one exact prediction about that page: the target
coordinates or indexing, expected output or relation, and objective pass/fail
criterion. If you cannot make a discriminating prediction, say so. Do not revise
a locked prediction after the reveal.
'''
MODERATOR = '''# Moderator-only protocol (do not distribute with discovery archive)

1. Obtain maintainer approval and consent from a real human without prior exposure
   to repository hypotheses. Record date, exposure, references, tools and elapsed
   time. No LLM proxy; do not recruit or post publicly without approval.
2. Supply only discovery.zip, with no issue title, derived transcription or
   hypotheses. The two chart rasters and SVG are historical reference examples;
   their inclusion is not an attribution of the manuscript artwork. The Stage10
   fields are an exact literal excerpt, not a claimed cipher input.
3. Record first observations and reasoning verbatim without suggesting a reading
   order, number conversion, key, or cipher. Ask the participant to freeze an
   executable operation and an exact, falsifiable output/criterion on p38 before
   seeing it. Give only the held-out page identifier. Record a dated UTF-8 copy of
   the prediction and its SHA-256. A prediction of a repeated stamp alone does not
   discriminate a plaintext receiver; ask for a distinct predicted output if one
   follows from the participant's own rule, without suggesting a transform.
4. Only after the prediction is sealed, release holdout.zip. Apply the frozen
   operation and record the output, failure or missing input. Changes after reveal
   are exploratory and require another untouched target. If no prediction is
   made, record that fact without steering or revealing the holdout as a hint.
5. Report the evidence and limitations. p38 is withheld because it contains a
   later numbered passage while p39 retains the closing layout in discovery;
   this is a procedural choice, not a claim about the historical cipher.

No approved human session has been performed. Packet preparation is not a
human finding, key, or decryption.
'''


def verify(raw, size, sha1):
    if len(raw) != size or hashlib.sha1(raw).hexdigest() != sha1:
        raise ValueError('Historical chart bytes do not match pinned identity')
    return raw


def stage_fields(raw):
    blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    if blob != FORM_BLOB:
        raise ValueError('Unexpected Stage10 source blob')
    fields = re.findall(rb'(<p> Order [0-9]+ Square, [0-9]+ </p>)\r?\n\s*(<textarea name="[0-9]+"></textarea>)', raw)
    if [re.search(rb'name="([0-9]+)"', b).group(1) for _, b in fields] != [b'53301', b'71033', b'51033']:
        raise ValueError('Unexpected Stage10 field order')
    return b'\n\n'.join(a + b'\n' + b for a, b in fields) + b'\n'


def pack(path, entries, start=None):
    rows = []
    def add(z, name, raw):
        item = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
        item.compress_type = ZIP_DEFLATED
        z.writestr(item, raw)
    with ZipFile(path, 'w') as z:
        if start is not None:
            add(z, 'START.md', start.encode())
        for name, raw, period, source in entries:
            add(z, name, raw)
            rows.append((name, period, source, len(raw), hashlib.sha256(raw).hexdigest()))
        s = io.StringIO(newline='')
        writer = csv.writer(s, delimiter='\t', lineterminator='\n')
        writer.writerow(('file', 'period', 'source', 'bytes', 'sha256'))
        writer.writerows(rows)
        add(z, 'SOURCE-MANIFEST.tsv', s.getvalue().encode())
    with ZipFile(path) as z:
        assert z.testzip() is None
        for name, raw, _, _ in entries:
            assert z.read(name) == raw


def build(repo, output, chart_dir=None, image_dir=None):
    output.mkdir(parents=True, exist_ok=True)
    image_dir = image_dir or repo / 'resources/liber-primus'
    def page(p):
        n = p + 17
        raw = (image_dir / f'{n:02}.jpg').read_bytes()
        if not raw.startswith(b'\xff\xd8'):
            raise ValueError(f'p{p} source is not a JPEG')
        return (f'pages/p{p:02}.jpg', raw, 'May 2014', f'LP2 physical p{p}; original combined archive {n:02}.jpg')
    entries = [page(p) for p in DISCOVERY]
    for name, period, url, size, sha in RASTERS:
        if chart_dir is not None:
            raw = (chart_dir / name).read_bytes()
        else:
            req = urllib.request.Request(url, headers={'User-Agent': 'LiberPrimusResearch/1.0 (public historical chart; github.com/FlareZ123/liber-primus)'})
            with urllib.request.urlopen(req, timeout=30) as f:
                raw = f.read(size + 1)
        entries.append((f'context/{name}', verify(raw, size, sha), period, url + '; public domain (Commons)'))
    svg = verify((repo / 'resources/external/babylonian_numerals_2010.svg').read_bytes(), 220819, SVG_SHA1)
    entries.append(('context/Babylonian_numerals.svg', svg, '29 March 2010', 'https://commons.wikimedia.org/wiki/File:Babylonian_numerals.svg; Josell7; CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0/'))
    form = stage_fields((repo / 'resources/historical/cicada2014-stage10-neuro-form.html').read_bytes())
    entries.append(('context/stage10-literal-fields.txt', form, '2014, before LP2', 'Original Stage10 HTML; literal label and textarea lines only; source Git blob ' + FORM_BLOB))
    # Acquire all inputs before writing either archive; do not emit a partial packet.
    held = [page(HOLDOUT)]
    pack(output / 'discovery.zip', entries, START)
    pack(output / 'holdout.zip', held)
    (output / 'moderator.md').write_text(MODERATOR, encoding='utf-8')
    print('Discovery pages:', DISCOVERY, 'holdout:', HOLDOUT)
    for name in ('discovery.zip', 'holdout.zip'):
        raw = (output / name).read_bytes()
        print(name, len(raw), hashlib.sha256(raw).hexdigest())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--chart-dir', type=Path, help='Offline directory containing exact 2003 JPG and 2008 PNG')
    parser.add_argument('--image-dir', type=Path, help='Optional extracted original combined JPEG directory')
    args = parser.parse_args()
    build(args.repo, args.output, args.chart_dir, args.image_dir)
