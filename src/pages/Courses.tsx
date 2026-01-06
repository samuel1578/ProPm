import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Award, Users, MessageSquare, CheckCircle, ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useState, useEffect } from 'react';
import coursesHero from '../assets/courses.jpg';
import { useAuth } from '../context/AuthContext';
import { createEnrollment, getUserEnrollments, findUserEnrollmentByCourse, verifyAccount } from '../lib/appwrite';
import CurrencyConverter from '../components/CurrencyConverter';
import { plans } from '../lib/plans';
import { useToast } from '../components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../lib/appwrite';

interface Certification {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  features: string[];
  eligibility: string[];
  comingSoon?: boolean;
}

const certifications: Certification[] = [
  {
    id: 'pmp',
    title: 'Project Management Professional (PMP)®',
    description: 'The PMP certification proves you have the project leadership and expertise in any way of working: predictive, hybrid or agile. It demonstrates your ability to lead projects without being tied to any specific industry or geographic location.',
    duration: '3-6 months',
    level: 'Advanced',
    features: [
      'Globally recognized certification',
      '17% higher median salaries',
      '1.6M+ holders worldwide',
      'Demonstrates ability to lead projects in any industry',
      'Career advancement and authority in project management',
    ],
    eligibility: [
      'Senior High School certificate + 5 years project experience + 35 hours training',
      'Bachelor\'s degree + 3 years project experience + 35 hours training',
      'Bachelor\'s from accredited university + 2 years project experience + 35 hours training',
    ],
  },
  {
    id: 'capm',
    title: 'Certified Associate in Project Management (CAPM)®',
    description: 'Show the world that you possess the foundational knowledge and skills that project teams demand. The CAPM proves you\'re ready to take on a wide range of projects—with ways of working that include predictive project management, agile principles and business analysis.',
    duration: '1-3 months',
    level: 'Beginner',
    features: [
      'Ranked #1 in-demand professional certification',
      'Average salary $70,000 in the US',
      '1.7M+ PMI certification holders',
      'Foundation for advanced certifications like PMP',
      'Entry-level project management roles',
    ],
    eligibility: [
      'Senior High School certificate + 23 hours project management education',
    ],
  },
  {
    id: 'pmi-acp',
    title: 'PMI Agile Certified Practitioner (PMI-ACP)®',
    description: 'The PMI-ACP certification highlights your agile expertise with the industry\'s only agnostic, experienced-based, ISO-accredited exam. It validates your ability to drive excellence across methodologies, including Scrum, Lean, Kanban, and more—with a truly agile and a team-centric approach.',
    duration: '2-4 months',
    level: 'Intermediate',
    comingSoon: true,
    features: [
      '86% of holders qualified for new opportunities',
      '84% gained recognition for career advancement',
      'Developed by agile leaders',
      'Benefits roles like product owner, scrum master, agile coach',
      'Tools and skills for collaborating in any agile environment',
    ],
    eligibility: [
      'Senior High School certificate + 2 years agile experience + 28 hours agile training',
      'Bachelor\'s degree + 1 year agile experience + 28 hours agile training',
      'Third-party certification (e.g., CSM) + 1 year agile experience + 28 hours agile training',
      'PMP certification + 1 year agile experience + 28 hours agile training',
    ],
  },
  {
    id: 'pfmp',
    title: 'Portfolio Management Professional (PfMP)®',
    description: 'Conduct a symphony of project portfolios. The PfMP certification proves you have the advanced skills to manage and align multiple projects, programs and operations with your organization\'s strategic goals. As a PfMP holder, you\'ll balance demands, oversee portfolio success, and allocate resources where they matter most.',
    duration: '4-6 months',
    level: 'Advanced',
    comingSoon: true,
    features: [
      '35% more successful programs in mature organizations',
      '1.5M+ PMI certification holders',
      'For executives and senior-level practitioners',
      'Ensures organization does the right work',
      'Strategic alignment and resource allocation',
    ],
    eligibility: [
      'Senior High School certificate + 8 years business experience + 7 years portfolio experience',
      'Bachelor\'s degree + 8 years business experience + 4 years portfolio experience',
      'Bachelor\'s from accredited university + 8 years business experience + 3 years portfolio experience',
    ],
  },
];

