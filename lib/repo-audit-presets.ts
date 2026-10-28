import { RepoFileEntry } from '@/lib/deterministic-auditor';

export interface RepoPresetScenario {
  id: string;
  name: string;
  subtitle: string;
  expectedBadge: string;
  files: RepoFileEntry[];
}

const COMPLIANT_PILLAR_1 = `
export default function MonteCarloMethodologyGuide() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2 text-xs">
          <li><a href="/">Home</a></li>
          <li><a href="/guides">Quantitative Guides</a></li>
          <li>Monte Carlo Value-at-Risk Architecture</li>
        </ol>
      </nav>
      <h1>Parametric vs. Historical Monte Carlo Value-at-Risk (VaR)</h1>
      <p>Reviewed by Dr. Elena Vance, CFA — Updated March 2026</p>
      <p>
        Institutional risk engines estimate portfolio drawdowns using two primary paradigms:
        parametric variance-covariance matrices and non-parametric historical simulation. While
        closed-form Gaussian Value-at-Risk assumes log-normal asset returns and stationary correlation
        tensors, empirical financial series exhibit leptokurtic fat tails and asymmetric downside
        clustering during liquidity contractions. When volatility regimes shift rapidly, a static
        thirty-day covariance matrix systematically understates ninety-ninth percentile tail losses.
      </p>
      <h2>Mathematical Formulation & Cholesky Decomposition</h2>
      <p>
        To simulate correlated multi-asset trajectories across ten thousand stochastic paths, we
        decompose the positive-definite covariance matrix Sigma into a lower triangular matrix L
        such that L multiplied by its transpose equals Sigma. Independent standard normal variates
        drawn from a Mersenne Twister pseudorandom generator are transformed via L to preserve
        cross-asset co-movement across equity, sovereign duration, and foreign exchange exposures.
        Each simulated path compounds daily geometric Brownian increments with jump-diffusion Poisson
        shocks calibrated to historical crisis episodes.
      </p>
      <figure className="my-6 p-4 border rounded-lg">
        <svg viewBox="0 0 600 180" role="img" aria-label="Cholesky Monte Carlo Pipeline">
          <rect x="10" y="40" width="150" height="80" rx="8" fill="#111827" stroke="#10b981" />
          <text x="25" y="85" fill="#ecfdf5" fontSize="12">Covariance Tensor</text>
          <rect x="220" y="40" width="150" height="80" rx="8" fill="#111827" stroke="#38bdf8" />
          <text x="235" y="85" fill="#e0f2fe" fontSize="12">Cholesky Factor L</text>
          <rect x="430" y="40" width="150" height="80" rx="8" fill="#111827" stroke="#f59e0b" />
          <text x="445" y="85" fill="#fef3c7" fontSize="12">99% CVaR Tail Loss</text>
        </svg>
        <figcaption>Figure 1: Stochastic path generation from Cholesky factorization to Expected Shortfall.</figcaption>
      </figure>
      <h2>Deterministic Sensitivity Matrix Across Volatility Regimes</h2>
      <table>
        <thead>
          <tr>
            <th>Annualized Volatility</th>
            <th>Gaussian 95% VaR</th>
            <th>Cornish-Fisher 99% VaR</th>
            <th>Expected Shortfall (CVaR)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>12.0% Low Regime</td><td>-1.98%</td><td>-3.12%</td><td>-3.84%</td></tr>
          <tr><td>24.0% Elevated Regime</td><td>-3.95%</td><td>-6.85%</td><td>-8.42%</td></tr>
          <tr><td>42.0% Liquidity Stress</td><td>-6.91%</td><td>-13.40%</td><td>-17.15%</td></tr>
        </tbody>
      </table>
      <h2>Practical Limitations & Edge Cases</h2>
      <p>
        Practitioners must recognize that even Expected Shortfall remains sensitive to the lookback
        window length. A five-year calibration window dilutes acute structural breaks, whereas a
        sixty-day window overreacts to transient earnings noise. Combining exponentially weighted
        moving averages (EWMA) with stressed historical scenarios provides a balanced capital reserve
        framework for treasury desks and algorithmic rebalancing systems. Related technical guides include
        <a href="/guides/sharpe-sortino-tail-risk">Downside Semivariance & Sortino Optimization</a> and
        <a href="/guides/kelly-criterion-fractional-sizing">Fractional Kelly Criterion Position Sizing</a>.
      </p>
    </article>
  );
}
`;

