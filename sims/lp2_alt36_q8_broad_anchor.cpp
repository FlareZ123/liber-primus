#include <algorithm>
#include <array>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
static constexpr int Q=8;
static constexpr char A[]="0123456789abcdefghijklmnopqrstuvwxyz";
int ix(char c){return c<='9'?c-'0':c-'a'+10;}
string keystr(uint64_t x){string s(Q,'0');for(int i=Q-1;i>=0;i--){s[i]=A[x&63];x>>=6;}return s;}
struct Search {
 const vector<int>& C; const string* w=nullptr; vector<int> P; array<int,Q> K{}; uint64_t nodes=0,leaves=0;
 map<uint64_t,set<string>> hits;
 explicit Search(const vector<int>& c):C(c){}
 uint64_t canon(){uint64_t best=UINT64_MAX;for(int j=0;j<Q;j++){uint64_t x=0;for(int i=0;i<Q;i++)x=(x<<6)|K[(j+i)&(Q-1)];best=min(best,x);}return best;}
 void dfs(int i,int h,int j,int last,int retry){
   ++nodes; const int n=P.size(),m=C.size();
   for(;;){
     if(n-i<m-h)return;
     if(i==n){if(h==m){for(int x:K)if(x<0)abort();hits[canon()].insert(*w);++leaves;}return;}
     if(K[j]<0)break;
     int c=P[i]+K[j];if(c>=36)c-=36;j=(j+1)&(Q-1);
     if(c==last){if(++retry>=Q)return;continue;}
     if(c<29){if(h>=m||C[h]!=c)return;++h;}
     else if(n-i<=m-h)return;
     ++i;last=c;retry=0;
   }
   int p=P[i],next=(j+1)&(Q-1);
   auto assign=[&](int c){int k=c-p;K[j]=k<0?k+36:k;};
   if(h<m&&C[h]!=last){assign(C[h]);dfs(i+1,h+1,next,C[h],0);}
   if(last<36&&retry+1<Q){assign(last);dfs(i,h,next,last,retry+1);}
   if(n-i>m-h)for(int c=29;c<36;c++)if(c!=last){assign(c);dfs(i+1,h,next,c,0);}
   K[j]=-1;
 }
 void run(const string& w0){w=&w0;P.clear();for(char c:w0)P.push_back(ix(c));K.fill(-1);dfs(0,0,0,36,0);}
};
int main(int argc,char**argv){
 if(argc<3){cerr<<"usage: anchor lex.txt compact-anchor...\n";return 1;}
 ifstream f(argv[1]);if(!f)return 2;vector<string> lex;string w;while(f>>w)lex.push_back(w);
 sort(lex.begin(),lex.end(),[](const string&a,const string&b){return a.size()>b.size()||(a.size()==b.size()&&a<b);});
 for(int arg=2;arg<argc;arg++){
  string obs=argv[arg];vector<int>C;for(char c:obs)C.push_back(ix(c));if(C.size()<Q)return 3;
  int n=0;while(n<(int)lex.size()&&lex[n].size()>=C.size())++n;
  uint64_t nodes=0,leaves=0;map<uint64_t,set<string>> hits;double t=omp_get_wtime();
  #pragma omp parallel
  {
   Search s(C);
   #pragma omp for schedule(dynamic,1)
   for(int i=0;i<n;i++)s.run(lex[i]);
   #pragma omp critical
   {nodes+=s.nodes;leaves+=s.leaves;for(auto&[k,v]:s.hits)hits[k].insert(v.begin(),v.end());}
  }
  cout<<"ANCHOR "<<obs<<" forms="<<n<<" nodes="<<nodes<<" leaves="<<leaves<<" keys="<<hits.size()<<" seconds="<<(omp_get_wtime()-t)<<"\n";
  for(auto&[k,ws]:hits){cout<<keystr(k);for(auto&w:ws)cout<<' '<<w;cout<<'\n';}cout.flush();
 }
}
