import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Single Course',
    price: '₦25,000',
    period: 'per course',
    description: 'Perfect for those starting their PM journey',
    features: [
      'Access to one course',
      'WhatsApp community access',
      'Live virtual sessions',
      'Course materials & resources',
      'Certificate of completion',
      '6-week support access',
      'Practical project assignments',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Professional Bundle',
    price: '₦60,000',
    period: '3 courses',
    description: 'Best value for serious learners',
    features: [
      'Access to any 3 courses',
      'Priority WhatsApp support',
      'All live virtual sessions',
      'Downloadable resources',
      'Certificates for all courses',
      '6-month support access',
      'Real project experience',
      'Career guidance session',
      'LinkedIn profile review',
    ],
    popular: true,
    cta: 'Get Started',
  },
  {
    name: 'Complete Access',
    price: '₦95,000',
    period: 'all courses',
    description: 'Unlimited learning for ambitious professionals',
    features: [
      'Access to all 6+ courses',
      'Premium priority support',
      'Exclusive masterclass sessions',
      'All course materials',
      'Certificates for all courses',
      '12-month support access',
      'Multiple project simulations',
      'One-on-one mentorship',
      'Job placement assistance',
      'Lifetime community access',
    ],
    cta: 'Get Started',
  },
];

export default function Pricing() {
  return (
    <div className="bg-white dark:bg-[#071330] transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-white dark:from-[#0d1f46] dark:to-[#050b1f] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that best fits your learning goals. All plans include certificates and community access.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-[#111c3e] rounded-lg overflow-hidden transition-all duration-300 ${plan.popular
                    ? 'border-2 border-blue-600 dark:border-blue-400/80 shadow-2xl scale-105 md:scale-110'
                    : 'border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">/ {plan.period}</span>
                  </div>

                  <Link
                    to="/signup"
                    className={`block w-full px-6 py-3 text-center font-semibold rounded-lg transition-colors mb-6 ${plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 dark:bg-white/10 text-white hover:bg-gray-800 dark:hover:bg-white/20'
                      }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      What's included:
                    </p>
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start text-sm text-gray-600 dark:text-gray-300"
                      >
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0f1e45] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept bank transfers, card payments, and mobile money. Payment details will be provided upon enrollment.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I switch between plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade to a higher plan at any time. Just pay the difference and get immediate access.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer group discounts?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! We offer special pricing for teams of 5 or more. Contact us for a custom quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-blue-600 text-white dark:bg-[#0b2d68] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Our team is here to help you choose the right plan for your needs
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors dark:bg-transparent dark:text-white dark:border dark:border-white/40 dark:hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