const COMPLIANT_PILLAR_2 = `
export default function SortinoTailRiskGuide() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2 text-xs">
          <li><a href="/">Home</a></li>
          <li><a href="/guides">Quantitative Guides</a></li>
          <li>Sortino Ratio & Semivariance Mechanics</li>
        </ol>
      </nav>
      <h1>Downside Semivariance: Why the Sortino Ratio Outperforms Sharpe in Skewed Strategies</h1>
      <p>Reviewed by Dr. Elena Vance, CFA — Updated March 2026</p>
      <p>
        Standard mean-variance optimization penalizes upside price breakouts identically to destructive
        downside drawdowns because standard deviation squares all deviations around the arithmetic mean.
        For convex trend-following strategies, covered call writes, and venture allocations with positive
        skewness, the classical Sharpe ratio distorts risk-adjusted efficiency. By isolating returns that
        fall below a minimum acceptable threshold (MAR), downside semivariance measures only harmful
        volatility that threatens compounding capital survival.
      </p>
      <h2>Continuous Lower Partial Moment Integration</h2>
      <p>
        Formally, the target downside deviation corresponds to the square root of the second-order lower
        partial moment integrated from negative infinity up to the investor benchmark rate tau. Every
        period where portfolio performance exceeds tau contributes zero to the denominator, preventing
        artificial penalization of right-tail gains. Conversely, strategies that sell out-of-the-money
        put options display deceptively high Sharpe ratios during calm markets while accumulating severe
        lower partial moment exposure that the Sortino metric immediately exposes.
      </p>
      <table>
        <thead>
          <tr>
            <th>Strategy Profile</th>
            <th>Annualized Return</th>
            <th>Sharpe Ratio</th>
            <th>Sortino Ratio (MAR 4.5%)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Uncapped Trend Following</td><td>16.4%</td><td>1.18</td><td>2.04</td></tr>
          <tr><td>Short Volatility Put Write</td><td>11.2%</td><td>1.42</td><td>0.79</td></tr>
          <tr><td>Balanced Sovereign Parity</td><td>9.8%</td><td>1.05</td><td>1.36</td></tr>
        </tbody>
      </table>
      <h2>Implementation in Automated Rebalancing Engines</h2>
      <p>
        When constructing automated portfolio weights, replacing the full sample covariance matrix with a
        cosekewness-aware downside semideviation matrix requires numerical quadratic programming. Ensure
        minimum sample sizes exceed thirty-six monthly observations or two hundred fifty daily bars so
        that rare drawdown events are adequately represented. Cross-reference our companion studies on
        <a href="/guides/monte-carlo-var-methodology">Cholesky Monte Carlo Value-at-Risk</a> and
        <a href="/guides/kelly-criterion-fractional-sizing">Fractional Kelly Criterion Position Sizing</a>.
      </p>
    </article>
  );
}
`;

