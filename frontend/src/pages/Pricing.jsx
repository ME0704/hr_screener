import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-gray-700",
    badge: "",
    features: [
      "1 active job post",
      "10 CV screenings/month",
      "Basic AI scoring",
      "Candidate ranking",
    ],
    missing: [
      "Bulk CV upload",
      "Export to PDF/Excel",
      "Priority support",
    ],
    buttonText: "Get Started Free",
    buttonStyle: "border border-gray-600 text-gray-300 hover:bg-gray-800",
    plan: "free"
  },
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    color: "border-purple-600",
    badge: "Most Popular",
    features: [
      "5 active job posts",
      "100 CV screenings/month",
      "Full AI scoring breakdown",
      "Bulk CV upload",
      "Export results",
      "Candidate ranking",
    ],
    missing: [
      "Priority support",
    ],
    buttonText: "Upgrade to Starter",
    buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    plan: "starter"
  },
  {
    name: "Business",
    price: "$79",
    period: "per month",
    color: "border-yellow-600",
    badge: "Best Value",
    features: [
      "Unlimited job posts",
      "Unlimited CV screenings",
      "Full AI scoring breakdown",
      "Bulk CV upload",
      "Export results",
      "Priority support",
      "Early access to new features",
    ],
    missing: [],
    buttonText: "Upgrade to Business",
    buttonStyle: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold",
    plan: "business"
  }
]

export default function Pricing() {
  const navigate = useNavigate()
  const token = localStorage.getItem('company_token')

  const handleSelect = (plan) => {
    if (!token) {
      navigate('/company/register')
      return
    }
    navigate(`/company/checkout?plan=${plan}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          {token && (
            <button
              onClick={() => navigate('/company/dashboard')}
              className="text-gray-500 hover:text-white text-sm mb-6 block mx-auto"
            >
              ← Back to Dashboard
            </button>
          )}
          <div className="text-3xl mb-3">💼</div>
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 text-lg">
            Stop spending days reading CVs. Let AI do it in seconds.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`border-2 ${plan.color} rounded-2xl p-6 flex flex-col relative`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mb-6 flex-grow">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">✗</span>
                    <span className="text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect(plan.plan)}
                className={`w-full py-3 rounded-xl font-medium transition ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 text-center">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "What counts as a CV screening?",
                a: "Every CV your AI analyses counts as one screening, whether uploaded individually or in bulk."
              },
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes. Your new plan takes effect immediately and limits are adjusted right away."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept Mobile Money (MTN, Airtel), Visa, and Mastercard via Flutterwave."
              },
              {
                q: "Do unused screenings roll over?",
                a: "No. CV screenings reset at the start of each billing month."
              },
            ].map(item => (
              <div key={item.q}>
                <p className="font-medium text-white mb-1">{item.q}</p>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}