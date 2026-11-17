/*
 * Exact 58-image source JPEG key-independent JPHide 0.5 DC-first-class audit.
 * Original documents: Provos/Honeyman NDSS 2001 section 5.2.
 * Builds with C99/libjpeg. Never edits input files.
 */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>
typedef struct {
    long total,mode_value,mode_count,mode_pair_count;
    long mode_even_count,mode_odd_count;
    long even338,odd339,even336,odd337;
    long even_dc,odd_dc,synthetic_even,synthetic_odd;
} Measurement;
static void fail(const char *s){fprintf(stderr,"FAIL: %s\n",s);exit(2);}
static uint32_t step(uint32_t *s){*s^=*s<<13;*s^=*s>>17;*s^=*s<<5;return *s;}
static Measurement inspect(const char *name,int synthetic){
    FILE *f=fopen(name,"rb");if(!f){perror(name);exit(2);}
    struct jpeg_decompress_struct d;struct jpeg_error_mgr e;
    d.err=jpeg_std_error(&e);jpeg_create_decompress(&d);
    jpeg_stdio_src(&d,f);if(jpeg_read_header(&d,TRUE)!=JPEG_HEADER_OK)fail("read header");
    jvirt_barray_ptr *a=jpeg_read_coefficients(&d);
    jpeg_component_info *comp=d.comp_info;
    long hist[4097]={0};
    Measurement out={0};uint32_t prng=0x33011337;
    for(JDIMENSION y=0;y<comp->height_in_blocks;y++){
        JBLOCKARRAY blocks=(*d.mem->access_virt_barray)((j_common_ptr)&d,a[0],y,1,FALSE);
        for(JDIMENSION x=0;x<comp->width_in_blocks;x++){
            int v=blocks[0][x][0];
            if(v<-2048||v>2048)fail("DC outside expected range");
            hist[v+2048]++;out.total++;
            if((v&1)!=0)out.odd_dc++;else out.even_dc++;
            if(v==338)out.even338++;if(v==339)out.odd339++;
            if(v==336)out.even336++;if(v==337)out.odd337++;
            if(synthetic&&(v==338||v==339)){
                if(step(&prng)&1)out.synthetic_odd++;
                else out.synthetic_even++;
            }
        }
    }
    for(int i=0;i<4097;i++)if(hist[i]>out.mode_count){
        out.mode_count=hist[i];out.mode_value=i-2048;
    }
    int mode=(int)out.mode_value;
    int pair_even=(mode&1)?mode-1:mode;
    out.mode_even_count=hist[pair_even+2048];
    out.mode_odd_count=hist[pair_even+2049];
    out.mode_pair_count=out.mode_even_count+out.mode_odd_count;
    jpeg_finish_decompress(&d);jpeg_destroy_decompress(&d);fclose(f);
    return out;
}
int main(int argc,char **argv){
    if(argc==3&&!strcmp(argv[1],"--fixture")){
        Measurement m=inspect(argv[2],0);
        printf("FIXTURE %s n=%ld mode=%ld modecount=%ld pair=%ld mode_even=%ld mode_odd=%ld fraction_even=%.6f overall_odd=%.6f\n",
          argv[2],m.total,m.mode_value,m.mode_count,m.mode_pair_count,
          m.mode_even_count,m.mode_odd_count,
          (double)m.mode_even_count/(double)m.mode_pair_count,
          (double)m.odd_dc/(double)m.total);
        return 0;
    }
    if(argc!=2)fail("usage: dir with original 00.jpg..74.jpg");
    long lp2_338=0,lp2_339=0,lp2_336=0,lp2_337=0;
    long cover338=0,cover339=0;double max_even_frac=0;
    char path[1024];
    for(int i=0;i<75;i++){
        if(i==10)continue; /* original 10.jpg has concatenated JPEG streams */
        if(snprintf(path,sizeof(path),"%s/%02d.jpg",argv[1],i)>=(int)sizeof(path))fail("path too long");
        Measurement m=inspect(path,i==17);
        double evenfrac=(m.even338+m.odd339)?
          (double)m.even338/(double)(m.even338+m.odd339):0;
        printf("ORIGINAL %02d c0_blocks=%ld mode=%ld count=%ld pair=%ld dc338=%ld dc339=%ld frac338=%.9f dc336=%ld dc337=%ld\n",
          i,m.total,m.mode_value,m.mode_count,m.mode_pair_count,
          m.even338,m.odd339,evenfrac,m.even336,m.odd337);
        if(i==17){
            long n=m.synthetic_even+m.synthetic_odd;
            double p=(double)m.synthetic_even/(double)n;
            printf("SYNTHETIC_DC_PARITY_CONTROL page17 eligible=%ld even=%ld odd=%ld fraction_even=%.7f\n",
              n,m.synthetic_even,m.synthetic_odd,p);
            if(p<0.49||p>0.51)fail("synthetic bit parity calibration failed");
        }
        if(i>=17){
            if(m.total!=135000||m.mode_value!=339)fail("LP2 original structure changed");
            lp2_338+=m.even338;lp2_339+=m.odd339;
            lp2_336+=m.even336;lp2_337+=m.odd337;
            if(evenfrac>max_even_frac)max_even_frac=evenfrac;
            if(evenfrac>=0.03)fail("original mode-pair parity unanticipated");
        }
        if(i>=14&&i<=16){cover338+=m.even338;cover339+=m.odd339;}
    }
    printf("SUMMARY lp2_images=58 total_component0_DC=7830000 dc338=%ld dc339=%ld fraction_even_in_338_339=%.9f max_page_even_fraction=%.9f dc336=%ld dc337=%ld lp1_covers_14to16_dc338=%ld lp1_covers_dc339=%ld\n",
      lp2_338,lp2_339,(double)lp2_338/(double)(lp2_338+lp2_339),max_even_frac,
      lp2_336,lp2_337,cover338,cover339);
    puts("PASS: originals exhibit extreme 339/338 modal DC parity bias.");
    return 0;
}