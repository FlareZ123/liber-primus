// Exact phase-specific rank-label concentration for an all-update fixed-center list.
// Compile beside lp2_recency_allpartition_sft.cpp: C++17 -O3 -march=native -fopenmp.
#define main allpartition_sft_main
#include "lp2_recency_allpartition_sft.cpp"
#undef main
struct PhaseTrace{vector<vector<Event>> phase;vector<int> center;int burn;};
static PhaseTrace phaseTrace(const vector<int>& c,int n,int q){
  const int k=n-1;vector<int> tok(n,-1),last(k,-1);int center=c[0],next=0,seen=0;PhaseTrace out{vector<vector<Event>>(q),vector<int>(q),0};
  for(int a=0;a<n;++a)if(a!=center)tok[a]=next++;
  for(int i=1;i<(int)c.size();++i){int a=c[i];assert(a>=0&&a<n);if(a==center){if(seen==k)++out.center[i%q];continue;}
    int t=tok[a];assert(t>=0);if(seen==k){Mask m=0;for(int u=0;u<k;++u)if(last[u]<last[t])m|=Mask(1)<<u;out.phase[i%q].push_back({t,m});}
    if(last[t]<0){++seen;if(seen==k)out.burn=i+1;}last[t]=i;tok[center]=t;tok[a]=-1;center=a;}
  assert(seen==k);size_t count=out.burn;for(int p=0;p<q;++p)count+=out.phase[p].size()+out.center[p];assert(count==c.size());return out;
}
struct Capacity{int max=0,independent=0,burn=0;Mask mask=0;vector<int> phaseMax;};
static Capacity capacity(const vector<int>& c,int n,int q,bool verify,bool log){
  const int k=n-1,low=min(12,k/2),high=k-low;const size_t N=size_t(1)<<k;const Mask all=Mask(N-1);auto e=phaseTrace(c,n,q);
  vector<uint16_t> sum(N),one(N);Capacity res;res.burn=e.burn;
  for(int p=0;p<q;++p){auto terms=polynomial(e.phase[p]);int maximum=e.center[p];
#pragma omp parallel reduction(max:maximum)
    {vector<Row> rows(1<<low);
#pragma omp for schedule(static)
      for(int hi=0;hi<(1<<high);++hi){fillrows(rows,terms,low,hi);for(Mask lo=0;lo<(1<<low);++lo){Mask s=(Mask(hi)<<low)|lo;int m=pc(s),v=0,best=0;for(int j=0;j<m;++j){v-=rows[lo].a[j];assert(v>=0);best=max(best,v);}assert(v==rows[lo].a[m]);one[s]=best;maximum=max(maximum,best);}}
    }
    res.phaseMax.push_back(maximum);res.independent+=maximum;
#pragma omp parallel for schedule(static)
    for(size_t i=0;i<N;++i){int v=max(e.center[p],int(max(one[i],one[all^i])));sum[i]+=v;}
    if(verify){for(Mask s=0;s<N;++s){auto a=brute(e.phase[p],s,n),b=brute(e.phase[p],all^s,n);int v=*max_element(a.begin(),a.end());assert(one[s]==v);}}
    if(log)cerr<<"phase "<<p<<"/"<<q<<" events="<<e.phase[p].size()<<" center="<<e.center[p]<<" max="<<maximum<<"\n";
  }
  auto best=max_element(sum.begin(),sum.end());res.max=*best;res.mask=best-sum.begin();int check=0;
  for(int p=0;p<q;++p){auto a=brute(e.phase[p],res.mask,n),b=brute(e.phase[p],all^res.mask,n);check+=max({e.center[p],*max_element(a.begin(),a.end()),*max_element(b.begin(),b.end())});}assert(check==res.max);
  if(verify){for(Mask s=0;s<N;++s){int v=0;for(int p=0;p<q;++p){auto a=brute(e.phase[p],s,n),b=brute(e.phase[p],all^s,n);v+=max({e.center[p],*max_element(a.begin(),a.end()),*max_element(b.begin(),b.end())});}assert(v==sum[s]);}}
  assert(res.max<=res.independent);return res;
}
int main(int argc,char**argv){
  if(argc<3)return 2;mt19937 rng(82013);int cases=0;
  for(int n=4;n<=10;++n){vector<int> c;for(int i=0;i<800;++i)c.push_back(rng()%n);for(int q:{1,3,8,13}){capacity(c,n,q,true,false);++cases;}}
  cerr<<"exact reduced phase capacities verified: "<<cases<<"\n";
  ifstream f(argv[1]);vector<int> c;char ch;uint32_t hash=2166136261u;while(f>>ch){int x=ch<='9'?ch-'0':ch-'A'+10;assert(x>=0&&x<29);c.push_back(x);hash=(hash^(unsigned char)ch)*16777619u;}assert(c.size()==12956&&hash==0x75f0ccfau);
  for(int i=2;i<argc;++i){int q=stoi(argv[i]);assert(q>=1&&q<=64);auto t=chrono::steady_clock::now();auto r=capacity(c,29,q,false,true);cout<<"{\"period\":"<<q<<",\"masks\":"<<(uint64_t(1)<<28)<<",\"burn\":"<<r.burn<<",\"max\":"<<r.max<<",\"mask\":"<<r.mask<<",\"independent\":"<<r.independent<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<",\"phase_max\":[";for(int p=0;p<q;++p){if(p)cout<<",";cout<<r.phaseMax[p];}cout<<"]}"<<endl;}
  return 0;
}