const COMPLIANT_PILLAR_3 = `
export default function KellyCriterionGuide() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <nav aria-label="Breadcrumb">
        <ol className="ol-breadcrumb flex gap-2 text-xs">
          <li><a href="/">Home</a></li>
          <li><a href="/guides">Quantitative Guides</a></li>
          <li>Fractional Kelly Geometric Growth</li>
        </ol>
      </nav>
      <h1>Fractional Kelly Criterion & Ruin Probability Bounds Under Estimation Error</h1>
      <p>Reviewed by Dr. Elena Vance, CFA — Updated March 2026</p>
      <p>
        Originally derived by John Larry Kelly Jr. at Bell Laboratories to maximize logarithmic information
        transmission over noisy channels, the Kelly criterion determines the exact capital fraction that
        maximizes long-horizon geometric compounding growth. However, applying full Kelly leverage in
        financial markets where win probabilities and payoff odds are estimated from finite noisy samples
        frequently induces catastrophic fifty-percent-plus equity drawdowns whenever true edge drifts
        below historical backtest assumptions.
      </p>
      <h2>Geometric Growth Rate vs. Horizon Drawdown Trade-Off</h2>
      <p>
        Scaling allocation down to a half-Kelly or quarter-Kelly multiplier sacrifices only a minor fraction
        of theoretical asymptotic growth while exponentially compressing the probability of breaching a
        maximum drawdown covenant. Specifically, under Gaussian return approximations, a half-Kelly
        allocation retains seventy-five percent of the optimal geometric drift while cutting portfolio
        variance by seventy-five percent.
      </p>
      <table>
        <thead>
          <tr>
            <th>Kelly Fraction Multiplier</th>
            <th>Retained Geometric Growth</th>
            <th>Portfolio Variance Reduction</th>
            <th>Probability of 50% Drawdown</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1.00x Full Kelly</td><td>100.0%</td><td>0.0%</td><td>50.0%</td></tr>
          <tr><td>0.50x Half Kelly</td><td>75.0%</td><td>75.0%</td><td>12.5%</td></tr>
          <tr><td>0.25x Quarter Kelly</td><td>43.8%</td><td>93.8%</td><td>1.6%</td></tr>
        </tbody>
      </table>
      <p>
        Explore related methodology documentation in
        <a href="/guides/monte-carlo-var-methodology">Monte Carlo Value-at-Risk Architecture</a> and
        <a href="/guides/sharpe-sortino-tail-risk">Downside Semivariance & Sortino Optimization</a>.
      </p>
    </article>
  );
}
`;

