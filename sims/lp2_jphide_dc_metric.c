#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s image.jpg\n", argv[0]);
        return 2;
    }
    FILE *f = fopen(argv[1], "rb");
    if (!f) { perror(argv[1]); return 2; }
    struct jpeg_decompress_struct d;
    struct jpeg_error_mgr e;
    d.err = jpeg_std_error(&e);
    jpeg_create_decompress(&d);
    jpeg_stdio_src(&d, f);
    if (jpeg_read_header(&d, TRUE) != JPEG_HEADER_OK) {
        fprintf(stderr, "invalid JPEG header\n"); return 2;
    }
    jvirt_barray_ptr *a = jpeg_read_coefficients(&d);
    jpeg_component_info *c = &d.comp_info[0];
    long hist[4097] = {0};
    long blocks = 0;
    for (JDIMENSION y = 0; y < c->height_in_blocks; y++) {
        JBLOCKARRAY row = (*d.mem->access_virt_barray)(
            (j_common_ptr)&d, a[0], y, 1, FALSE);
        for (JDIMENSION x = 0; x < c->width_in_blocks; x++) {
            int v = row[0][x][0];
            if (v < -2048 || v > 2048) {
                fprintf(stderr, "DC out of range: %d\n", v); return 3;
            }
            hist[v + 2048]++;
            blocks++;
        }
    }
    long mode_count = 0;
    int mode = 0;
    for (int i = 0; i < 4097; i++) {
        if (hist[i] > mode_count) {
            mode_count = hist[i];
            mode = i - 2048;
        }
    }
    int pair_even = (mode & 1) ? mode - 1 : mode;
    long even_count = hist[pair_even + 2048];
    long odd_count = hist[pair_even + 2049];
    long pair_count = even_count + odd_count;
    long nm1 = hist[2047], n0 = hist[2048], np1 = hist[2049];
    long nprime = nm1 + np1;
    long m0_num = 3 * n0 - nprime;
    long mprime_num = 3 * nprime - n0;
    printf("{\"path\":\"%s\",\"width\":%u,\"height\":%u,"
           "\"components\":%d,\"blocks\":%ld,\"mode\":%d,"
           "\"mode_count\":%ld,\"pair_even\":%d,\"even_count\":%ld,"
           "\"pair_odd\":%d,\"odd_count\":%ld,\"pair_count\":%ld,"
           "\"even_fraction\":%.12f,\"n_minus1\":%ld,\"n0\":%ld,"
           "\"n_plus1\":%ld,\"m0_numerator\":%ld,"
           "\"mprime_numerator\":%ld}\n",
           argv[1], d.image_width, d.image_height, d.num_components,
           blocks, mode, mode_count, pair_even, even_count, pair_even + 1,
           odd_count, pair_count,
           pair_count ? (double)even_count / (double)pair_count : 0.0,
           nm1, n0, np1, m0_num, mprime_num);
    jpeg_finish_decompress(&d);
    jpeg_destroy_decompress(&d);
    fclose(f);
    return 0;
}
