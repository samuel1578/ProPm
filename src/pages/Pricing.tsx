import { Link } from 'react-router-dom';
import { Check, Star, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import CurrencyConverter from '../components/CurrencyConverter';
import { useAuth } from '../context/AuthContext';
import { createEnrollment, getUserEnrollments, findUserEnrollmentByPlan } from '../lib/appwrite';
import { useToast } from '../components/ToastProvider';

interface PricingPlan {
  name: string;
  basePrice: number; // Price in GHS
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  certifications: string[];
}

import { plans } from '../lib/plans';

// previously in-file plans are now imported from shared definitions


export default function Pricing() {
  const [currentCurrency, setCurrentCurrency] = useState('GHS');
  const [exchangeRate, setExchangeRate] = useState(1);
  const { user, initializing } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const toast = useToast();

  const handleCurrencyChange = (currency: string, rate: number) => {
    setCurrentCurrency(currency);
    setExchangeRate(rate);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.$id) return;
      try {
        const docs = await getUserEnrollments(user.$id);
        if (!mounted) return;
        setEnrollments(docs || []);
      } catch (err) {
        console.warn('Failed to load enrollments', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const formatPrice = (basePrice: number) => {
    const converted = basePrice * exchangeRate;
    const currencyData = [
      { code: 'GHS', symbol: '₵' },
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
      { code: 'GBP', symbol: '£' },
      { code: 'CAD', symbol: 'C$' },
      { code: 'AUD', symbol: 'A$' },
    ].find(c => c.code === currentCurrency);

    return `${currencyData?.symbol || '₵'}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-white dark:bg-[#071330] transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-white dark:from-[#0d1f46] dark:to-[#050b1f] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            PMI Certification Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that best fits your certification goals. All plans include PMI exam preparation and community access.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CurrencyConverter onCurrencyChange={handleCurrencyChange} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* If user is authenticated and has enrollments, show their enrollment summary instead of plan CTAs */}
            {user && !initializing && enrollments.length > 0 ? (
              enrollments.map((enr) => (
                <div key={enr.$id || enr.id} className="relative bg-white dark:bg-[#111c3e] rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shadow-md p-8">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enrolled: {enr.planName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Status: {enr.status || enr.data?.status || 'pending'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Enrolled on: {new Date(enr.$createdAt || enr.createdAt || enr.data?.createdAt).toLocaleDateString()}</p>
                    <div className="mt-2 flex gap-2">
                      {(enr.certifications || enr.data?.certifications || []).map((c: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                  <Link to="/user-profile" className="block w-full px-6 py-3 text-center bg-blue-600 text-white rounded-lg">View My Course</Link>
                </div>
              ))
            ) : (
              plans.map((plan, index) => (
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
                    <div className="flex items-center mb-4">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {plan.certifications.map((cert, certIndex) => (
                          <span
                            key={certIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(plan.basePrice)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 ml-2">/ {plan.period}</span>
                    </div>

                    {/* Enroll behavior: guests see CTA to create account; authenticated users can enroll */}
                    {user ? (
                      <div>
                        <button
                          disabled={saving}
                          onClick={async () => {
                            setDuplicateError(null);
                            setActionMessage(null);
                            try {
                              // check duplicate
                              const existing = await findUserEnrollmentByPlan(user.$id, plan.name);
                              if (existing) {
                                setDuplicateError('You are already enrolled in this plan.');
                                setActionMessage(null);
                                return;
                              }

                              // show confirmation modal
                              setSelectedPlan(plan);
                              setShowConfirmModal(true);
                            } catch (err) {
                              console.error('Duplicate check failed', err);
                              setActionMessage('Unable to verify enrollment status. Try again.');
                            }
                          }}
                          className="block w-full px-6 py-3 text-center font-semibold rounded-lg transition-colors mb-4 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Enroll Now
                        </button>

                        {duplicateError && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{duplicateError}</p>
                        )}

                        {actionMessage && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">{actionMessage}</p>
                        )}

                        {/* Confirmation Modal */}
                        {showConfirmModal && selectedPlan && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="max-w-md w-full bg-white dark:bg-[#071330] rounded-lg shadow-lg p-6">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Enrollment</h3>
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">You are about to enroll in <strong>{selectedPlan.name}</strong> for <strong>{formatPrice(selectedPlan.basePrice)}</strong>.</p>
                              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Certifications: {selectedPlan.certifications.join(', ')}</p>

                              <div className="mt-6 flex gap-3">
                                <button
                                  onClick={async () => {
                                    setSaving(true);
                                    try {
                                      await createEnrollment({ userId: user.$id, planName: selectedPlan.name, planBasePrice: selectedPlan.basePrice, certifications: selectedPlan.certifications });
                                      const docs = await getUserEnrollments(user.$id);
                                      setEnrollments(docs || []);
                                      setShowConfirmModal(false);
                                      setSelectedPlan(null);
                                      toast.show('Enrollment saved. View it in your profile.', 'success');
                                    } catch (err: any) {
                                      console.error('Enroll failed', err);
                                      toast.show(err?.message || 'Enrollment failed. Please try again.', 'error');
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => { setShowConfirmModal(false); setSelectedPlan(null); }}
                                  className="px-4 py-2 border rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to="/signup"
                        className="block w-full px-6 py-3 text-center font-semibold rounded-lg transition-colors mb-4 bg-blue-600 text-white hover:bg-blue-700"
                        aria-disabled="true"
                      >
                        Create Account to Enroll
                      </Link>
                    )}

                    <button className="w-full px-6 py-3 text-center border border-blue-600 text-blue-600 dark:text-blue-300 bg-white dark:bg-transparent rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10">Learn More</button>

                    <div className="space-y-3 mt-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        What's included:
                      </p>
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start text-sm text-gray-600 dark:text-gray-300"
                        >
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                We accept bank transfers, card payments, mobile money, and international payments. Payment details will be provided upon enrollment.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I switch between plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade to a higher plan at any time. Just pay the difference and get immediate access to additional certifications.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you guarantee PMI certification?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We provide comprehensive exam preparation, but PMI certification requires passing their official exam. We offer retake support and additional resources.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, we offer a 14-day money-back guarantee for certification plans. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer installment payments?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! For plans above ₵5,000, we offer flexible installment options. Contact us to discuss payment plans.
              </p>
            </div>
            <div className="bg-white dark:bg-[#111c3e] p-6 rounded-lg shadow-sm border border-transparent dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What if I don't meet eligibility requirements?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our programs include preparation for building the required experience. We'll guide you on meeting PMI eligibility criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-blue-600 text-white dark:bg-[#0b2d68] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your PMI Journey?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of professionals who have advanced their careers with PMI certifications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors dark:bg-transparent dark:text-white dark:border dark:border-white/40 dark:hover:bg-white/10"
            >
              Speak to an Advisor
            </Link>
            <Link
              to="/courses"
              className="inline-block px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              View Certifications
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
