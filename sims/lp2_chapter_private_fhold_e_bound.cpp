// Exact chapter-private E capacity under native plaintext F bypass.
// Branch-and-bound over every cyclic additive key (rotations equivalent).
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
vector<int> readCipher(){
 ifstream f("resources/liber-primus/lp2-corpus.json");assert(f);string s((istreambuf_iterator<char>(f)),{});
 vector<int> c;size_t p=0;for(int page=0;page<56;page++){
  p=s.find("\"indices\"",p);assert(p!=string::npos);p=s.find('[',p)+1;size_t e=s.find(']',p);assert(e!=string::npos);
  string z=s.substr(p,e-p);replace(z.begin(),z.end(),',',' ');istringstream in(z);int v;while(in>>v){assert(v>=0&&v<29);c.push_back(v);}p=e+1;
 }assert(c.size()==12956);return c;
}
struct Search{
 int q,full,B,n;vector<int>a,rot;vector<vector<int>>blocks;
 vector<vector<vector<uint16_t>>> allow,score;
 vector<vector<uint16_t>> maxima,m,e;
 array<int,8>K{},bestKey{};long long nodes=0,possible=0,bounded=0,improvements=0,cap;bool aborted=false;int best=0;
 Search(vector<int> c,int period,long long limit):q(period),full((1<<q)-1),n(c.size()),a(move(c)),cap(limit){
  blocks.emplace_back();for(int x:a){if(!x)blocks.emplace_back();else blocks.back().push_back(x);}
  B=blocks.size();rot.resize(B);allow.assign(q,vector<vector<uint16_t>>(29,vector<uint16_t>(B,full)));score.assign(q,vector<vector<uint16_t>>(29,vector<uint16_t>(B*q)));
  for(int i=0;i<B;i++){rot[i]=blocks[i].size()%q;for(int k=0;k<(int)blocks[i].size();k++){int v=blocks[i][k];for(int j=0;j<q;j++){int s=(j+q-k%q)%q;allow[j][v][i]&=~(1<<s);score[j][(v+29-18)%29][i*q+s]++;}}}
  maxima.assign(q,vector<uint16_t>(B*q));m.assign(q+1,vector<uint16_t>(B,full));e.assign(q+1,vector<uint16_t>(B*q));
  for(int i=0;i<q;i++)for(int z=0;z<B*q;z++){for(int v=0;v<29;v++)maxima[i][z]=max(maxima[i][z],score[i][v][z]);e[0][z]+=maxima[i][z];}
  best=count(a.begin(),a.end(),18);
 }
 bool feasible(int dep,int zero){int p=full;for(int i=0;i<B;i++){p&=m[dep][i];if(!p)return false;int r=rot[i];p=((p<<r)|(p>>(q-r)))&full;if(i+1<B){int v=p&~zero;p|=((v<<1)|(v>>(q-1)))&full;}}return true;}
 int upper(int dep,int zero,int eleven){
  array<int,8>d{},t{};for(int i=0;i<B;i++){t.fill(-100000);int r=rot[i],mask=m[dep][i];for(int j=0;j<q;j++)if((mask>>j&1)&&d[j]>=0){int z=(j+r)%q;t[z]=max(t[z],d[j]+e[dep][i*q+j]);}
   if(i+1==B)return *max_element(t.begin(),t.begin()+q);
   d.fill(-100000);for(int j=0;j<q;j++)if(t[j]>=0){d[j]=max(d[j],t[j]);if(!(zero>>j&1)){int v=(j+1)%q;d[v]=max(d[v],t[j]+((j>=dep||(eleven>>j&1))?1:0));}}
  }return -100000;
 }
 void dfs(int dep,int zero,int eleven){
  if(++nodes>cap){aborted=true;return;}if(!feasible(dep,zero))return;possible++;
  int u=upper(dep,zero,eleven);if(u<=best){bounded++;return;}
  if(dep==q){best=u;bestKey=K;improvements++;return;}
  // Some rotation of every key begins with its smallest digit.
  for(int v=dep?K[0]:0;v<29;v++){
   K[dep]=v;for(int i=0;i<B;i++)m[dep+1][i]=m[dep][i]&allow[dep][v][i];
   for(int i=0;i<B*q;i++)e[dep+1][i]=e[dep][i]-maxima[dep][i]+score[dep][v][i];
   dfs(dep+1,zero|(v==0?1<<dep:0),eleven|(v==11?1<<dep:0));if(aborted)return;
  }
 }
 int checkWitness(){array<int,8>d{},t{};for(int x:a){t.fill(-100000);for(int j=0;j<q;j++)if(d[j]>=0){if(!x)t[j]=max(t[j],d[j]);if(x!=bestKey[j]){int k=(j+1)%q;t[k]=max(t[k],d[j]+((x-bestKey[j]+29)%29==18));}}d=t;}return *max_element(d.begin(),d.begin()+q);}
 void run(string label){dfs(0,0,0);assert(checkWitness()==best);cout<<"{\"label\":\""<<label<<"\",\"n\":"<<n<<",\"q\":"<<q<<",\"nodes\":"<<nodes<<",\"possible\":"<<possible<<",\"bounded\":"<<bounded<<",\"improvements\":"<<improvements<<",\"complete\":"<<(aborted?"false":"true")<<",\"bestE\":"<<best<<",\"key\":[";for(int j=0;j<q;j++)cout<<(j?",":"")<<bestKey[j];cout<<"]}"<<endl;}
};
int main(){
 auto all=readCipher();vector<int>len={729,1145,1729,1903,1021,1433,1680,3008,308};vector<vector<int>> chapters;int off=0;for(int n:len){chapters.emplace_back(all.begin()+off,all.begin()+off+n);off+=n;}
 // The exact all-key low-period result supplies an independent known answer.
 Search(chapters[0],5,20000000).run("opening-q5-control");
 Search(chapters[4],8,50000000).run("chapter4-q8");
 for(int s=1;s<=7;s++)for(int q=6;q<=8;q++)if(!(s==4&&q==8))Search(chapters[s],q,20000000).run("chapter-"+to_string(s));
 // Opening is less constrained. A cap is explicit; an interrupted result
 // is only a witnessed lower bound, never advertised as an upper bound.
 for(int q=6;q<=8;q++)Search(chapters[0],q,50000000).run("opening");
}
