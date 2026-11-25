from pathlib import Path
import argparse, hashlib, io, json, subprocess, tempfile, zipfile
from PIL import Image, JpegImagePlugin

p = argparse.ArgumentParser()
p.add_argument('archive', type=Path)
p.add_argument('--gs', default='gs')
a = p.parse_args()
if a.archive.is_dir():
    original = Image.open(a.archive / '74.jpg')
else:
    with zipfile.ZipFile(a.archive) as z:
        original = Image.open(io.BytesIO(z.read('liber-primus-jpegs/74.jpg')))
image = original.convert('RGB')
# First word after PARABLE, physically LIKE, GP chart C aliases K.
# Source pixel tile boundaries preserve original JPEG-decoded RGB, including noise.
xs = [1183, 1221, 1234, 1290, 1346]
y0,y1 = 914,1034
w,h = xs[-1]-xs[0],y1-y0
names = ['L','I','K','E']
codes = {'gp0':[20,10,5,18], 'ascii':[76,73,75,69]}
source = image.crop((xs[0], y0, xs[-1], y1))
def ps_document(seq):
    lines = ['%!PS-Adobe-3.0', f'<< /PageSize [{w*72/400:.8f} {h*72/400:.8f}] >> setpagedevice',
        '/LP 12 dict dup begin /FontType 3 def /FontMatrix [1 0 0 1 0 0] def',f'/FontBBox [0 0 {w} {h}] def',
        '/Encoding 256 array def 0 1 255 {Encoding exch /.notdef put} for', '/CharProcs 5 dict def',
        'CharProcs begin /.notdef {0 0 setcharwidth} bind def']
    for name,x0,x1 in zip(names,xs,xs[1:]):
        tile=image.crop((x0,y0,x1,y1)); tw=x1-x0
        lines += [f'/{name} {{ {tw} 0 setcharwidth gsave {tw} {h} scale',
                  f'{tw} {h} 8 [{tw} 0 0 -{h} 0 {h}]',
                  '{<' + tile.tobytes().hex() + '>} false 3 colorimage grestore } bind def']
    lines += ['end'] + [f'Encoding {code} /{name} put' for code,name in zip(seq,names)]
    lines += ['/BuildChar { 1 index /Encoding get exch get 1 index /CharProcs get exch get exch pop exec } bind def',
              'end definefont pop', '0.18 0.18 scale /LP findfont 1 scalefont setfont 0 0 moveto',
              '<'+bytes(seq).hex()+'> show showpage']
    return '\n'.join(lines)+'\n'
sha=lambda b:hashlib.sha256(b).hexdigest()
out={'source_crop': [xs[0],y0,xs[-1],y1], 'tile_x':xs, 'source_rgb_sha256':sha(source.tobytes()),'ghostscript':subprocess.check_output([a.gs,'--version'],text=True).strip(),'variants':{}}
with tempfile.TemporaryDirectory() as td:
    for name,seq in codes.items():
        ps=Path(td)/f'{name}.ps'; ppm=Path(td)/f'{name}.ppm'; ps.write_text(ps_document(seq))
        subprocess.run([a.gs,'-q','-dBATCH','-dNOPAUSE','-sDEVICE=ppmraw','-r400','-dGraphicsAlphaBits=1','-dTextAlphaBits=1',f'-sOutputFile={ppm}',str(ps)],check=True)
        rendered=Image.open(ppm).convert('RGB'); assert rendered.size == source.size, (rendered.size,source.size)
        buf=io.BytesIO()
        rendered.save(buf,format='JPEG',qtables=original.quantization,subsampling=JpegImagePlugin.get_sampling(original),optimize=True,dpi=(400,400),icc_profile=original.info['icc_profile'])
        out['variants'][name]={'show_hex':bytes(seq).hex(),'ps_sha256':sha(ps.read_bytes()),'rgb_sha256':sha(rendered.tobytes()),'source_differing_rgb_bytes':sum(x!=y for x,y in zip(rendered.tobytes(),source.tobytes())),'jpeg_sha256':sha(buf.getvalue())}
        assert rendered.tobytes() == source.tobytes()
    assert out['variants']['gp0']['rgb_sha256'] == out['variants']['ascii']['rgb_sha256']
    assert out['variants']['gp0']['jpeg_sha256'] == out['variants']['ascii']['jpeg_sha256']
print(json.dumps(out,indent=2))
