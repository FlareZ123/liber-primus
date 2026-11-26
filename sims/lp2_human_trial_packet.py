"""Build a clean offline source packet (Python 3.8+, standard library)."""
import argparse
import hashlib
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED, ZIP_STORED

PAGES = {
    44: 'c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e',
    45: '318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522',
    46: '6f769f266865ddb30b0cb34e82c664a87ba409f674dc52ad3af7c85be443fb5c',
    47: '701b66d1fe98f730dadc5d7d8e1bc3b9a8e20547c1ffb423011f436037dba8b0',
    48: '0cb60ca12b1bf5f9fc03026314018a0d5ee73f813ac86ca4197629c60f2cb80a',
    49: 'c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72',
}
INDEX = ('<html>\n<head><title>133</title></head>\n<body>\n<div id="331">\n' +
         ''.join(f'<img src="{i}.jpg" /><br />\n' for i in range(58)) +
         '</div>\n</body>\n</html>\n').encode('ascii')
INDEX_BLOB = '303db130705f0ef9be2a738f4336d5cfcebde80c'
CHART = '''2013 Gematria Primus chart — transcription for reference

Rune    Latin    Prime
ᚠ       F        2
ᚢ       U        3
ᚦ       TH       5
ᚩ       O        7
ᚱ       R        11
ᚳ       C        13
ᚷ       G        17
ᚹ       W        19
ᚻ       H        23
ᚾ       N        29
ᛁ       I        31
ᛄ       J        37
ᛇ       EO       41
ᛈ       P        43
ᛉ       X        47
ᛋ       S        53
ᛏ       T        59
ᛒ       B        61
ᛖ       E        67
ᛗ       M        71
ᛚ       L        73
ᛝ       NG       79
ᛟ       OE       83
ᛞ       D        89
ᚪ       A        97
ᚫ       AE       101
ᚣ       Y        103
ᛡ       IA       107
ᛠ       EA       109
'''
TASK = '''# Independent puzzle investigation

You have six sequential original images from a 2014 cryptographic puzzle.
The images have not been edited. Their original archive filenames are 44–49;
the contemporary HTML index numbered them 27–32. The original 2014 index is
included as plain text, together with a transcription of the 2013 rune chart.
These are the supplied inputs, not suggested solution methods.

Participation is voluntary. You may stop at any point. Please do not look up
modern solutions, discussion, repository contents, other pages, later clues,
or use a generative AI assistant. Ordinary offline tools such as an image
viewer, text editor, calculator, spreadsheet, and scripts using algorithms
available in 2014 are permitted. Do not contact any service, visit historical
addresses, or access non-public material. If a particular historical artifact
seems necessary, identify it and ask the coordinator before obtaining it.

Open the six images in order. Spend up to 45 minutes (or stop earlier if you
reach a source gap). Record your own observations as they occur, not a polished
reconstruction after finding a possible answer. You need not solve the pages.
The useful outcome is one concrete next action and the evidence that led to it.

Use RESPONSE.txt. Do not change earlier entries after later observations.
Submit the completed file privately to your coordinator, with any scripts or
calculations you wrote. If you believe you found a solution, specify its exact
inputs and a reproducible next step before requesting more material.
'''
RESPONSE = '''Participant code (provided by coordinator):
Consent to record and share pseudonymized puzzle observations: yes / no
Prior exposure to this puzzle or its solutions (describe honestly):
Start UTC:

Observation 1 UTC:
Image filename and exact location:
What I noticed, in my own words:
What I think it suggests, and why:

First proposed action UTC (before examining its output):
Exact operation:
Input/operand and origin:
Direction, indexing and other conventions:
Expected result or discriminating prediction:
Required external artifact, if any:

Result of that action (include actual output or state not attempted):
What would falsify this interpretation:

Additional observations/actions (repeat fields as needed):

Earliest stopping point or missing input:
What I could not infer without guessing:
End UTC:
Tools used:
Any deviations from the trial rules or accidental prior-hint exposure:
'''


def add(z, name, data, method):
    entry = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    entry.compress_type = method
    z.writestr(entry, data)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument('--source-zip', type=Path)
    src.add_argument('--source-dir', type=Path, help='Directory containing original 44.jpg–49.jpg')
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    if args.source_zip:
        with ZipFile(args.source_zip) as z:
            pages = {}
            for number in PAGES:
                name = f'{number}.jpg'
                matches = [n for n in z.namelist() if Path(n).name == name]
                if len(matches) != 1:
                    raise ValueError(f'Expected one {name}, found {len(matches)}')
                pages[number] = z.read(matches[0])
    else:
        pages = {n: (args.source_dir / f'{n}.jpg').read_bytes() for n in PAGES}
    for number, data in pages.items():
        if hashlib.sha256(data).hexdigest() != PAGES[number]:
            raise ValueError(f'Original image mismatch: {number}.jpg')
    if hashlib.sha1(f'blob {len(INDEX)}\0'.encode('ascii') + INDEX).hexdigest() != INDEX_BLOB:
        raise ValueError('Original index mismatch')
    with ZipFile(args.output, 'w') as z:
        for number, data in pages.items():
            add(z, f'images/{number}.jpg', data, ZIP_STORED)
        for name, data in [('START.md', TASK.encode('utf-8')), ('RESPONSE.txt', RESPONSE.encode('utf-8')),
                           ('reference/2013-rune-chart.txt', CHART.encode('utf-8')), ('reference/2014-index.txt', INDEX)]:
            add(z, name, data, ZIP_DEFLATED)
    with ZipFile(args.output) as z:
        expected = {f'images/{n}.jpg' for n in PAGES} | {'START.md', 'RESPONSE.txt', 'reference/2013-rune-chart.txt', 'reference/2014-index.txt'}
        assert set(z.namelist()) == expected and z.testzip() is None
        for n in PAGES:
            assert z.read(f'images/{n}.jpg') == pages[n]
    print(f'{args.output}: SHA-256 {hashlib.sha256(args.output.read_bytes()).hexdigest()}')


if __name__ == '__main__':
    main()
