/*
 * Original LP2 floral border quantized-DCT comparison.
 * Uses libjpeg's jpeg_read_coefficients; no pixel re-encoding.
 * Run from repository root after compiling with libjpeg:
 *   cc -O2 -Wall -Wextra sims/lp2_floral16_border_dct_identity.c -ljpeg -o floral_dct
 *   floral_dct resources/liber-primus
 */
#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>

static int is_border(int x0,int y0,int x1,int y1) {
    return x1<=590 || x0>=1810 || y1<=600 || y0>=3200;
}

static int coeff_equal(const JCOEF *a,const JCOEF *b) {
    for(int i=0;i<DCTSIZE2;i++) if(a[i]!=b[i]) return 0;
    return 1;
}

static int compare(const char *folder,int reference,int candidate) {
    char pa[512],pb[512];
    if(snprintf(pa,sizeof(pa),"%s/%02d.jpg",folder,reference)>=(int)sizeof(pa)) return 0;
    if(snprintf(pb,sizeof(pb),"%s/%02d.jpg",folder,candidate)>=(int)sizeof(pb)) return 0;
    FILE *fa=fopen(pa,"rb"),*fb=fopen(pb,"rb");
    if(!fa || !fb) {
        fprintf(stderr,"Cannot open originals: %s, %s\n",pa,pb);
        if(fa) fclose(fa);
        if(fb) fclose(fb);
        return 0;
    }
    struct jpeg_decompress_struct a,b;
    struct jpeg_error_mgr ea,eb;
    a.err=jpeg_std_error(&ea);
    b.err=jpeg_std_error(&eb);
    jpeg_create_decompress(&a);
    jpeg_create_decompress(&b);
    jpeg_stdio_src(&a,fa);
    jpeg_stdio_src(&b,fb);
    jpeg_read_header(&a,TRUE);
    jpeg_read_header(&b,TRUE);
    jvirt_barray_ptr *ar=jpeg_read_coefficients(&a);
    jvirt_barray_ptr *br=jpeg_read_coefficients(&b);
    int ok=1;
    long long border_blocks[3]={0}, border_diff[3]={0},changed_coefs[3]={0};
    long long center_diff[3]={0};
    if(a.num_components!=b.num_components ||
       a.max_h_samp_factor!=b.max_h_samp_factor ||
       a.max_v_samp_factor!=b.max_v_samp_factor ||
       a.image_width!=2400 || a.image_height!=3600 ||
       b.image_width!=2400 || b.image_height!=3600) {
        fprintf(stderr,"Mismatched original image classes\n");
        ok=0;
        goto done;
    }
    for(int comp=0;comp<a.num_components;comp++) {
        jpeg_component_info *ca=&a.comp_info[comp],*cb=&b.comp_info[comp];
        if(ca->width_in_blocks!=cb->width_in_blocks ||
           ca->height_in_blocks!=cb->height_in_blocks ||
           ca->h_samp_factor!=cb->h_samp_factor ||
           ca->v_samp_factor!=cb->v_samp_factor ||
           ca->quant_table==NULL || cb->quant_table==NULL ||
           memcmp(ca->quant_table->quantval,cb->quant_table->quantval,
               sizeof(ca->quant_table->quantval))!=0) {
            fprintf(stderr,"Coefficient geometry or quantization mismatch\n");
            ok=0;
            goto done;
        }
        const int bw=8*a.max_h_samp_factor/ca->h_samp_factor;
        const int bh=8*a.max_v_samp_factor/ca->v_samp_factor;
        for(JDIMENSION row=0;row<ca->height_in_blocks;row++) {
            JBLOCKARRAY aa=(*a.mem->access_virt_barray)(
                (j_common_ptr)&a,ar[comp],row,1,FALSE);
            JBLOCKARRAY bb=(*b.mem->access_virt_barray)(
                (j_common_ptr)&b,br[comp],row,1,FALSE);
            for(JDIMENSION col=0;col<ca->width_in_blocks;col++) {
                const int x0=(int)col*bw,y0=(int)row*bh;
                const int exterior=is_border(x0,y0,x0+bw,y0+bh);
                const int differs=!coeff_equal(aa[0][col],bb[0][col]);
                if(exterior) {
                    border_blocks[comp]++;
                    if(differs) {
                        border_diff[comp]++;
                        for(int k=0;k<DCTSIZE2;k++)
                            if(aa[0][col][k]!=bb[0][col][k])
                                changed_coefs[comp]++;
                        if(candidate!=72 || comp!=0 ||
                           x0<1810 || y0<2770 || y0>2890) {
                            fprintf(stderr,"Unexpected border DCT modification: scan %d comp%d block(%u,%u)\n",
                                candidate,comp,(unsigned)col,(unsigned)row);
                            ok=0;
                        }
                    }
                } else if(differs) {
                    center_diff[comp]++;
                }
            }
        }
        long long expected=(candidate==72 && comp==0)?16:0;
        long long expected_coeff=(candidate==72 && comp==0)?311:0;
        if(border_diff[comp]!=expected || changed_coefs[comp]!=expected_coeff ||
            center_diff[comp]==0) ok=0;
    }
    printf("%02d vs %02d: comps=%d",reference,candidate,a.num_components);
    for(int comp=0;comp<a.num_components;comp++)
        printf(" c%d border_diff=%lld/%lld changed_coeff=%lld center_diff=%lld",
            comp,border_diff[comp],border_blocks[comp],
            changed_coefs[comp],center_diff[comp]);
    puts(ok?" PASS":" FAIL");
done:
    jpeg_destroy_decompress(&a);
    jpeg_destroy_decompress(&b);
    fclose(fa);
    fclose(fb);
    return ok;
}

int main(int argc,char **argv) {
    if(argc!=2) {
        fprintf(stderr,"Usage: %s <original-image-folder>\n",argv[0]);
        return 2;
    }
    const int grayscale[]={59,60,61,62,63,64,65,67,68,69};
    const int color[]={66,70,71,72};
    int ok=1;
    for(size_t i=0;i<sizeof(grayscale)/sizeof(grayscale[0]);i++)
        ok &= compare(argv[1],58,grayscale[i]);
    for(size_t i=0;i<sizeof(color)/sizeof(color[0]);i++)
        ok &= compare(argv[1],57,color[i]);
    JCOEF control_a[DCTSIZE2]={0},control_b[DCTSIZE2]={0};
    control_b[17]=1;
    if(coeff_equal(control_a,control_b) || !coeff_equal(control_a,control_a))
        ok=0;
    printf("One-AC-coefficient deliberate mutation positive: %s\n",
        coeff_equal(control_a,control_b)?"FAIL":"PASS");
    printf("Floral DCT identity original-source SFT %s\n",ok?"PASS":"FAIL");
    return ok?0:1;
}