export default function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  // Detect whether enrollment backend is configured (dev help)
  const enrollmentsConfigured = typeof import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID === 'string' && (import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID as string).trim() !== '';


  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string>(plans[0].name);
  const [currentCurrency, setCurrentCurrency] = useState('GHS');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [lastEnrollmentError, setLastEnrollmentError] = useState<string | null>(null);
  const [lastEnrollmentRawError, setLastEnrollmentRawError] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState<any>(null);
  const [verifyResponse, setVerifyResponse] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setUserEnrollments([]);
      return;
    }

    if (!enrollmentsConfigured) {
      console.warn('Enrollments collection not configured. Set VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID in .env');
      // skip attempting to load enrollments
      setLoadingEnrollments(false);
      setLastEnrollmentError('Enrollment backend not configured.');
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingEnrollments(true);
      try {
        const docs = await getUserEnrollments(user.$id);
        if (!mounted) return;
        setUserEnrollments(docs || []);
      } catch (err) {
        console.error('Failed to load enrollments', err);
      } finally {
        if (mounted) setLoadingEnrollments(false);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  // Scroll behavior when navigating to /courses: if a hash is present, scroll to that target; otherwise
  // scroll the hero into view with an offset to account for the fixed header so the hero isn't hidden.
  useEffect(() => {
    const headerHeight = document.querySelector('header')?.clientHeight || 0;

    if (location && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      }
      return;
    }

    // No hash: if we're on /courses, scroll the hero into view with offset
    if (location && location.pathname === '/courses') {
      const hero = document.getElementById('courses-hero');
      if (hero) {
        const top = hero.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        // fallback to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location]);

  async function fetchEnrollments() {
    if (!user) return;
    setLoadingEnrollments(true);
    try {
      const docs = await getUserEnrollments(user.$id);
      setUserEnrollments(docs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnrollments(false);
    }
  }

  async function handleEnrollClick(cert: Certification) {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (!enrollmentsConfigured) {
      toast.show('Enrollment backend not configured. Set VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID in .env', 'error');
      return;
    }

    setProcessing(true);
    setLastEnrollmentError(null);
    setLastEnrollmentRawError(null);

    // Quick session validation via Appwrite account.get()
    try {
      if (account) {
        const s = await account.get();
        setSessionCheck(s);
        if (!s || !s?.$id || s.$id !== user.$id) {
          toast.show('Session invalid or expired. Please log in again.', 'error');
          setProcessing(false);
          return;
        }
      }
    } catch (sessErr) {
      console.warn('Session check failed', sessErr);
      toast.show('Session invalid or expired. Please log in again.', 'error');
      setProcessing(false);
      return;
    }

    try {
      console.debug('handleEnrollClick', { userId: user?.$id, courseId: cert.id });
      const existing = await findUserEnrollmentByCourse(user.$id, cert.id);
      if (existing) {
        toast.show('You are already enrolled in this certification.', 'info');
        await fetchEnrollments();
        return;
      }

      setSelectedCert(cert);
      setModalOpen(true);
    } catch (err: any) {
      console.error('Enrollment check failed', err);
      const msg = err?.message || 'Error checking enrollment.';
      setLastEnrollmentError(msg);
      setLastEnrollmentRawError(err);
      toast.show(msg, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function confirmEnroll() {
    if (!user || !selectedCert) return;
    setProcessing(true);
    try {
      const plan = plans.find((p) => p.name === selectedPlanName) || plans[0];
      console.debug('confirmEnroll payload', { userId: user.$id, courseId: selectedCert.id, planName: plan.name, planBasePrice: plan.basePrice, currency: currentCurrency });
      const created = await createEnrollment({
        userId: user.$id,
        courseId: selectedCert.id,
        planName: plan.name,
        planBasePrice: plan.basePrice,
        currency: currentCurrency,
        certifications: [selectedCert.title],
      });
      setModalOpen(false);
      setSelectedCert(null);
      toast.show('Enrollment created. View it in your profile.', 'success');
      await fetchEnrollments();
      // navigate to profile and anchor to created enrollment for quick access
      try { if (created && created.$id) navigate(`/userprofile#${created.$id}`); } catch (e) { /* non-critical */ }
    } catch (err: any) {
      const msg = err?.message || 'Failed to enroll.';
      console.error('confirmEnroll error', err);
      setLastEnrollmentError(msg);
      toast.show(msg, 'error');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white dark:bg-[#071330]">
      <section id="courses-hero" className="pt-16 sm:pt-20 pb-0 sm:pb-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-[#0d2244] dark:via-[#071330] dark:to-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Master PMI Certifications
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Structured plans and expert instruction to prepare you for PMI exams — taught by a PMP‑certified instructor. Our focus is helping you master the course material so you can confidently sit the PMI exam.
          </p>

          <div className="mx-auto mt-6 w-full max-w-3xl">
            <img
              src={coursesHero}
              alt="Courses hero"
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ maxHeight: 360 }}
            />
          </div>

          <div className="mt-4 max-w-3xl mx-auto text-left bg-white/60 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Important facts</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>These are PMI‑aligned courses and preparation plans for PMI exams (PMP, CAPM, PMI‑ACP, PfMP).</li>
              <li>The instructor delivering these plans is a PMP‑certified professional with real-world experience.</li>
              <li>We provide study plans, practice exams, video tutorials and mentorship to help you prepare — we do not sell the PMI exam or issue PMI certifications.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* features grid removed from top and relocated below the courses swiper */}

      <section id="certifications" className="pt-0 sm:pt-0 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-[0.5cm] mb-4 text-center">
            <div className="mt-0 flex items-center justify-center">
              <CurrencyConverter onCurrencyChange={(c, r) => { setCurrentCurrency(c); setExchangeRate(r); }} />
            </div>

            {/* Dev diagnostics banner */}
            {import.meta.env.DEV && (
              <div className="mt-3 text-xs text-left text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/10 rounded p-2">
                <div className="font-medium">Dev Diagnostics</div>
                <div>DB: <code className="text-xs">{import.meta.env.VITE_APPWRITE_DATABASE_ID}</code></div>
                <div>Enroll Collection: <code className="text-xs">{(import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID as string) || '<missing>'}</code></div>
                {lastEnrollmentError && <div className="mt-1 text-red-600">Last error: {lastEnrollmentError}</div>}
                {lastEnrollmentRawError && (
                  <pre className="mt-2 text-xs overflow-auto max-h-24 bg-white/50 dark:bg-white/5 p-2 rounded">{JSON.stringify(lastEnrollmentRawError, null, 2)}</pre>
                )}
                <div className="mt-2 flex gap-2">
                  <button onClick={fetchEnrollments} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Refresh Enrollments</button>
                  <button
                    onClick={async () => {
                      try {
                        const s = await account.get();
                        setSessionCheck(s);
                        toast.show('Session fetched', 'success');
                      } catch (e: any) {
                        setSessionCheck(null);
                        toast.show(e?.message || 'Failed to get session', 'error');
                      }
                    }}
                    className="px-3 py-1 bg-gray-700 text-white rounded text-xs"
                  >
                    Check Session
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const v = await verifyAccount();
                        setVerifyResponse(v);
                        toast.show('verifyAccount returned', 'success');
                      } catch (e: any) {
                        setVerifyResponse(e?.message ? { ok: false, status: 'error', body: e.message } : null);
                        toast.show(e?.message || 'verifyAccount failed', 'error');
                      }
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-xs"
                  >
                    Verify Account (debug)
                  </button>
                </div>
                {sessionCheck && (
                  <div className="mt-2 text-xs">Session user: <code>{sessionCheck.$id}</code></div>
                )}
                {verifyResponse && (
                  <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white/50 dark:bg-white/5 p-2 rounded">{JSON.stringify(verifyResponse, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
          <Swiper
            modules={[Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
            onSwiper={(s) => setSwiperInstance(s)}
            className="pb-8"
          >
            {certifications.map((certification) => (
              <SwiperSlide key={certification.id}>
                <div className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-shadow duration-300 h-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-semibold rounded-full">
                          {certification.level}
                        </span>
                        {certification.comingSoon && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {certification.duration}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {certification.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {certification.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What you'll learn:</h4>
                      <ul className="space-y-2">
                        {certification.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                          Eligibility Requirements
                          <ChevronDown className="h-4 w-4 ml-2 transition-transform group-open:rotate-180" />
                        </summary>
                        <ul className="space-y-2 mt-2">
                          {certification.eligibility.map((req, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                              <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>

                    <div className="space-y-2">
                      {certification.comingSoon ? (
                        <div className="px-4 py-3 rounded-lg border border-dashed border-amber-500/60 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200 text-sm text-center font-medium">
                          We are finalizing this training track. Check back soon for enrollment details.
                        </div>
                      ) : (
                        <>
                          {user ? (
                            <button
                              onClick={() => handleEnrollClick(certification)}
                              disabled={processing || !enrollmentsConfigured}
                              className="block w-full px-4 py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                              {processing ? 'Processing...' : enrollmentsConfigured ? 'Enroll Now' : 'Enrollment Unavailable'}
                            </button>
                          ) : (
                            <Link
                              to="/signup"
                              className="block w-full px-4 py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Create Account to Enroll
                            </Link>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button className="w-full px-4 py-2 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                              Learn More
                            </button>
                            <Link to="/pricing#plans" className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-[#071330] rounded-lg text-center">View Pricing</Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex gap-3 justify-center mt-[0.5cm]">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              disabled={!swiperInstance}
              className="px-4 py-2 bg-white dark:bg-transparent text-blue-600 dark:text-blue-300 font-semibold rounded-lg uppercase border border-blue-600 dark:border-blue-400 disabled:opacity-50"
            >
              PREVIOUS
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              disabled={!swiperInstance}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg uppercase disabled:opacity-50"
            >
              NEXT
            </button>
          </div>
        </div>
      </section>

      <section className="pt-0 sm:pt-0 pb-12 sm:pb-16 bg-white dark:bg-[#050b1a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp Community</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Join dedicated certification groups</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <Users className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Live Sessions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Interactive virtual training</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <Award className="h-10 w-10 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">PMI Certificate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Globally recognized certification</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <CheckCircle className="h-10 w-10 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Exam Preparation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive study materials</p>
            </div>
          </div>
        </div>
      </section>



      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ y: 8, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-[#071330] rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Enrollment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enroll in <strong>{selectedCert.title}</strong>. This will save the selection to your account.</p>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Choose a plan</label>
                <select value={selectedPlanName} onChange={(e) => setSelectedPlanName(e.target.value)} className="w-full rounded border px-3 py-2 bg-white dark:bg-[#0b1b36]">
                  {plans.map((p) => (
                    <option key={p.name} value={p.name}>{p.name} — ₵{p.basePrice.toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div>Selected currency: <strong>{currentCurrency}</strong></div>
                <div className="mt-2">Selected price: <strong>{currentCurrency === 'GHS' ? '₵' : ''}{Math.round((plans.find(p => p.name === selectedPlanName)?.basePrice || 0) * exchangeRate).toLocaleString()}</strong></div>
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={() => { setModalOpen(false); setSelectedCert(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={confirmEnroll} disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {processing ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Not Sure Which Certification to Choose?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Our team is here to help you find the perfect PMI certification for your goals and experience level
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Certification Advice
            </Link>
            <Link
              to="/pricing#plans"
              className="px-8 py-4 bg-white dark:bg-transparent text-blue-600 dark:text-blue-300 font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
