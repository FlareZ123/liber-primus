// Enumerate period-eight GP29 literal-F-hold keys via block masks, anchor rotation.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <vector>
using namespace std;
constexpr unsigned FULL=255;
unsigned rot(unsigned x,int n){n%=8;return ((x<<n)|(x>>(8-n)))&255;}
struct Block{int lo,len;array<array<unsigned,29>,8> allow;};
struct Search{
 vector<int> c;vector<Block> b;int anchor=-1;array<int,8> key{},order{};array<vector<int>,8> domains;vector<array<unsigned,8>> dummy;
 vector<array<unsigned,9>> masks;uint64_t nodes=0,leaves=0,cap;array<uint64_t,9> hist{},vis{},pass{};int maxnz=-1;array<int,8> maxkey{};bool capped=false;chrono::steady_clock::time_point start;
 Search(vector<int> c_,uint64_t cap_):c(move(c_)),cap(cap_){
  for(int i=0;i<(int)c.size();){int j=i+1;if(c[i])while(j<(int)c.size()&&c[j])j++;Block z;z.lo=i;z.len=j-i;for(auto& a:z.allow)a.fill(FULL);
   if(c[i]){for(int q=0;q<8;q++)for(int p=i;p<j;p++)z.allow[(q+p-i)%8][c[p]]&=~(1u<<q);if(anchor<0||z.len>b[anchor].len)anchor=b.size();}b.push_back(z);i=j;
  }
  masks.resize(b.size());for(auto&m:masks)m.fill(FULL);masks[anchor][0]=1;
  for(int q=0;q<8;q++){key[q]=-1;order[q]=q;for(int k=0;k<29;k++)if(b[anchor].allow[q][k]&1)domains[q].push_back(k);}
  sort(order.begin(),order.end(),[&](int a,int z){return domains[a].size()<domains[z].size();});
 }
 bool viable(int d,unsigned zero){unsigned v=FULL;for(int i=0;i<(int)b.size();i++){auto& z=b[i];if(c[z.lo]){v&=masks[i][d];if(!v)return false;v=rot(v,z.len);}else v|=rot(v&~zero,1);}return v;}
 void dfs(int d,unsigned zero,int nz){
  if(capped)return;if(++nodes>cap){capped=true;return;}vis[d]++;
  if(!viable(d,zero))return;pass[d]++;
  if(d==8){leaves++;hist[nz]++;if(nz>maxnz){maxnz=nz;maxkey=key;}if(leaves<=100000){for(int k:key)cout<<k<<' ';cout<<'\n';}return;}
  int q=order[d];for(int k:domains[q]){key[q]=k;bool ok=true;for(int i=0;i<(int)b.size();i++)if(c[b[i].lo]){unsigned v=masks[i][d]&b[i].allow[q][k];masks[i][d+1]=v;if(!v){ok=false;break;}}
   if(ok)dfs(d+1,zero|(k==0?(1u<<q):0),nz+(k!=0));if(capped)return;
  }key[q]=-1;
 }
 void run(){start=chrono::steady_clock::now();dfs(0,0,0);auto elapsed=chrono::duration<double>(chrono::steady_clock::now()-start).count();cerr<<"{\"blocks\":"<<b.size()<<",\"anchor\":"<<b[anchor].lo<<",\"anchorLength\":"<<b[anchor].len<<",\"nodes\":"<<nodes<<",\"keys\":"<<leaves<<",\"capped\":"<<(capped?"true":"false")<<",\"seconds\":"<<elapsed<<",\"maxNonzero\":"<<maxnz<<",\"maxKey\":[";for(int i=0;i<8;i++)cerr<<(i?",":"")<<maxkey[i];cerr<<"],\"hist\":[";for(int i=0;i<9;i++)cerr<<(i?",":"")<<hist[i];cerr<<"],\"visited\":[";for(int i=0;i<9;i++)cerr<<(i?",":"")<<vis[i];cerr<<"],\"passed\":[";for(int i=0;i<9;i++)cerr<<(i?",":"")<<pass[i];cerr<<"]}\n";}
};
int main(){int n;uint64_t cap;cin>>n>>cap;vector<int> c(n);for(int& x:c)cin>>x;Search(move(c),cap).run();}
