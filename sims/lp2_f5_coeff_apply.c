/* Serialize genuine F5-embedded grayscale coefficients using libjpeg's
   complete-MCU JPEG writer. F5 embedding itself is performed separately by
   the pinned, extraction-verified historical-compatible Go implementation.
   This avoids the Go JPEG serializer's last-block truncation on some LP2 pages. */
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
    if (argc != 4 || sizeof(JCOEF) != 2) {
        fprintf(stderr, "usage: lp2_f5_coeff_apply input-gray.jpg f5.int16 output.jpg\n");
        return 2;
    }
    FILE *input = fopen(argv[1], "rb");
    FILE *raw = fopen(argv[2], "rb");
    FILE *output = fopen(argv[3], "wb");
    if (!input || !raw || !output) {
        perror("JPEG coefficient source");
        return 2;
    }
    struct jpeg_decompress_struct src;
    struct jpeg_compress_struct dst;
    struct jpeg_error_mgr e1, e2;
    src.err = jpeg_std_error(&e1);
    dst.err = jpeg_std_error(&e2);
    jpeg_create_decompress(&src);
    jpeg_stdio_src(&src, input);
    jpeg_read_header(&src, TRUE);
    if (src.image_width != 2400 || src.image_height != 3600
        || src.num_components != 1) {
        fprintf(stderr, "requires an original LP2 grayscale JPEG\n");
        return 2;
    }
    jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&src);
    jpeg_component_info *y = &src.comp_info[0];
    /* The Go F5 source stores each block in JPEG zigzag coefficient order.
       libjpeg's JCOEF blocks use natural 8x8 raster coefficient order. */
    static const unsigned char zz[64] = {
        0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,
        12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,
        35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
        58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
    };
    for (JDIMENSION row = 0; row < y->height_in_blocks; row++) {
        JBLOCKARRAY line = (*src.mem->access_virt_barray)(
            (j_common_ptr)&src, coefficients[0], row, 1, TRUE);
        for (JDIMENSION col = 0; col < y->width_in_blocks; col++) {
            JCOEF input_zigzag[64];
            if (fread(input_zigzag, sizeof(JCOEF), 64, raw) != 64) {
                fprintf(stderr, "incomplete F5 quantized coefficient stream\n");
                return 2;
            }
            for (int k = 0; k < 64; k++) {
                line[0][col][zz[k]] = input_zigzag[k];
            }
        }
    }
    if (fgetc(raw) != EOF) {
        fprintf(stderr, "extra F5 quantized coefficient bytes\n");
        return 2;
    }
    jpeg_create_compress(&dst);
    jpeg_stdio_dest(&dst, output);
    jpeg_copy_critical_parameters(&src, &dst);
    jpeg_write_coefficients(&dst, coefficients);
    jpeg_finish_compress(&dst);
    jpeg_destroy_compress(&dst);
    jpeg_finish_decompress(&src);
    jpeg_destroy_decompress(&src);
    fclose(raw);
    fclose(input);
    return fclose(output) == 0 ? 0 : 2;
}
