#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
using U=uint64_t;
constexpr U Q=1ULL<<53;
const string PREFIX="f8i36jr0fqil52b6p0bm3929i7hofmcal19p6a28h9rdh9cb2olqehndir0e60fdg0d1lqlerq8h163dlp2ap8e2d6q0l5b2ojalarq8cg8preqi1l509c2ba22dqlsq9iqnel7h5enh0jg9isb9k6he62qanol6jb43kcqgda2nbm8ks0epd6e0k7cgp069jck9lj04rofsjleecnhmnj3sc8nl6mlk149gpfq184g85fmgml14f03i7smk0pj4lnoj47oajf9fm417fkrmoplfndg542r4h3n20qeagma0k30s43mj8j6d8p8938qmfk96pqm5hkblkmpbs7s23hmq505bkp92d1eme6d0fcpmldc3io6prl23dom24lp5fhcq8geik467qb0a9r5qsar32i5p5ers3k504nli1n5ksfe56r7f20nlarjop67f9n5d2edss71s707bqen7565mnem4r69doqd5q80ibs9mp1o84is20bokefgj0k0g6a21k6esgfkbdkeamj18ghckn8hjs4h98hi6cnk7crd38is7a4a8128q9eh6bd1ls09ainrl4nhbrmja0gbna24kfic36hgn2o95qrf2nl0ki685i3ag9edg084ni0gp78h50dok1s9kbb5k7sn1ncsen78s2rp5kg7ia5dmn598o4a62sig6283r7pbilsn3pokhb51egohbd0s8n9r1df17kbc8l52gpbge8g1mfd46q9o6cl970q9hsrd9qofjhrsra3h49ks4kkih798j0mhl4or6mcgjencjq8sakf9750djdksf20mr2iq5bk5rjhn5cbagmnsir9gdn2cncpk5rcs87jq218g248lklf9ps6fkfe387njijo05q5p9g26aba5nre8pps6sl0g34n5c01esh3eaq6ffhs3adaba3i8s8krqdea7j5ak609r5ed34r8bjmel1jcs6ll75kl1eb0m16sjeo7k1epjnl84q8o6a065plbcer92h1b476km62c02saf66qsrdrpk2sepijigmgs505s62da59cqlblj759hqs3m64j4jdr7pm2mdebk4k4hodgekgjea7bfmj94ihf5gkmfh0e2os1ce46gcsabhme6bls24lh91olhdfsd738ipc69pfc3djierh71iandoc6f56ndqrk24510c2eik14pe8bpjk05lnal35fmiqm816n7oif6l0enebs8a2deqrcnclclisn4kcgegq4cdlcd3aki0cpoql0q0n9keg9pfa351qs9g65oerc2bqbkmikqdri7mc9o8ncf2qc2b2415so1brdqpcf8sgqnqp083mjemb61r4r5a0mabdhilq23pqserika4qnsbp5j6ap1opbo8d0nkasdmq31h6lm1lf15gnpd3bh84a68bq7jc9pnlcmbl5iseo4qo1g5d53cmpdge5g8ncehsp9bsohis7rk7arfdk2ofbrnq4nm24em7qng6kr87j4l054pah6dqno4oem13asogehj6rfhec69sp6lneig36rl8g5aqbgm384b5ir3nogq194cppai0l28eamfajo1b5f79q3de4kpmgrbdjnf0jm7nkg6431f8oqcrk18d7bk6hj1bjc9cpkok6of8lk2hf5153rk5beo9cesjd1j0kslheak24sra53einrgfjsbdsmrp278dco6d8s5ksdrq9akra5pc9p5r4rknhmlrejl58ms9d52ac2c132dorkm7rdbj6hdf9cg3619pi9qainlnlk1keo9lcob8n7dp7pcakl295hags53cil58m8pbmea5igf7i9rqbji5on3mg2p57bes6sjeaej1ej52d3hr9gsed4q35sjl6ek1lag3b0lfk9n3jcp4n7gb2q2fpqifemhs4cdl1d32eo8m4l1i4qkekrk4d7c9so4elqf81kfq691cp993pino3br1oe4ermbjacks82jsq6h5de59mmf6jdigk9bb5l3a7ksh0oigl9ds3g28l";
struct MT {
 array<uint32_t,624> m; int i=624; vector<uint32_t> u;
 explicit MT(U seed){m[0]=19650218;for(int x=1;x<624;x++)m[x]=1812433253U*(m[x-1]^(m[x-1]>>30))+x;
 uint32_t words[2]={uint32_t(seed),uint32_t(seed>>32)};int nw=words[1]?2:1,j=0;i=1;
 for(int k=0;k<624;k++){m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1664525U))+words[j]+j;if(++i==624){m[0]=m[623];i=1;}if(++j==nw)j=0;}
 for(int k=0;k<623;k++){m[i]=(m[i]^((m[i-1]^(m[i-1]>>30))*1566083941U))-i;if(++i==624){m[0]=m[623];i=1;}}
 m[0]=0x80000000U;i=624;u.reserve(256);}
 uint32_t next(){if(i==624){for(int k=0;k<624;k++){uint32_t y=(m[k]&0x80000000U)|(m[(k+1)%624]&0x7fffffffU);m[k]=m[(k+397)%624]^(y>>1)^((y&1)?0x9908b0dfU:0);}i=0;}uint32_t y=m[i++];y^=y>>11;y^=(y<<7)&0x9d2c5680U;y^=(y<<15)&0xefc60000U;y^=y>>18;return y;}
 uint32_t word(int k){while(k>=int(u.size()))u.push_back(next());return u[k];}
 int key(int& k){int v;do{v=word(k++)>>27;}while(v>=29);return v;}
 U coin(int& k){U a=word(k++)>>5,b=word(k++)>>6;return (a<<26)|b;}
};
struct Trial{int key,end;U coin;};
Trial trial(MT& M,int j,int schedule){Trial t{};if(schedule==2)t.coin=M.coin(j);t.key=M.key(j);if(schedule==1)t.coin=M.coin(j);t.end=j;return t;}
struct State{int j,prev; U lo,hi;};
// k=ceil(s*2^53) in [0,Q] is a complete discrete representation of all
// real thresholds. A coin x rejects iff x<k; accepts iff x>=k.
int reach(const vector<int>& C, MT& M, int schedule, bool physical,U low=0,U high=Q){
 vector<State> S,T;S.reserve(64);T.reserve(64);S.push_back({0,-1,low,high});
 for(int i=0;i<int(C.size());i++){
  int c=C[i];T.clear();
  auto add=[&](int j,int prev,U lo,U hi){if(lo<=hi)T.push_back({j,prev,lo,hi});};
  for(const auto& a:S){int j=a.j,prev=a.prev;Trial t=trial(M,j,schedule);int k=t.key;
   if(c==0)add(j,physical?0:prev,a.lo,a.hi);
   if(c!=prev&&(c+29-k)%29!=0)add(t.end,c,a.lo,a.hi);
   int p=(prev+29-k)%29;if(prev<0||!p)continue;
   U l=a.lo,h=a.hi;int pos=t.end;
   while(l<=h){U u=schedule?t.coin:M.coin(pos);if(c==prev)add(pos,c,l,min(h,u));l=max(l,u+1);if(l>h)break;
     t=trial(M,pos,schedule);pos=t.end;int emit=(p+t.key)%29;
     if(emit!=prev){if(emit==c)add(pos,c,l,h);break;}
   }
  }
  if(T.empty())return i;
  sort(T.begin(),T.end(),[](const State&a,const State&b){if(a.j!=b.j)return a.j<b.j;if(a.prev!=b.prev)return a.prev<b.prev;return a.lo<b.lo;});
  S.clear();for(const auto& a:T){if(!S.empty()&&S.back().j==a.j&&S.back().prev==a.prev&&a.lo<=S.back().hi+1)S.back().hi=max(S.back().hi,a.hi);else S.push_back(a);}
 }
 return C.size();
}
vector<int> plant(vector<int> P,MT& M,int schedule,bool physical,U threshold){int j=0,prev=-1;vector<int>C;
 for(int p:P){if(!p){C.push_back(0);if(physical)prev=0;continue;}int emit;
  while(true){Trial t=trial(M,j,schedule);j=t.end;emit=(p+t.key)%29;
    if(emit!=prev)break;U u=schedule?t.coin:M.coin(j);if(u>=threshold)break;}
  C.push_back(emit);prev=emit;}
 return C;
}
int main(int argc,char** argv){vector<int>C;uint32_t h=2166136261U;for(char c:PREFIX){int v=c<='9'?c-'0':c-'a'+10;assert(v>=0&&v<29);C.push_back(v);h=(h^v)*16777619U;}assert(C.size()==2048&&h==0x20215e85U);
 // Independently generated with Python random.Random(7144649572585460758).
 const int expected[3][6]={{13,17,9,14,24,8},{13,14,8,25,11,3},{9,24,6,16,3,14}};
 const U coins[2][6]={{5014518957496516ULL,8449354457494347ULL,1224780805546949ULL,264082876468937ULL,4396555146711454ULL,6098551507680151ULL},{3888631751775669ULL,4216617022035092ULL,2468271677455824ULL,7217308613084626ULL,3367894812710040ULL,6098551507680151ULL}};
 for(int a=0;a<3;a++){MT m(7144649572585460758ULL);int j=0;for(int k=0;k<6;k++){auto t=trial(m,j,a);assert(t.key==expected[a][k]);if(a)assert(t.coin==coins[a-1][k]);j=t.end;}}
 vector<int>P;MT donor(0x3301);int pos=0;for(int i=0;i<2048;i++)P.push_back(donor.key(pos));
 for(int a=0;a<3;a++)for(int b=0;b<2;b++)for(U t:array<U,4>{0,Q/3,Q*4/5,Q}){MT A(0x64929851),B(0x64929851);auto X=plant(P,A,a,b,t);assert(reach(X,B,a,b,t,t)==int(P.size()));MT D(0x64929851);assert(reach(X,D,a,b)==int(P.size()));}
 if(argc>1&&string(argv[1])=="control"){cout<<"controls passed (24 fixed-threshold and 24 all-threshold plants)\n";return 0;}
 if(argc>1&&string(argv[1])=="list"){U seed;while(cin>>seed){cout<<seed;MT M(seed);for(int a=0;a<3;a++)for(int b=0;b<2;b++)cout<<","<<reach(C,M,a,b);cout<<"\n";}return 0;}
 U first=argc>1?stoull(argv[1]):1398988800ULL,last=argc>2?stoull(argv[2]):1399852800ULL;assert(first>=1398988800ULL&&last<=1399852800ULL&&last>=first);
 U hits[6]={},counts[6]={};int maxDead[6]={};
 #pragma omp parallel for schedule(dynamic,128) reduction(+:hits[:6],counts[:6]) reduction(max:maxDead[:6])
 for(U seed=first;seed<last;seed++){MT M(seed);for(int a=0;a<3;a++)for(int b=0;b<2;b++){int m=a*2+b,d=reach(C,M,a,b);counts[m]++;maxDead[m]=max(maxDead[m],d);if(d==int(C.size())){hits[m]++;
 #pragma omp critical
 {cout<<"SURVIVOR "<<seed<<" "<<a<<" "<<b<<"\n";}}}}
 cout<<"window "<<first<<" "<<last<<"\n";for(int m=0;m<6;m++)cout<<"schedule="<<m/2<<" physical="<<m%2<<" count="<<counts[m]<<" max_prefix="<<maxDead[m]<<" survivors="<<hits[m]<<"\n";
}
