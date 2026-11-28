#include <stdio.h>
#include <stdint.h>
#include <jpeglib.h>
#ifdef _WIN32
#include <fcntl.h>
#include <io.h>
#endif
static void put16(int x) {
    unsigned u = (uint16_t)x;
    fputc(u & 255, stdout); fputc(u >> 8, stdout);
}
int main(int argc, char **argv) {
    if (argc != 2) return 1;
#ifdef _WIN32
    _setmode(_fileno(stdout), _O_BINARY);
#endif
    FILE *f = fopen(argv[1], "rb"); if (!f) return 2;
    struct jpeg_decompress_struct c; struct jpeg_error_mgr e;
    c.err = jpeg_std_error(&e); jpeg_create_decompress(&c);
    jpeg_stdio_src(&c, f); jpeg_read_header(&c, TRUE);
    jvirt_barray_ptr *co = jpeg_read_coefficients(&c);
    if (c.num_components == 1) { put16(0); put16(0); }
    else {
        if (c.jpeg_color_space != JCS_YCbCr || c.num_components != 3 ||
            c.comp_info[1].width_in_blocks != c.comp_info[2].width_in_blocks ||
            c.comp_info[1].height_in_blocks != c.comp_info[2].height_in_blocks ||
            c.max_h_samp_factor != 2 || c.max_v_samp_factor != 2 ||
            c.comp_info[1].h_samp_factor != 1 || c.comp_info[1].v_samp_factor != 1 ||
            c.comp_info[2].h_samp_factor != 1 || c.comp_info[2].v_samp_factor != 1) return 3;
        int w=c.comp_info[1].width_in_blocks, h=c.comp_info[1].height_in_blocks;
        put16(w); put16(h);
        for (int k=1;k<=2;k++) {
            JQUANT_TBL *q=c.quant_tbl_ptrs[c.comp_info[k].quant_tbl_no];
            for (int j=0;j<64;j++) put16(q->quantval[j]);
        }
        for (int y=0;y<h;y++) {
            JBLOCKARRAY b=(*c.mem->access_virt_barray)((j_common_ptr)&c,co[1],y,1,FALSE);
            JBLOCKARRAY r=(*c.mem->access_virt_barray)((j_common_ptr)&c,co[2],y,1,FALSE);
            for (int x=0;x<w;x++) {
                for(int j=0;j<64;j++) put16(b[0][x][j]);
                for(int j=0;j<64;j++) put16(r[0][x][j]);
            }
        }
    }
    jpeg_destroy_decompress(&c); fclose(f); return ferror(stdout) ? 4 : 0;
}
