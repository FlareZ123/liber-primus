/* Exact native quantized-luminance JPEG AC capacity of the original five-dot stencil.
 * Original scans 24.jpg, 40.jpg, 73.jpg: LP2 p7, p23, solved p56.
 * Source-registered crop coordinates are fixed before all coefficient reads.
 * This reports slot ceilings only. It cannot establish or refute keyed payloads.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <jpeglib.h>

struct crop { int scan, x0, y0, x1, y1; };
static const struct crop sites[] = {
    {24, 740, 2800, 1620, 3260},
    {40, 740, 414, 1620, 874},
    {73, 781, 2381, 1661, 2841}
};
static const int thresholds[] = {64, 75, 90, 100, 125};

static int process(const char *file, int scan) {
    int site = -1;
    for (int i = 0; i < 3; ++i) {
        if (sites[i].scan == scan) site = i;
    }
    if (site < 0) return 2;
    const struct crop *roi = &sites[site];
    struct jpeg_decompress_struct dec;
    struct jpeg_error_mgr err;
    dec.err = jpeg_std_error(&err);
    jpeg_create_decompress(&dec);
    FILE *f = fopen(file, "rb");
    if (!f) return 3;
    jpeg_stdio_src(&dec, f);
    if (jpeg_read_header(&dec, TRUE) != JPEG_HEADER_OK) return 4;
    dec.out_color_space = JCS_RGB;
    jpeg_start_decompress(&dec);
    if (dec.output_width != 2400 || dec.output_height != 3600 ||
        dec.output_components != 3) return 5;
    size_t pixels = 2400u * 3600u * 3u;
    JSAMPLE *rgb = malloc(pixels);
    if (!rgb) return 6;
    while (dec.output_scanline < dec.output_height) {
        JSAMPROW row = rgb + (size_t)dec.output_scanline * 2400u * 3u;
        jpeg_read_scanlines(&dec, &row, 1);
    }
    jpeg_finish_decompress(&dec);
    jpeg_destroy_decompress(&dec);
    fclose(f);

    struct jpeg_decompress_struct coeff;
    struct jpeg_error_mgr coeff_err;
    coeff.err = jpeg_std_error(&coeff_err);
    jpeg_create_decompress(&coeff);
    f = fopen(file, "rb");
    if (!f) return 7;
    jpeg_stdio_src(&coeff, f);
    if (jpeg_read_header(&coeff, TRUE) != JPEG_HEADER_OK) return 8;
    jvirt_barray_ptr *arrays = jpeg_read_coefficients(&coeff);
    if (coeff.comp_info[0].width_in_blocks != 300 ||
        coeff.comp_info[0].height_in_blocks != 450) return 9;

    for (int th = 0; th < 5; ++th) {
        const int threshold = thresholds[th];
        long blocks[2] = {0}, ac[2] = {0}, one[2] = {0};
        long two[2] = {0}, ge3[2] = {0};
        for (int by = roi->y0 / 8; by < (roi->y1 + 7) / 8; ++by) {
            JBLOCKARRAY row = (*coeff.mem->access_virt_barray)(
                (j_common_ptr)&coeff, arrays[0], by, 1, FALSE);
            for (int bx = roi->x0 / 8; bx < (roi->x1 + 7) / 8; ++bx) {
                int nblack = 0;
                for (int py = by * 8; py < by * 8 + 8; ++py) {
                    if (py < roi->y0 || py >= roi->y1) continue;
                    for (int px = bx * 8; px < bx * 8 + 8; ++px) {
                        if (px < roi->x0 || px >= roi->x1) continue;
                        const size_t offset = ((size_t)py * 2400u + (size_t)px) * 3u;
                        const int gray = (
                            (int)rgb[offset] * 299 +
                            (int)rgb[offset + 1] * 587 +
                            (int)rgb[offset + 2] * 114 + 500) / 1000;
                        if (gray < threshold) ++nblack;
                    }
                }
                if (nblack == 0) continue;
                const int which = nblack == 64 ? 0 : 1;
                ++blocks[which];
                for (int k = 1; k < 64; ++k) {
                    const int v = row[0][bx][k];
                    const int abs_v = v < 0 ? -v : v;
                    if (abs_v) {
                        ++ac[which];
                        if (abs_v == 1) ++one[which];
                        else if (abs_v == 2) ++two[which];
                        else ++ge3[which];
                    }
                }
            }
        }
        printf("%d,%d,%ld,%ld,%ld,%ld,%ld,%ld,%ld,%ld,%ld,%ld\n",
            scan, threshold, blocks[0], ac[0], one[0], two[0], ge3[0],
            blocks[1], ac[1], one[1], two[1], ge3[1]);
    }
    jpeg_finish_decompress(&coeff);
    jpeg_destroy_decompress(&coeff);
    fclose(f);
    free(rgb);
    return 0;
}

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Expected: program scan-number original.jpg\n");
        return 1;
    }
    return process(argv[2], atoi(argv[1]));
}
