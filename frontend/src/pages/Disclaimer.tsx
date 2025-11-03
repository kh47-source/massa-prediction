import { AlertTriangle, Shield, Info, FileWarning, TrendingUp, Scale } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500/30">
              <AlertTriangle className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Disclaimer & Risk Warning
          </h1>
          <p className="text-xl text-muted-foreground">
            Please read carefully before using Massa Markets
          </p>
        </div>

        {/* Important Notice */}
        <div className="brut-card p-8 mb-8 bg-red-500/10 border-red-500/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Important Notice
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Massa Markets is currently in <strong className="text-foreground">development and testing phase</strong> on 
                the Massa Buildnet network. This is <strong className="text-foreground">NOT</strong> a production environment. 
                Do not use real funds or expect any guarantees of service availability or data persistence.
              </p>
            </div>
          </div>
        </div>

        {/* Risk Warnings */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <FileWarning className="h-8 w-8 text-purple-light" />
            Risk Warnings
          </h2>

          <div className="space-y-6">
            {/* Risk 1 */}
            <div className="brut-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Financial Risk
                  </h3>
                  <p className="text-muted-foreground">
                    Trading prediction markets involves substantial risk of loss. You may lose all or part of your 
                    deposited funds. Never invest more than you can afford to lose. Past performance is not indicative 
                    of future results.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk 2 */}
            <div className="brut-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Smart Contract Risk
                  </h3>
                  <p className="text-muted-foreground">
                    This application relies on smart contracts deployed on the Massa blockchain. Smart contracts may 
                    contain bugs, vulnerabilities, or unexpected behavior that could result in partial or total loss 
                    of funds. The code has not been formally audited.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk 3 */}
            <div className="brut-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Market Volatility
                  </h3>
                  <p className="text-muted-foreground">
                    Cryptocurrency markets are highly volatile and unpredictable. Price movements can be rapid and 
                    significant, leading to unexpected outcomes in prediction markets. Market manipulation and 
                    external factors may affect results.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk 4 */}
            <div className="brut-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Blockchain Network Risk
                  </h3>
                  <p className="text-muted-foreground">
                    The Massa Buildnet is an experimental test network. It may experience downtime, network forks, 
                    resets, or other disruptions. Transactions may fail, be delayed, or behave unexpectedly. Your 
                    data and funds may be lost during network updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk 5 */}
            <div className="brut-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Regulatory Risk
                  </h3>
                  <p className="text-muted-foreground">
                    Prediction markets and cryptocurrency trading may be subject to regulatory restrictions in your 
                    jurisdiction. It is your responsibility to ensure that your use of this platform complies with 
                    all applicable laws and regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Scale className="h-8 w-8 text-purple-light" />
            Terms and Conditions
          </h2>

          <div className="brut-card p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                1. No Warranty
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                This application is provided "as is" without warranty of any kind, either express or implied, 
                including but not limited to warranties of merchantability, fitness for a particular purpose, or 
                non-infringement. The developers make no guarantees about the availability, accuracy, or 
                functionality of the service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                2. Limitation of Liability
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall the developers, contributors, or affiliated parties be liable for any direct, 
                indirect, incidental, special, consequential, or punitive damages arising from your use of or 
                inability to use this application, including but not limited to loss of funds, data, or profits.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                3. User Responsibility
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2 ml-4">
                <li>Securing your wallet and private keys</li>
                <li>Verifying all transaction details before confirmation</li>
                <li>Understanding the risks involved in prediction markets</li>
                <li>Complying with applicable laws and regulations</li>
                <li>Making your own investment decisions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                4. No Financial Advice
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nothing on this platform constitutes financial, investment, legal, or tax advice. You should consult 
                with qualified professionals before making any financial decisions. The platform operators do not 
                recommend any specific trading strategies or positions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                5. Beta Testing & Development
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                This application is currently in beta testing on the Massa Buildnet. Features may change, be added, 
                or removed without notice. The service may be interrupted, suspended, or terminated at any time for 
                maintenance, updates, or other reasons.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                6. Intellectual Property
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                This application is built on open-source software and may contain components licensed under various 
                open-source licenses. The Massa blockchain and related technologies are property of their respective 
                owners.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Info className="h-8 w-8 text-purple-light" />
            Additional Information
          </h2>

          <div className="space-y-6">
            <div className="brut-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-light" />
                How Predictions Work
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Users predict whether the MAS token price will move UP or DOWN during a specific time period (round). 
                Winners are determined by comparing the final price to the starting price. Rewards are distributed 
                proportionally among winners based on their bet amounts.
              </p>
            </div>

            <div className="brut-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-light" />
                Decentralization
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                This application operates on the Massa blockchain, a decentralized network. While the smart contracts 
                execute autonomously, the developers may have administrative controls for emergency situations or 
                updates. Always verify contract permissions and understand the trust model before participating.
              </p>
            </div>

            <div className="brut-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">
                Buildnet vs Mainnet
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The Massa Buildnet is a test network designed for development and experimentation. It uses test tokens 
                that have no real-world value. When this application eventually migrates to mainnet, you will need to 
                use real MAS tokens, which have actual monetary value and associated risks.
              </p>
            </div>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="brut-card p-8 bg-purple-500/10 border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="h-8 w-8 text-purple-light" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Acknowledgment
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                By using Massa Markets, you acknowledge that you have read, understood, and agree to this disclaimer 
                and all associated risks. You confirm that you are using this platform voluntarily and at your own risk.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                If you do not agree with any part of this disclaimer or do not understand the risks involved, 
                <strong className="text-foreground"> please do not use this application</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: November 2, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
