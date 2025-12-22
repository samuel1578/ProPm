import { Link } from 'react-router-dom';
import { Users, Target, Award, MessageSquare, CheckCircle, BookOpen, Clock, Globe } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import logo from '../assets/logo-light.png';
import communityImg from '../assets/community.jpg';
import certImg from '../assets/cert.jpg';
import gyeNyame from '../assets/gye-nyame.png';
import sankofa from '../assets/sankofa.png';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-white dark:bg-[#071330] transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <motion.section initial={shouldReduceMotion ? undefined : "hidden"} animate={shouldReduceMotion ? undefined : "show"} whileInView={shouldReduceMotion ? undefined : "show"} viewport={{ once: false, amount: 0.15 }} variants={container} className="relative bg-gradient-to-br from-blue-50 to-white dark:from-[#0d1f46] dark:to-[#050b1f] pt-16 sm:pt-20 md:pt-28 pb-12 sm:pb-20 md:pb-28 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Left-side background image on desktop */}
          <div
            className="hidden md:block absolute inset-y-0 left-0 w-1/2 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/9480280/pexels-photo-9480280.jpeg')",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="hidden md:block" />

            <div className="text-center md:text-left max-w-4xl mx-auto md:mx-0 md:pl-12">
              <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Learn Project Management by Doing Real Projects
              </motion.h1>

              {/* Mobile-only image banner placed under title */}
              <motion.div variants={item} className="md:hidden w-full my-4">
                <img
                  src="https://images.pexels.com/photos/9480280/pexels-photo-9480280.jpeg"
                  alt="ProPM hero"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </motion.div>
              <motion.p variants={item} className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                ProPM is a practical project management training platform designed for students and young professionals who want to master PM skills through hands-on experience.
              </motion.p>
              <motion.div variants={item} className="flex flex-row gap-4 justify-center md:justify-start flex-wrap items-center">
                <motion.div variants={item} className="inline-flex">
                  <Link
                    to="/courses"
                    className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    View Courses
                  </Link>
                </motion.div>
                <motion.div variants={item} className="inline-flex">
                  <a
                    href="#how-it-works"
                    className="px-8 py-4 bg-white dark:bg-transparent text-blue-600 dark:text-white font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/20 transition-colors"
                  >
                    How ProPM Works
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.12 }} variants={container} className="relative py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors duration-300">
        <div className="absolute left-4 top-4 flex items-center justify-center rounded-full p-1 dark:bg-white/10">
          <img src={sankofa} alt="Sankofa" className="h-16 w-16 object-contain drop-shadow-lg" />
        </div>
        <img
          src={gyeNyame}
          alt="Gye Nyame"
          className="absolute right-4 top-4 h-16 w-16 object-contain drop-shadow-lg md:top-4 md:right-4 md:block hidden"
        />
        <img
          src={gyeNyame}
          alt="Gye Nyame"
          className="absolute right-4 bottom-4 h-16 w-16 object-contain drop-shadow-lg md:hidden"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={item} className="text-center mb-20">
            {/* Enlarged centered panel with a bolder H2 for emphasis (no overlap) */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 sm:w-80 md:w-96 lg:w-[40rem] h-16 sm:h-18 md:h-20 rounded-3xl bg-white/95 border border-gray-200 shadow-md dark:bg-[#071a36] dark:border-[#0b2a4a] dark:shadow-black/30" />
                <h2 className="absolute inset-0 flex items-center justify-center z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white px-4">
                  What is ProPM?
                </h2>
              </div>
            </div>

            <p className="mt-12 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              ProPM is more than just another online course. We provide practical, hands-on project management training that bridges the gap between theory and real-world application. Our approach combines community learning, live sessions, and real project simulations.
            </p>
            <div className="relative mt-6 flex items-start justify-center gap-3 text-left max-w-2xl mx-auto">
              <Award className="h-10 w-10 flex-shrink-0 text-cyan-500 drop-shadow-[0_10px_25px_rgba(14,165,233,0.35)] dark:text-cyan-300" />
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200">
                Our instructors are 100% PMP certified, so every lesson reflects globally recognized standards and best practices.
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={item} className="text-center p-6">
              <div className="mx-auto w-full sm:w-auto max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="w-full h-40 rounded-xl overflow-hidden mb-2">
                  <img src="https://images.pexels.com/photos/8276637/pexels-photo-8276637.jpeg" alt="Practical Learning" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Practical Learning</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Learn by doing real projects, not just reading theory
                </p>
              </div>
            </motion.div>
            <motion.div variants={item} className="text-center p-6">
              <div className="mx-auto w-full sm:w-auto max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="w-full h-40 rounded-xl overflow-hidden mb-2">
                  <img src={communityImg} alt="Community Support" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Community Support</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Join a vibrant community of learners and mentors
                </p>
              </div>
            </motion.div>
            <motion.div variants={item} className="text-center p-6">
              <div className="mx-auto w-full sm:w-auto max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="w-full h-40 rounded-xl overflow-hidden mb-2">
                  <img src={certImg} alt="Certification" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Certification</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Earn recognized certificates upon course completion
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section initial={shouldReduceMotion ? undefined : "hidden"} whileInView={shouldReduceMotion ? undefined : "show"} viewport={{ once: false, amount: 0.12 }} variants={container} className="py-16 sm:py-20 bg-gray-50 dark:bg-[#09122d] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={item} className="text-center mb-12">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 sm:w-80 md:w-96 lg:w-[40rem] h-14 sm:h-16 md:h-18 rounded-3xl bg-white/95 border border-gray-200 shadow-sm dark:bg-[#071a36] dark:border-[#0b2a4a] dark:shadow-black/25 px-6" />
                <h2 className="absolute inset-0 flex items-center justify-center z-10 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white px-4 whitespace-nowrap">
                  Who ProPM is For
                </h2>
              </div>
            </div>

            <p className="mt-8 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our training is designed for anyone looking to build or enhance their project management skills
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={item} className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-transparent dark:border-white/10">
              <div className="mx-auto w-full sm:w-auto max-w-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-3">
                <Target className="h-10 w-10 text-blue-600 mb-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Students</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">Build practical skills to complement your academic knowledge</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-transparent dark:border-white/10">
              <div className="mx-auto w-full sm:w-auto max-w-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-3">
                <Users className="h-10 w-10 text-green-600 dark:text-green-300 mb-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Young Professionals</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">Advance your career with in-demand PM skills</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-transparent dark:border-white/10">
              <div className="mx-auto w-full sm:w-auto max-w-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-3">
                <MessageSquare className="h-10 w-10 text-orange-600 dark:text-orange-300 mb-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NGOs & Churches</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">Manage projects and programs more effectively</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-transparent dark:border-white/10">
              <div className="mx-auto w-full sm:w-auto max-w-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071a36] p-6 flex flex-col items-center gap-3">
                <Globe className="h-10 w-10 text-cyan-600 dark:text-cyan-300 mb-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Small Teams</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">Improve coordination and project delivery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section id="how-it-works" initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.12 }} variants={container} className="py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={item} className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full border border-slate-200/70 bg-white/80 px-10 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1a37]/75 dark:shadow-[0_25px_60px_rgba(3,9,30,0.45)]">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
                  How ProPM Works
                </h2>
              </div>
            </div>
            <div className="flex justify-center">
              <p className="inline-flex items-center justify-center rounded-full border border-dashed border-cyan-400/70 px-6 py-2 text-xl text-gray-600 backdrop-blur-sm dark:border-cyan-300/60 dark:text-gray-200">
                Get started with ProPM in four simple steps
              </p>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div variants={item} className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div variants={item} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Choose a Course</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse our catalog and select the course that matches your goals
                </p>
              </div>
            </motion.div>
            <motion.div variants={item} className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div variants={item} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Enroll & Pay</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete your enrollment with secure payment processing
                </p>
              </div>
            </motion.div>
            <motion.div variants={item} className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div variants={item} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join & Learn</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access the WhatsApp community and attend live virtual sessions
                </p>
              </div>
            </motion.div>
            <motion.div variants={item} className="relative">
              <div className="flex flex-col items-center text-center">
                <motion.div variants={item} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  4
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Certified</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete training and receive your professional certificate
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="py-16 sm:py-20 bg-blue-600 text-white dark:bg-[#0b2d68]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full border border-white/40 bg-white/15 px-8 sm:px-12 py-4 shadow-[0_25px_65px_rgba(15,23,42,0.3)] backdrop-blur-xl">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                  Why Choose ProPM?
                </h2>
              </div>
            </div>
            <div className="flex justify-center">
              <p className="inline-flex items-center justify-center rounded-full border border-dashed border-cyan-200/80 px-6 sm:px-8 py-2 text-xl text-blue-100/90">
                We're committed to providing the best learning experience
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Certificate Included</h3>
              <p className="text-blue-100 text-sm">
                Professional certification for every course
              </p>
            </div>
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Practical Learning</h3>
              <p className="text-blue-100 text-sm">
                Real projects, not just theory
              </p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Guided Sessions</h3>
              <p className="text-blue-100 text-sm">
                Live virtual training with expert instructors
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-blue-100 text-sm">
                Connect with peers and mentors
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#09122d] transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your PM Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join hundreds of students and professionals who are already learning with ProPM
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Explore Courses
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-white dark:bg-transparent text-blue-600 dark:text-white font-semibold rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/20 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
