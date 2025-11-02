import { TrendingUp, TrendingDown, DollarSign, Clock, Award, Users, Shield, Target, Sparkles } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-light/30">
              <Sparkles className="w-10 h-10 text-purple-light" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Massa Markets Works
          </h1>
          <p className="text-xl text-muted-foreground">
            Predict MAS price movements and earn rewards
          </p>
        </div>

        {/* Overview Card */}
        <div className="brut-card p-8 mb-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-light" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">What is Massa Markets?</h2>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Massa Markets is a <strong className="text-foreground">decentralized prediction market</strong> built on the Massa blockchain. 
            Users predict whether the MAS token price will go <strong className="text-up-bg">UP ↑</strong> or <strong className="text-down-bg">DOWN ↓</strong> during 
            specific time periods called "rounds". 
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Winners share the prize pool proportionally based on their bet amounts! The bigger your bet, the larger your 
            share of the winnings. It's simple, transparent, and fully autonomous through smart contracts.
          </p>
        </div>

        {/* How to Play Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-light" />
            How to Play
          </h2>

          <div className="grid gap-6">
            {/* Step 1 */}
            <div className="brut-card p-6 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-light">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground">
                    Click the "Connect Wallet" button in the header and select your Massa wallet 
                    (Massa Station or Bearby). Make sure you have MAS tokens to place bets.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="brut-card p-6 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-light">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Choose Your Position</h3>
                  <p className="text-muted-foreground mb-3">
                    Look at the current round card and decide if you think the MAS price will go UP or DOWN:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-up-bg/20 border-2 border-up-border/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-up-bg" />
                        <span className="font-bold text-foreground">Enter UP</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bet that the price will be HIGHER at the end of the round
                      </p>
                    </div>
                    <div className="bg-down-bg/20 border-2 border-down-border/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-5 w-5 text-down-bg" />
                        <span className="font-bold text-foreground">Enter DOWN</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bet that the price will be LOWER at the end of the round
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="brut-card p-6 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-light">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Enter Your Bet Amount</h3>
                  <p className="text-muted-foreground">
                    A modal will appear asking you to enter your bet amount. The minimum bet is <strong>100 MAS</strong>. 
                    Enter your desired amount and click "Confirm Bet" to submit your prediction.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="brut-card p-6 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-light">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Wait for Round to End</h3>
                  <p className="text-muted-foreground">
                    Once the round ends, the smart contract will determine the winner based on the actual 
                    price movement. If you predicted correctly, you'll win a share of the prize pool!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="brut-card p-6 hover:translate-y-[-2px] transition-transform">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-light/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-light">5</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Claim Your Rewards</h3>
                  <p className="text-muted-foreground">
                    If you won, click the "Claim" button on the ended round card to collect your winnings. 
                    Your rewards will be transferred directly to your wallet!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Round Lifecycle */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-light" />
            Round Lifecycle
          </h2>

          <div className="brut-card p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-500">●</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Live Round</h3>
                  <p className="text-muted-foreground">
                    The round is active and accepting bets. Users can enter UP or DOWN positions. 
                    The lock price is set at the start of the round.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-500">●</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Calculating</h3>
                  <p className="text-muted-foreground">
                    The round has ended and the smart contract is determining the winner by comparing 
                    the close price to the lock price. No more bets can be placed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-500">●</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Ended</h3>
                  <p className="text-muted-foreground">
                    The round is complete and winners can claim their rewards. The winning side 
                    (UP or DOWN) is displayed on the card.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Calculation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Award className="h-8 w-8 text-purple-light" />
            How Rewards Work
          </h2>

          <div className="brut-card p-8">
            <p className="text-muted-foreground text-lg mb-6">
              Winners share the prize pool proportionally based on their bet amounts:
            </p>

            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground mb-2">Your Reward Formula:</div>
                <div className="text-xl font-mono font-bold text-foreground">
                  Your Reward = (Your Bet / Total Winning Bets) × Total Prize Pool
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-light flex-shrink-0 mt-1" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Total Prize Pool:</strong> Sum of all UP and DOWN bets in the round
                </p>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-light flex-shrink-0 mt-1" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Your Share:</strong> Proportional to your bet size relative to all winning bets
                </p>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-light flex-shrink-0 mt-1" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Bigger Bets = Bigger Rewards:</strong> The more you bet (if you win), the larger your share of the prize pool
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example:</strong> If the total prize pool is 1000 MAS and you bet 100 MAS 
                while total winning bets are 500 MAS, you'll receive (100/500) × 1000 = 200 MAS!
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="brut-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-purple-light" />
            <h2 className="text-2xl font-bold text-foreground">Security & Transparency</h2>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Decentralized:</strong> All predictions and rewards are handled by smart contracts on the Massa blockchain
            </p>
            <p>
               <strong className="text-foreground">Transparent:</strong> All rounds, bets, and outcomes are publicly verifiable on-chain
            </p>
            <p>
               <strong className="text-foreground">Non-Custodial:</strong> You maintain full control of your funds through your wallet
            </p>
            <p>
               <strong className="text-foreground">Autonomous:</strong> Smart contracts execute automatically without human intervention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

