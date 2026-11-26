// Read one line of six certified pair bounds per held label (0..28).
// Exact DP over partitions of phase positions, using sound clique-cover lower bounds.
#include <algorithm>
#include <array>
#include <fstream>
#include <iostream>
#include <vector>
using namespace std;constexpr int Q=13,N=1<<Q,INF=1000;
int main(int argc,char**argv){ifstream f(argv[1]);for(int h=0;h<29;h++){array<int,7>L{};for(int d=1;d<=6;d++)f>>L[d];int pair[Q][Q]{};for(int i=0;i<Q;i++)for(int j=0;j<Q;j++){int d=abs(i-j);pair[i][j]=L[min(d,Q-d)];}vector<int> cnt(N),sum(N),clique(N),cover(N);for(int m=1;m<N;m++){int bit=m&-m,i=__builtin_ctz(bit),r=m^bit;cnt[m]=cnt[r]+1;sum[m]=sum[r];for(int s=r;s;s&=s-1)sum[m]+=pair[i][__builtin_ctz(s)];clique[m]=cnt[m]<2?0:(sum[m]+cnt[m]-2)/(cnt[m]-1);cover[m]=clique[m];for(int s=r;s;s=(s-1)&r){int a=s|bit;if(a==m)continue;cover[m]=max(cover[m],cover[a]+cover[m^a]);}}
 vector<array<int,Q+1>>dp(N);for(auto& a:dp)a.fill(INF);dp[0][0]=0;for(int m=1;m<N;m++){int bit=m&-m,r=m^bit;for(int s=r;;s=(s-1)&r){int a=s|bit,b=m^a;for(int k=0;k<=cnt[b];k++)dp[m][k+1]=min(dp[m][k+1],cover[a]+dp[b][k]);if(!s)break;}}
 cout<<h;for(int k=1;k<=Q;k++)cout<<" "<<dp[N-1][k];cout<<"\n";}}
