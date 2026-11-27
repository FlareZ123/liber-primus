// Exact quadratic scalar feedback inverse with authentic consuming-only F.
// Compile C++20; reads one base-29 tape line on stdin.
#include <algorithm>
#include <array>
#include <bit>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29; constexpr uint32_t FULL=(1u<<Q)-1;
constexpr int PRIME[Q]={2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109};
using Row=array<array<uint32_t,Q>,Q>;
int main(int argc,char**argv){
 if(argc!=4){cerr<<"usage: executable ordinal-c|prime-c|prime-p|autonomous continuous|pages emit|summary\n";return 1;}
 const string model=argv[1],clock=argv[2],output=argv[3];
 if((model!="ordinal-c"&&model!="prime-c"&&model!="prime-p"&&model!="autonomous")||(clock!="continuous"&&clock!="pages")||(output!="emit"&&output!="summary"))return 2;
 string tape;cin>>tape;vector<int>C;for(char c:tape){int x=c>='0'&&c<='9'?c-'0':c-'a'+10;if(x<0||x>=Q)return 2;C.push_back(x);}if(C.empty())return 2;
 vector<int> ends;int n=(int)C.size();
 if(clock=="pages"){int len,total=0;while(cin>>len){if(len<=0||total+len>n)return 2;total+=len;ends.push_back(total);}if(total!=n)return 2;}else ends.push_back(n);
 const bool pp=model=="prime-p",aut=model=="autonomous",cp=model=="prime-c";
 // C-driven state paths and F-zero legality depend only on b/a,d/a.
 // For autonomous use a=1 as well, covering all 28 output scales.
 const int amax=pp?28:1;
 uint64_t tested=0,surv=0,nontrivial=0;int longest=-1;array<int,5> best{};vector<uint64_t> counts(ends.size());
 uint64_t sourceTested=0,sourceSurv=0;int sourceLongest=-1;
 for(int u=aut?0:1;u<=(aut?0:28);u++)for(int v=0;v<Q;v++){
   uint32_t nxt[Q][Q];for(int s=0;s<Q;s++)for(int p=0;p<Q;p++)nxt[s][p]=1u<<((s*s+u*(pp||cp?PRIME[p]:p)+v)%Q);
   for(int a=1;a<=amax;a++)for(int b=1;b<Q;b++)for(int d=0;d<Q;d++){
     Row row;uint32_t ready=0,m=0;int pos=0,j=0,reach=0;bool source=u==15&&v==17;
     for(int end:ends){m=FULL;int i=pos;for(;i<end&&m;i++){
       const int c=C[i];if(!(ready>>c&1)){
         int p=(a*c+d)%Q;for(int s=0;s<Q;s++){row[c][s]=p==0?0:nxt[s][pp?p:c];p+=b;if(p>=Q)p-=Q;}ready|=1u<<c;
       }
       uint32_t nm=c==0?m:0;while(m){int s=countr_zero(m);m&=m-1;nm|=row[c][s];}m=nm;
     }
     if(j==0)reach=i-(m==0);if(!m)break;++counts[j];++j;pos=end;}
     ++tested;if(reach>longest){longest=reach;best={u,v,a,b,d};}
     if(source){++sourceTested;sourceLongest=max(sourceLongest,reach);}
     if(j==(int)ends.size()){
       ++surv;if(source)++sourceSurv;
       bool degenerate=aut;uint32_t z=m;while(z){int s=countr_zero(z);z&=z-1;degenerate=degenerate&&(s*s+v)%Q==s&&(b*s+d)%Q==0;}
       if(!degenerate)++nontrivial;
       if(output=="emit")cout<<"{\"key\":["<<u<<','<<v<<','<<a<<','<<b<<','<<d<<"],\"finalMask\":"<<m<<"}\n";
     }
   }
 }
 cout<<"{\"model\":\""<<model<<"\",\"clock\":\""<<clock<<"\",\"size\":"<<n<<",\"tested\":"<<tested<<",\"survivors\":"<<surv<<",\"nontrivial\":"<<nontrivial<<",\"longestFirstScope\":"<<longest<<",\"best\":[";for(int k=0;k<5;k++)cout<<(k?",":"")<<best[k];cout<<"],\"sourceTested\":"<<sourceTested<<",\"sourceSurvivors\":"<<sourceSurv<<",\"sourceLongest\":"<<sourceLongest<<",\"scopeSurvivors\":[";for(size_t k=0;k<counts.size();k++)cout<<(k?",":"")<<counts[k];cout<<"]}\n";
}