export const REPO_AUDIT_PRESET_SCENARIOS: RepoPresetScenario[] = [
  {
    id: 'repo-flawed-ai-build',
    name: 'Preset A: Flawed AI Repo (Missing ads.txt, Doorway pSEO & Fake Lab Claims)',
    subtitle:
      'Simulates a typical 8-file repository generated without AdSenseGuard: missing /ads.txt, 89% 5-gram doorway duplication, picsum.photos stock images, @example.com contact, and ads on 404.',
    expectedBadge: 'EXPECT: NOT READY · 11 REPO & POLICY FAILURES',
    files: [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'flawed-ai-converter-site',
          dependencies: { next: '15.1.0', react: '19.0.0' },
        }),
      },
      {
        path: 'app/layout.tsx',
        content: `
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1111111111111111"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        path: 'app/page.tsx',
        content: `
export default function HomePage() {
  // TODO: add remaining 600 words of explanation here later
  return (
    <main>
      <nav>
        <a href="#">Tools</a>
        <a href="javascript:void(0)">Guides</a>
      </nav>
      <h1>Ultimate Fast Unit Converter</h1>
      <p>In our 30-day laboratory testing across 500 enterprise servers, this converter proved 99.8% faster.</p>
      <img src="https://picsum.photos/seed/tool/800/400" alt="Random placeholder" />
      <ins className="adsbygoogle" data-ad-client="ca-pub-1111111111111111" data-ad-slot="12345"></ins>
      <div className="calculator-ui">
        <button>Calculate Now</button>
      </div>
      <ins className="adsbygoogle" data-ad-client="ca-pub-1111111111111111" data-ad-slot="67890"></ins>
    </main>
  );
}`,
      },
      {
        path: 'app/guides/km-to-miles/page.tsx',
        content: `
export default function KmToMilesPage() {
  return (
    <main>
      <h1>Convert Kilometers to Miles Instantly</h1>
      <p>
        Welcome to our free online conversion page where you can convert Kilometers to Miles quickly and
        accurately using our simple digital calculator tool for students and everyday users around the world.
        Simply enter the value in Kilometers into the input box above and press the convert button to get
        the exact result in Miles without any complicated math or manual formulas needed today.
      </p>
    </main>
  );
}`,
      },
      {
        path: 'app/guides/kg-to-lbs/page.tsx',
        content: `
export default function KgToLbsPage() {
  return (
    <main>
      <h1>Convert Kilograms to Pounds Instantly</h1>
      <p>
        Welcome to our free online conversion page where you can convert Kilograms to Pounds quickly and
        accurately using our simple digital calculator tool for students and everyday users around the world.
        Simply enter the value in Kilograms into the input box above and press the convert button to get
        the exact result in Pounds without any complicated math or manual formulas needed today.
      </p>
    </main>
  );
}`,
      },
      {
        path: 'app/not-found.tsx',
        content: `
export default function NotFoundPage() {
  return (
    <div>
      <h1>404 Page Not Found</h1>
      <ins className="adsbygoogle" data-ad-client="ca-pub-1111111111111111" data-ad-slot="99999"></ins>
    </div>
  );
}`,
      },
      {
        path: 'app/contact/page.tsx',
        content: `
export default function ContactPage() {
  return (
    <main>
      <h1>Contact Us</h1>
      <p>Email us at admin@example.com or visit 123 Main St.</p>
    </main>
  );
}`,
      },
    ],
  },
  {
    id: 'repo-compliant-production',
    name: 'Preset B: Complete 2026 Compliant Multi-File Repository (100% Score)',
    subtitle:
      'Simulates a complete 12-file production repository with /ads.txt, /robots.txt, /sitemap.xml, Consent Mode v2 + TCF v2.2, DART Privacy, Corrections Policy, inline SVG, and < 12% shingle overlap.',
    expectedBadge: 'EXPECT: READY FOR REVIEW · 100% REPO SCORE',
    files: [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'quantmetrics-compliant-portal',
          dependencies: { next: '15.2.0', react: '19.0.0' },
        }),
      },
      {
        path: 'public/ads.txt',
        content: `google.com, pub-4829103948571029, DIRECT, f08c47fec0942fa0\n`,
      },
      {
        path: 'public/robots.txt',
        content: `User-agent: Mediapartners-Google\nAllow: /\n\nUser-agent: *\nAllow: /\nSitemap: https://quantmetrics.io/sitemap.xml\n`,
      },
      {
        path: 'public/sitemap.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://quantmetrics.io/</loc></url>
  <url><loc>https://quantmetrics.io/guides/monte-carlo-var-methodology</loc></url>
  <url><loc>https://quantmetrics.io/guides/sharpe-sortino-tail-risk</loc></url>
  <url><loc>https://quantmetrics.io/guides/kelly-criterion-fractional-sizing</loc></url>
  <url><loc>https://quantmetrics.io/about</loc></url>
  <url><loc>https://quantmetrics.io/privacy</loc></url>
  <url><loc>https://quantmetrics.io/contact</loc></url>
  <url><loc>https://quantmetrics.io/terms</loc></url>
</urlset>`,
      },
      {
        path: 'app/layout.tsx',
        content: `
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4829103948571029" />
        <script dangerouslySetInnerHTML={{ __html: \`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          window.__tcfapi = window.__tcfapi || function() {};
        \` }} />
        <script async src="https://fundingchoicesmessages.google.com/i/pub-4829103948571029?ers=1" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4829103948571029" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        path: 'app/not-found.tsx',
        content: `
export default function NotFound() {
  // Zero AdSense units rendered on 404 system error routes (ADS-UX-02)
  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <h1>404 — Quantitative Resource Not Found</h1>
      <p>Return to our verified research index below:</p>
      <ul>
        <li><a href="/guides/monte-carlo-var-methodology">Monte Carlo VaR Architecture</a></li>
        <li><a href="/guides/sharpe-sortino-tail-risk">Downside Semivariance & Sortino Ratio</a></li>
      </ul>
    </main>
  );
}`,
      },
      {
        path: 'app/privacy/page.tsx',
        content: `
export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1>Privacy Policy & Advertising Cookie Disclosure</h1>
      <p>
        Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie)
        to serve ads based on a user's prior visits to this website or other websites on the internet.
        Users may opt out of personalized advertising by visiting Google Ads Settings
        (https://adssettings.google.com) or https://www.aboutads.info/choices/.
      </p>
      <p>
        For visitors in the European Economic Area (EEA), the United Kingdom, and Switzerland,
        we enforce Google Consent Mode v2 and the IAB Transparency and Consent Framework (TCF v2.2).
      </p>
    </main>
  );
}`,
      },
      {
        path: 'app/about/page.tsx',
        content: `
