// Exact 40,600,000-case source-original prime/totient affine key scan.
// Self-contained C++20, including the unchanged 946 GP29 source input symbols.
// Compile on Windows with any conforming C++20 compiler (MSVC /std:c++20).
// Source master: resources/liber-primus/lp2-corpus.json, p0..p3 + solved p56.
// This is an exclusionary cipher search, not a recovered unknown plaintext.
#include <algorithm>
#include <bit>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>

static std::vector<int> hexBytes(const char* hex) {
  std::vector<int> out;
  const std::string input(hex);
  assert(input.size() % 2 == 0);
  auto digit=[](char c)->int{
    if(c>='0'&&c<='9')return c-'0';
    if(c>='a'&&c<='f')return c-'a'+10;
    return -1;
  };
  for(std::size_t i=0;i<input.size();i+=2) {
    const int a=digit(input[i]),b=digit(input[i+1]);
    assert(a>=0 && b>=0);
    out.push_back(16*a+b);
  }
  return out;
}
static std::vector<int> primePhiResidues(int count) {
  std::vector<std::uint8_t> composite(1'000'000);
  std::vector<int> out;
  out.reserve(count);
  for(int p=2;p<int(composite.size())&&int(out.size())<count;p++)
    if(!composite[p]) {
      out.push_back((p-1)%29);
      if(1LL*p*p<int(composite.size()))
        for(int multiple=p*p;multiple<int(composite.size());multiple+=p)
          composite[multiple]=1;
    }
  assert(int(out.size())==count);
  return out;
}
int main() {
  const auto original=hexBytes("0f08120306131b000f1a121505020b0619000b1603090209120711180f160c0a15010919060a020811091b0d11090c0b0218151a0e11170d121b000e06000f0d10000d01151a150e1b1a08110106030d1519020a19080e020d061a0015050b0218130a150a1b1a080c1008191b0e1a1201150500090c020b0a02020d1a151c1a09121a170e150711050e171100131009121c0b091406110e06021a0a17181506130b0403140c1a100d0a02170b1608141c000e190d060e0014070c1019000609130c1409151300041b180f1c13150e0e0c1711161713031c0c0817150616151401040910190f1a0108041008050f1610161501040f000312071c161400191304151718130407180a130f090f160401070f141b161819150f170d100504021b0411031702001a0e0a10160a001403001c040316130813060d0819080903081a160f140906191a160511140b151416190b1c071c020311161a0500050b141909020d010e160e060d000f0c1916150d0c03121806191b1502030d181602041519050f110c1a08100e12140406071a0b000a091b051a1c0a1b0302120519050e1b1c0314050004171512011705141c0f0e05061b070f020017150a1b13181906070f0917050d020e0d1c1c07011c0700070b1a0e170705060516170e16041b06090d181a0d051a0800120b1c09161901180804121c02000b18140e0f101300140010060a020114060e1c100f140b0d140e0a1613010810110c14170811131c041109081112060c1714070c1b0d0308121c070a040a080102081a090e11060b0d01151c00090a12171b150417110b1b16130a00100b170a0204140f120c0306111017021809051a1b0f02171500141206080512030a10090e0d10000804171200101907081105000d1814011c09140b0b0514071c1701170c1c0e1707081c021b1905141007120a050d161705090818040a06021c1210060208031b07190b12151c1703191814110b05010e1018110b0d001c0817091b010d0f0107140b0c0815050210190b100e081001160f0d04061a0918060c150907001a09111c1b0d091a180f13111b1c1b0a03110409141c0414141211070908130016111504181b06160c10130e170c131a081c0a140f090705000d130d141c0f0200161b02121a050b14051b131117050c0b0a1016171c121b09100d17020c170c1914051b0c1c0807131a020108100204081514150f09191c060f140f0e030807171312131800051a0519091002060a0b0a05171b0e0819191c061c150010030417050c00010e1c11030e0a1a060f0f111c030a0d0a0b0a0312081c08");
  const auto p56Cipher=hexBytes("190b160f04131a1403080319050206070714190e03180d1317170106071417091a0b05001b19100d0c18020519051700091b12000905150400190a0417120f1a0b1c0115070e03131c070004061b1504111909010f");
  const auto p56Plain=hexBytes("1809120917070a020a0902121712120d07121102120412120e0a0f100f180d18061202181008180f08120f10030a100a0f02121701101a0300120112041a0d0a1406040a1310030f121205030110020a0f0d180612");
  assert(original.size()==946 && p56Cipher.size()==85 && p56Plain.size()==85);
  const int pageLengths[]={262,266,201,217};
  int total=0;for(const int n:pageLengths)total+=n;
  assert(total==int(original.size()));
  for(const int v:original)assert(v>=0&&v<29);
  constexpr int limit=50'000, size=946;
  const auto prime=primePhiResidues(limit+size);
  // Authenticated p56 source positive: GP29 F bypass consumes no prime.
  int cursor=0,literalF=0;
  for(int i=0;i<int(p56Cipher.size());i++) {
    const int p=p56Plain[i];
    if(p==0) {assert(p56Cipher[i]==0);literalF++;assert(i==56);}
    else {assert(p56Cipher[i]==(p+prime[cursor++])%29);}
  }
  assert(cursor==84 && literalF==1);
  int inv[29]={};
  for(int m=1;m<29;m++)
    for(int x=1;x<29;x++)if((m*x)%29==1)inv[m]=x;
  long long count262=0,count528=0,count729=0,count946=0;
  int sourceMax=0,sourceBestPhase=-1,firstBestPhase=-1,firstBestM=-1,firstBestB=-1;
  const auto t0=std::chrono::steady_clock::now();
  // C = P + b + m*phi(prime_j), modulo29; plaintext F bypass unchanged.
  // m=1,b=0 is the historical p56 key itself. Other m,b are exploratory.
  for(int m=1;m<29;m++)for(int b=0;b<29;b++) {
    int wouldGivePlainF[29];
    for(int c=0;c<29;c++)
      wouldGivePlainF[c]=(inv[m]*(c-b+29))%29;
    int localBest=0,localPhase=-1;
    for(int phase=0;phase<limit;phase++) {
      // A bit j means exactly j GP-F bypasses in the prefix so far.
      std::uint64_t states=1;
      int complete=0;
      for(int i=0;i<size;i++) {
        const int c=original[i];
        std::uint64_t next=c==0 ? states<<1:0;
        auto work=states;
        while(work) {
          const int skipped=int(std::countr_zero(work));
          work&=work-1;
          assert(skipped<=41 && phase+i-skipped>=0);
          if(prime[phase+i-skipped]!=wouldGivePlainF[c])
            next|=std::uint64_t{1}<<skipped;
        }
        if(next==0)break;
        states=next;
        complete=i+1;
      }
      if(complete>=262)count262++;
      if(complete>=528)count528++;
      if(complete>=729)count729++;
      if(complete==946) {
        count946++;
        std::printf("CANDIDATE m=%d b=%d phase=%d\n",m,b,phase);
        if(firstBestPhase<0) {
          firstBestPhase=phase;firstBestM=m;firstBestB=b;
        }
      }
      if(complete>localBest){localBest=complete;localPhase=phase;}
    }
    if(m==1&&b==0){sourceMax=localBest;sourceBestPhase=localPhase;}
  }
  const double secs=std::chrono::duration<double>(std::chrono::steady_clock::now()-t0).count();
  assert(count262==2'666'813LL && count528==191'182LL);
  assert(count729==11'259LL && count946==325LL);
  assert(sourceMax==865 && sourceBestPhase==11'840);
  assert(firstBestPhase==8'945 && firstBestM==2 && firstBestB==4);
  std::printf(
    "PASS p56=85/85 source=946 nmodels=%d complete262=%lld complete528=%lld "
    "complete729=%lld complete946=%lld originalOnlyMax=%d originalOnlyPhase=%d "
    "firstCompleteM=%d firstCompleteB=%d firstCompletePhase=%d seconds=%.3f\n",
    limit*28*29,count262,count528,count729,count946,sourceMax,
    sourceBestPhase,firstBestM,firstBestB,firstBestPhase,secs);
  return 0;
}
