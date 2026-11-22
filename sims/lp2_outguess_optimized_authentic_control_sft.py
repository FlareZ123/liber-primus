"""Source-authentic OutGuess JPEG payloads after DCT-preserving optimized-Huffman recode.

Standalone SFT. Reuses the repository's already-calibrated OutGuess 0.4
bitmap extractor and Python ARC4 reader rather than inventing a decoder.
Requires a C compiler, libjpeg, and original 00.jpg..74.jpg under
resources/liber-primus (or pass the JPEG directory as argument).
"""
import hashlib
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

SIMS = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SIMS))
import outguess_extract as og

POSITIVES = {0:2899, 1:2899, 2:2899, 3:31809, 8:140, 11:1234, 12:1234, 13:1234}
COVERS = [4, 6, 7, 9, 14, 15, 16]
LP2_SAMPLES = [17, 57, 72]
TRANSCODE_C = r'''
#include <stdio.h>
#include <jpeglib.h>
int main(int argc,char **argv){
 if(argc!=3)return 2;
 FILE *src=fopen(argv[1],"rb"),*dst=fopen(argv[2],"wb");
 if(!src||!dst)return 2;
 struct jpeg_decompress_struct dec;struct jpeg_error_mgr derror;
 struct jpeg_compress_struct enc;struct jpeg_error_mgr eerror;
 dec.err=jpeg_std_error(&derror);enc.err=jpeg_std_error(&eerror);
 jpeg_create_decompress(&dec);jpeg_create_compress(&enc);
 jpeg_stdio_src(&dec,src);jpeg_read_header(&dec,TRUE);
 jvirt_barray_ptr *c=jpeg_read_coefficients(&dec);
 jpeg_stdio_dest(&enc,dst);jpeg_copy_critical_parameters(&dec,&enc);
 enc.optimize_coding=TRUE;jpeg_write_coefficients(&enc,c);
 jpeg_finish_compress(&enc);jpeg_finish_decompress(&dec);
 jpeg_destroy_compress(&enc);jpeg_destroy_decompress(&dec);
 fclose(src);fclose(dst);return 0;
}
'''

def compile_c(compiler, source, output):
    subprocess.run([compiler, '-O2', '-std=c99', '-o', str(output), str(source), '-ljpeg'],
                   check=True, capture_output=True, text=True)

def bitmap(exe, path):
    p = subprocess.run([str(exe), str(path)], check=True,
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    match = re.search(rb'eligible_coefficients=(\d+) bitmap_bytes=(\d+)', p.stderr)
    if not match:
        raise AssertionError('Missing native bitmap count')
    count, nbytes = map(int, match.groups())
    assert len(p.stdout) == nbytes
    return p.stdout, count

def main():
    directory = pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else SIMS.parent/'resources'/'liber-primus'
    compiler = shutil.which('cc') or shutil.which('gcc')
    if not compiler:
        raise RuntimeError('C compiler and libjpeg required')
    with tempfile.TemporaryDirectory(prefix='lp2-outguess-optimized-') as temp:
        temp = pathlib.Path(temp)
        source = temp/'transcode.c'
        source.write_text(TRANSCODE_C)
        transcode = temp/'transcode'
        reader = temp/'bitmap'
        compile_c(compiler, source, transcode)
        compile_c(compiler, SIMS/'outguess_bitmap_dump.c', reader)
        positives = 0
        for i in [*POSITIVES, *COVERS, *LP2_SAMPLES]:
            image = directory/f'{i:02d}.jpg'
            repacked = temp/f'optimized_{i:02d}.jpg'
            subprocess.run([str(transcode),str(image),str(repacked)],check=True)
            original_bitmap, original_count = bitmap(reader,image)
            optimized_bitmap, optimized_count = bitmap(reader,repacked)
            if original_count != optimized_count or original_bitmap != optimized_bitmap:
                raise AssertionError(f'{i:02d}: source DCT bitstream changed by optimizer')
            if i in POSITIVES:
                original, evidence = og.extract(original_bitmap, original_count, 'Default key')
                repacked_message, second = og.extract(optimized_bitmap, optimized_count, 'Default key')
                if original != repacked_message or evidence['payload_sha256'] != second['payload_sha256']:
                    raise AssertionError(f'{i:02d}: historical payload changed')
                prefix = (b'\nFor those who have fallen behind:' if i == 8
                          else b'-----BEGIN PGP SIGNED MESSAGE-----')
                if len(original)!=POSITIVES[i] or not original.startswith(prefix):
                    raise AssertionError(f'{i:02d}: authentic plaintext control failed')
                positives+=1
                print(f'LP1 {i:02d} ORIGINAL HISTORICAL POSITIVE recovered_bytes={len(original)} '
                      f'sha256={hashlib.sha256(original).hexdigest()} optimized_recovered_exact=yes')
            elif i in LP2_SAMPLES:
                if not og.header_is_source_forced(original_bitmap,original_count):
                    raise AssertionError(f'{i:02d}: unexpected non-forced LP2 OutGuess header')
                print(f'LP2 {i:02d} CONTROL original/optimized bitmap identical, '
                      'initial 1024 bits all one, OutGuess header forced to ffffffff')
            else:
                print(f'LP1 {i:02d} COVER original/optimized bitmap identical '
                      '(no positive message asserted)')
        assert positives==8
        print('PASS: all 8 authentic historical LP1 OutGuess messages recovered byte-for-byte after '
              'coefficient-preserving optimized-Huffman recoding; seven LP1 source covers '
              'and three LP2 source contrasts keep identical complete coefficient bitmaps')
        print('NO unknown LP2 plaintext, password, or payload authenticated')

if __name__ == '__main__': main()
