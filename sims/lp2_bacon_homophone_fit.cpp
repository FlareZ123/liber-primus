// Optimize the unknown surjective 32->26 or 32->29 output map on training only.
#define main original_main
#include "lp2_bacon_shared_unknown_codebook.cpp"
#undef main
#include <cmath>
#include <random>
#include <omp.h>
#include <numeric>
#include <sstream>
#include <iomanip>
#include <atomic>
using Map=array<uint8_t,32>;
struct Impact{int w,deltaA,deltaB;};
struct Solution{int score=INT32_MIN;Map map{};};
#ifdef GP_NATIVE
constexpr int ALPHA=29;
const string LABELS=SYMBOLS, RANK="io3f94gank1528j07dqh6lrsebcpm";
#else
constexpr int ALPHA=26;
const string LABELS="ABCDEFGHIJKLMNOPQRSTUVWXYZ", RANK="ETAOINSHRDLUCMFWYPVBGKJXQZ";
#endif
vector<int32_t> lang(ALPHA*ALPHA*ALPHA*ALPHA);
array<array<int32_t,601>,ALPHA> frequencyPenalty{};
struct Fit{
 vector<uint8_t> codes;array<int,32> count{};int N;
 vector<array<uint8_t,4>> windows;
 array<vector<Impact>,32> one;
 array<array<vector<Impact>,32>,32> two;
 Fit(const Groups&g,uint32_t key){for(const auto&t:g){auto x=code(t,key);codes.push_back(x);count[x]++;}N=codes.size()-3;windows.resize(N);
  int pow[4]={ALPHA*ALPHA*ALPHA,ALPHA*ALPHA,ALPHA,1};
  for(int i=0;i<N;i++){array<int,32>w{};for(int j=0;j<4;j++){int x=windows[i][j]=codes[i+j];w[x]+=pow[j];}for(int a=0;a<32;a++)if(w[a])one[a].push_back({i,w[a],0});}
  for(int a=0;a<32;a++)for(int b=a+1;b<32;b++){
   auto &v=two[a][b];size_t i=0,j=0;
   while(i<one[a].size()||j<one[b].size()){
    if(j==one[b].size()||(i<one[a].size()&&one[a][i].w<one[b][j].w)){v.push_back(one[a][i++]);}
    else if(i==one[a].size()||one[b][j].w<one[a][i].w){auto p=one[b][j++];v.push_back({p.w,0,p.deltaA});}
    else{auto x=one[a][i++],y=one[b][j++];v.push_back({x.w,x.deltaA,y.deltaA});}
   }
  }
 }
 int init(const Map&m,vector<int>&index,vector<int>&val){int score=0;for(int i=0;i<N;i++){auto w=windows[i];int x=((m[w[0]]*ALPHA+m[w[1]])*ALPHA+m[w[2]])*ALPHA+m[w[3]];index[i]=x;val[i]=lang[x];score+=val[i];}return score;}
 Solution solve(uint32_t seed,int restarts,int steps,const Map*start=nullptr){
  mt19937 rng(seed);uniform_real_distribution<double> U(0.,1.);vector<int> index(N),value(N);Solution best;
  const string &rank=RANK;
  array<int,32> order{};iota(order.begin(),order.end(),0);stable_sort(order.begin(),order.end(),[&](int a,int b){return count[a]>count[b];});
  vector<double> temp(steps);for(int i=0;i<steps;i++)temp[i]=256.*8.*pow(.025,double(i)/(steps-1));
  for(int it=0;it<restarts;it++){
   Map map{};array<int,ALPHA> mult{};
   if(it==0&&start)map=*start;
   else if(it==0){for(int i=0;i<ALPHA;i++)map[order[i]]=LABELS.find(rank[i]);for(int i=ALPHA;i<32;i++)map[order[i]]=LABELS.find(rank[i-ALPHA]);}
   else if(it%3==0&&best.score>INT32_MIN){map=best.map;for(int q=0;q<4;q++)swap(map[rng()%32],map[rng()%32]);}
   else{for(int i=0;i<ALPHA;i++)map[i]=i;for(int i=ALPHA;i<32;i++)map[i]=LABELS.find(rank[rng()%15]);shuffle(map.begin(),map.end(),rng);}
   for(auto x:map)mult[x]++;
   array<int,ALPHA> hist{};for(int i=0;i<32;i++)hist[map[i]]+=count[i];int score=init(map,index,value);for(int i=0;i<ALPHA;i++)score+=frequencyPenalty[i][hist[i]];if(score>best.score)best={score,map};
   for(int step=0;step<steps;step++){
    int a=rng()%32,b=rng()%32;bool move=(rng()%4==0&&mult[map[a]]>1);int dest=move?rng()%ALPHA:map[b];if(map[a]==dest)continue;
    int oldA=map[a],oldB=map[b],deltaA=dest-oldA,deltaB=0;
    const vector<Impact>*v;
    if(move){v=&one[a];}else{if(a>b){swap(a,b);oldA=map[a];oldB=map[b];}deltaA=oldB-oldA;deltaB=-deltaA;v=&two[a][b];}
    const int src=map[a],dst=move?dest:map[b],change=move?-count[a]:count[b]-count[a];
    int diff=frequencyPenalty[src][hist[src]+change]-frequencyPenalty[src][hist[src]]+frequencyPenalty[dst][hist[dst]-change]-frequencyPenalty[dst][hist[dst]];
    for(auto p:*v){int x=index[p.w]+p.deltaA*deltaA+p.deltaB*deltaB;diff+=lang[x]-value[p.w];}
    if(diff>=0||U(rng)<exp(diff/temp[step])){
     for(auto p:*v){int &x=index[p.w];x+=p.deltaA*deltaA+p.deltaB*deltaB;value[p.w]=lang[x];}
     hist[src]+=change;hist[dst]-=change;
     if(move){mult[oldA]--;mult[dest]++;map[a]=dest;}else swap(map[a],map[b]);score+=diff;
     if(score>best.score)best={score,map};
    }
   }
  }
  vector<int> idx(N),val(N);int verify=init(best.map,idx,val);array<int,ALPHA> hist{};for(int i=0;i<32;i++)hist[best.map[i]]+=count[i];for(int i=0;i<ALPHA;i++)verify+=frequencyPenalty[i][hist[i]];assert(verify==best.score);return best;
 }
 string render(const Map&m)const{string s;for(auto v:codes)s+=LABELS[m[v]];return s;}
};
int main(int argc,char**argv){assert(argc>=7);auto train=readGroups(argv[1]),test=readGroups(argv[2]);ifstream model(argv[3],ios::binary);model.read(reinterpret_cast<char*>(lang.data()),lang.size()*4);model.read(reinterpret_cast<char*>(frequencyPenalty.data()),sizeof(frequencyPenalty));assert(model);ifstream keys(argv[4]);int limit=stoi(argv[5]),restart=stoi(argv[6]),steps=argc>7?stoi(argv[7]):16000;vector<uint32_t>K;string line;while(getline(keys,line)&&int(K.size())<limit){istringstream in(line);uint32_t k;in>>k;K.push_back(k);}assert(!K.empty());struct Row{uint32_t key;int rank;Solution sol;};vector<Row> rows(K.size());atomic<int> progress=0;
 #pragma omp parallel for schedule(dynamic,1)
 for(int i=0;i<int(K.size());i++){Fit f(train,K[i]);auto sol=f.solve(K[i]^3301,restart,steps);rows[i]={K[i],i,sol};auto p=++progress;if(p%100==0)fprintf(stderr,"fit %d/%zu\n",p,K.size());}
 sort(rows.begin(),rows.end(),[](auto&a,auto&b){return a.sol.score>b.sol.score;});for(auto&r:rows){string m;for(auto x:r.sol.map)m+=LABELS[x];cout<<r.key<<' '<<r.rank<<' '<<r.sol.score<<' '<<m<<'\n';}
 cerr<<"winner "<<rows[0].key<<" rank "<<rows[0].rank<<" score "<<rows[0].sol.score<<"\n";
 for(int i=0;i<min(5,int(rows.size()));i++){auto r=rows[i];Fit f(train,r.key),g(test,r.key);cerr<<r.key<<" train "<<f.render(r.sol.map)<<"\n";cerr<<r.key<<" holdout "<<g.render(r.sol.map)<<"\n";}
}
