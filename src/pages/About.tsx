import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Target, Lightbulb, Heart, TrendingUp, Users, Award } from 'lucide-react';

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
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Empowering the next generation of project managers through practical, hands-on learning
          </p>
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
                Many project management courses focus heavily on theory, leaving students and young professionals without the practical skills needed in the real world.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Graduates often struggle to apply what they've learned because they've never actually managed a project from start to finish.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                This gap between academic knowledge and practical application creates barriers to career advancement and limits the effectiveness of teams and organizations.
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
                  <p className="text-gray-700 dark:text-gray-200">Too much theory, not enough practice</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">No real project experience</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Limited access to mentorship</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Difficulty applying classroom knowledge</p>
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
                  <p className="text-gray-700 dark:text-gray-200">Hands-on project simulations</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Real-world scenarios and case studies</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Live sessions with experienced instructors</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Community learning and peer support</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700 dark:text-gray-200">Professional certification upon completion</p>
                </div>
              </div>
            </motion.div>
            <div className="order-1 lg:order-2">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                variants={headingVariant}
                {...headingMotionProps}
              >
                Our Solution: Hands-On Learning
              </motion.h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                ProPM bridges this gap through a practical, project-based learning approach. We don't just teach you project management theory – we help you apply it.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Our courses combine the best of online learning with community support, live instruction, and real project experience.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                By the time you complete a ProPM course, you'll have managed actual projects and developed the skills employers are looking for.
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
              className="bg-blue-50 dark:bg-[#11254f] rounded-lg p-8 transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                To equip students and young professionals with practical project management skills through hands-on training, enabling them to successfully plan, execute, and deliver projects in any setting.
              </p>
            </motion.div>
            <motion.div
              className="bg-green-50 dark:bg-[#0f382e] rounded-lg p-8 transition-colors"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                To become the leading platform for practical project management education, creating a new generation of skilled project managers who drive success in organizations worldwide.
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We strive for the highest quality in our courses, support, and outcomes
              </p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Student-First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your success is our success. We're committed to your learning journey
              </p>
            </motion.div>
            <motion.div
              className="bg-white dark:bg-[#111c3e] rounded-lg p-6 shadow-md text-center border border-transparent dark:border-white/10"
              variants={cardVariant}
              {...cardMotionProps}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Learning together makes us stronger. We foster collaboration and support
              </p>
            </motion.div>
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
            Join Our Learning Community
          </motion.h2>
          <p className="text-lg text-blue-100 mb-8">
            Start your journey to becoming a skilled project manager today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg dark:bg-transparent dark:text-white dark:border dark:border-white/40 dark:hover:bg-white/10"
            >
              View Courses
            </Link>
            <Link
              to="/contact"
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