export default function AboutEditorialPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1>About Our Quantitative Methodology & Editorial Corrections Policy</h1>
      <p>Lead Architect: Dr. Elena Vance, CFA & Principal Systems Architect.</p>
      <h2>Editorial Methodology & Verification Standards</h2>
      <p>
        All mathematical calculators and sensitivity matrices published on QuantMetrics are derived
        from peer-reviewed stochastic calculus and verified against open numerical benchmarks.
      </p>
      <h2>Corrections Policy & Data Accuracy</h2>
      <p>
        We maintain a strict Corrections Policy: if a formula discrepancy or rounding edge case is
        reported via our contact channel, our engineering team audits the derivation within 48 hours
        and appends a dated revision note to the article header.
      </p>
    </main>
  );
}`,
      },
      {
        path: 'app/contact/page.tsx',
        content: `
export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1>Contact Editorial & Quantitative Engineering</h1>
      <p>Direct Editorial Desk: editorial@quantmetrics.io (Response SLA: 24–48 business hours).</p>
      <form action="/api/contact" method="POST" className="space-y-4">
        <input type="email" name="email" required placeholder="your.name@institution.org" />
        <textarea name="message" required rows={5} placeholder="Report a formula question or feedback" />
        <button type="submit">Submit Inquiry</button>
      </form>
    </main>
  );
}`,
      },
      {
        path: 'app/terms/page.tsx',
        content: `
export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1>Terms of Service & Informational Disclaimer</h1>
      <p>All quantitative calculators and sensitivity tables are provided for educational and research purposes.</p>
    </main>
  );
}`,
      },
      {
        path: 'app/page.tsx',
        content: `
