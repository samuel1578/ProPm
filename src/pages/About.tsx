import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Target, Lightbulb, Heart, TrendingUp, Users, Award } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import aboutHero from '../assets/about-hero.jpeg';
import banner from '../assets/bannner.png';

const headingVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const cardVariant = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function About() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const headingMotionProps = shouldReduceMotion
    ? {}
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.6 } };

  const cardMotionProps = shouldReduceMotion
    ? {}
    : { initial: 'hidden', whileInView: 'show', viewport: { once: false, amount: 0.2 } };

  return (
    <div className="bg-white dark:bg-[#071330] transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-white dark:from-[#0d1f46] dark:to-[#050b1f] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={headingVariant}
            {...headingMotionProps}
          >
            About ProPM
          </motion.h1>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 inline-block px-3 py-1 border-2 border-dashed rounded-md border-gray-300 dark:border-white/30">
              ProPM — Professional Project Management
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Guiding individuals to achieve PMI certifications through comprehensive, self-paced preparation
            </p>
          </div>
          <motion.img
            src={aboutHero}
            alt="About ProPM"
            className="mx-auto mt-8 w-full max-w-3xl rounded-lg shadow-lg object-cover"
            variants={headingVariant}
            {...headingMotionProps}
          />
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                variants={headingVariant}
                {...headingMotionProps}
              >
                The Problem We're Solving
              </motion.h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                PMI certifications are highly valued but preparing for them can be overwhelming and expensive. Many aspirants struggle with finding reliable study materials, practice exams, and guidance.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Without proper preparation, candidates often fail exams or spend months/years studying inefficiently.
              </p>
              <div className="w-full flex justify-center my-6">
                <img src={banner} alt="Problem banner" className="w-full max-w-3xl rounded-md shadow-sm object-cover" />
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                This creates barriers to career advancement and limits opportunities for professionals worldwide.
              </p>
            </div>
            <motion.div
              className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-[#35100e] dark:to-[#432112] rounded-lg p-8 transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">High cost of PMI certification preparation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Lack of comprehensive, up-to-date study materials</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Difficulty finding reliable practice exams</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">No structured guidance for exam preparation</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0f1e45] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-[#11254f] dark:to-[#0f382e] rounded-lg p-8 order-2 lg:order-1 transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Comprehensive study guides for all PMI certifications</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Realistic practice exams and question banks</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Video tutorials and interactive learning modules</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Community forums and study groups for support</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Lifetime access with regular content updates</p>
                </div>
              </div>
            </motion.div>
            <div className="order-1 lg:order-2">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                variants={headingVariant}
                {...headingMotionProps}
              >
                Our Solution: Comprehensive PMI Prep
              </motion.h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                ProPM provides everything you need to prepare for PMI certifications in one place. From detailed study guides to practice exams and video tutorials.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Our self-paced platform is designed to help you pass exams like PMP, CAPM, PMI-ACP, and PfMP with confidence.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Pay once and get lifetime access to all materials, plus community support to keep you motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-[#0b1535] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              variants={headingVariant}
              {...headingMotionProps}
            >
              Our Mission & Vision
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-blue-50 dark:bg-[#11254f] rounded-lg p-8 text-center transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4 mx-auto">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  To make PMI certification preparation accessible and effective for everyone, providing high-quality, affordable resources that help individuals pass their exams and advance their careers in project management.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="bg-green-50 dark:bg-[#0f382e] rounded-lg p-8 text-center transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4 mx-auto">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  To become the go-to platform for PMI certification preparation worldwide, empowering professionals to achieve their certification goals and build successful careers in project management.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0f1e45] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              variants={headingVariant}
              {...headingMotionProps}
            >
              Our Core Values
            </motion.h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These principles guide everything we do at ProPM
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Swiper
              slidesPerView={1}
              spaceBetween={16}
              pagination={{ clickable: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              modules={[Pagination]}
              className="py-8"
            >
              <SwiperSlide>
                <motion.div
                  className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
                  variants={cardVariant}
                  {...cardMotionProps}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Making PMI certification preparation affordable and accessible to professionals worldwide
                  </p>
                </motion.div>
              </SwiperSlide>

              <SwiperSlide>
                <motion.div
                  className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
                  variants={cardVariant}
                  {...cardMotionProps}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Comprehensive Resources</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Providing everything you need in one place for effective PMI exam preparation
                  </p>
                </motion.div>
              </SwiperSlide>

              <SwiperSlide>
                <motion.div
                  className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
                  variants={cardVariant}
                  {...cardMotionProps}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 mx-auto">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Certification Success</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Focused on helping you pass PMI exams and achieve your certification goals
                  </p>
                </motion.div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-blue-600 text-white dark:bg-[#0b2d68] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            variants={headingVariant}
            {...headingMotionProps}
          >
            Start Your PMI Certification Journey
          </motion.h2>
          <p className="text-lg text-blue-100 mb-8">
            Join our community of successful PMI certification holders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg dark:bg-transparent dark:text-white dark:border dark:border-white/40 dark:hover:bg-white/10"
            >
              View Certifications
            </Link>
            <Link
              to="/contact#contact-top"
              className="px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg border-2 border-white hover:bg-blue-800 transition-colors dark:bg-transparent dark:border-white/60 dark:hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