export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication",
            "name": "Institutional Portfolio Risk & VaR Simulator",
            "author": { "@type": "Person", "name": "Dr. Elena Vance, CFA" }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quantmetrics.io/" }
            ]
          }
        ]
      }) }} />
      <header className="mb-8">
        <nav aria-label="Primary">
          <a href="/guides/monte-carlo-var-methodology">Monte Carlo Guide</a>
          <a href="/guides/sharpe-sortino-tail-risk">Sortino Guide</a>
          <a href="/guides/kelly-criterion-fractional-sizing">Kelly Sizing</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </nav>
        <h1>Institutional Value-at-Risk (VaR) & Expected Shortfall Workbench</h1>
        <p>By Dr. Elena Vance, CFA — Updated March 2026</p>
      </header>
      <section className="p-6 border rounded-xl mb-10">
        <h2>Interactive Parametric & Cornish-Fisher VaR Calculator</h2>
        <p>Configure portfolio notional, horizon days, and annualized volatility below.</p>
      </section>
      <article className="prose max-w-none space-y-6">
        <h2>Mathematical Derivation of Parametric and Cornish-Fisher Tail Risk</h2>
        <p>
          Institutional risk management requires quantifying potential capital drawdowns across both
          normal market fluctuations and stressed liquidity dislocations. While classical Gaussian
          Value-at-Risk scales the portfolio standard deviation by the inverse cumulative normal
          distribution z-score, empirical asset returns exhibit pronounced negative skewness and
          excess kurtosis. Relying exclusively on a two-parameter normal distribution understates
          ninety-nine percent tail losses during sovereign yield spikes or credit spread widening.
        </p>
        <p>
          To correct for non-normality without incurring the full computational latency of ten-thousand-path
          Cholesky Monte Carlo simulations, the Cornish-Fisher expansion adjusts the critical quantile
          using third-order skewness S and fourth-order excess kurtosis K. This fourth-moment expansion
          captures asymmetric downside tail behavior directly inside deterministic risk engines.
        </p>
        <figure className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 640 160" role="img" aria-label="Cornish-Fisher Tail Expansion Diagram">
            <rect x="20" y="30" width="180" height="90" rx="8" fill="#09090b" stroke="#10b981" />
            <text x="38" y="80" fill="#ecfdf5" fontSize="12">Moments (Mean, Vol, Skew, Kurt)</text>
            <rect x="240" y="30" width="180" height="90" rx="8" fill="#09090b" stroke="#38bdf8" />
            <text x="258" y="80" fill="#e0f2fe" fontSize="12">Cornish-Fisher Quantile z_CF</text>
            <rect x="460" y="30" width="160" height="90" rx="8" fill="#09090b" stroke="#f59e0b" />
            <text x="478" y="80" fill="#fef3c7" fontSize="12">Expected Shortfall CVaR</text>
          </svg>
          <figcaption>Figure 1: Fourth-moment Cornish-Fisher quantile adjustment pipeline.</figcaption>
        </figure>
        <h2>Deterministic Sensitivity Matrix ($1,000,000 Portfolio, 10-Day Horizon)</h2>
        <table>
          <thead>
            <tr>
              <th>Annualized Volatility</th>
              <th>Gaussian 99% VaR</th>
              <th>Cornish-Fisher 99% VaR (Skew -0.8, Kurt 4.5)</th>
              <th>Expected Shortfall (99% CVaR)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>10.0%</td><td>$46,420</td><td>$58,910</td><td>$67,340</td></tr>
            <tr><td>18.0%</td><td>$83,556</td><td>$106,038</td><td>$121,212</td></tr>
            <tr><td>30.0%</td><td>$139,260</td><td>$176,730</td><td>$202,020</td></tr>
          </tbody>
        </table>
      </article>
      <aside aria-label="Advertisement" className="my-10 p-4 min-h-[280px] border rounded-lg">
        <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Sponsored Advertisement</div>
        <ins className="adsbygoogle" style={{ display: 'block', minHeight: '250px' }} data-ad-client="ca-pub-4829103948571029" data-ad-slot="9876543210" />
      </aside>
      <section className="mt-10">
        <h2>Related Quantitative Architecture Guides</h2>
        <ul>
          <li><a href="/guides/monte-carlo-var-methodology">Parametric vs. Historical Monte Carlo Value-at-Risk</a></li>
          <li><a href="/guides/sharpe-sortino-tail-risk">Downside Semivariance & Sortino Ratio Optimization</a></li>
          <li><a href="/guides/kelly-criterion-fractional-sizing">Fractional Kelly Criterion & Ruin Probability Bounds</a></li>
        </ul>
      </section>
    </main>
  );
}`,
      },
      {
        path: 'app/guides/monte-carlo-var-methodology/page.tsx',
        content: COMPLIANT_PILLAR_1,
      },
      {
        path: 'app/guides/sharpe-sortino-tail-risk/page.tsx',
        content: COMPLIANT_PILLAR_2,
      },
      {
        path: 'app/guides/kelly-criterion-fractional-sizing/page.tsx',
        content: COMPLIANT_PILLAR_3,
      },
    ],
  },
];
