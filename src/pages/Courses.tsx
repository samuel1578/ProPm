import { Link } from 'react-router-dom';
import { Clock, Award, Users, MessageSquare, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  features: string[];
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Project Management Fundamentals',
    description: 'Master the core principles of project management including planning, execution, monitoring, and closing projects effectively.',
    duration: '6 weeks',
    level: 'Beginner',
    features: [
      'Introduction to PM frameworks',
      'Project planning and scheduling',
      'Risk management basics',
      'Team coordination',
      'Real project simulation',
    ],
  },
  {
    id: '2',
    title: 'Agile Project Management',
    description: 'Learn modern Agile methodologies including Scrum and Kanban to manage projects in fast-paced, iterative environments.',
    duration: '8 weeks',
    level: 'Intermediate',
    features: [
      'Agile principles and values',
      'Scrum framework mastery',
      'Sprint planning and execution',
      'Daily standups and retrospectives',
      'Real Agile project practice',
    ],
  },
  {
    id: '3',
    title: 'Advanced Project Leadership',
    description: 'Develop advanced leadership skills to manage complex projects, lead diverse teams, and deliver strategic initiatives.',
    duration: '10 weeks',
    level: 'Advanced',
    features: [
      'Strategic project planning',
      'Stakeholder management',
      'Change management',
      'Advanced risk analysis',
      'Portfolio management',
    ],
  },
  {
    id: '4',
    title: 'Digital Project Management',
    description: 'Specialize in managing digital and tech projects using modern tools and methodologies specific to the digital landscape.',
    duration: '8 weeks',
    level: 'Intermediate',
    features: [
      'Digital project lifecycle',
      'Product roadmap planning',
      'Working with dev teams',
      'UX/UI project coordination',
      'Software delivery practices',
    ],
  },
  {
    id: '5',
    title: 'Project Management for NGOs',
    description: 'Learn project management tailored for non-profit organizations, focusing on social impact and resource optimization.',
    duration: '6 weeks',
    level: 'Beginner',
    features: [
      'NGO project frameworks',
      'Grant management',
      'Community engagement',
      'Impact measurement',
      'Volunteer coordination',
    ],
  },
  {
    id: '6',
    title: 'Project Management Tools & Software',
    description: 'Master the most popular project management tools including Monday.com, Asana, Trello, and Microsoft Project.',
    duration: '4 weeks',
    level: 'Beginner',
    features: [
      'Tool selection criteria',
      'Hands-on with top PM tools',
      'Workflow automation',
      'Team collaboration features',
      'Reporting and analytics',
    ],
  },
];

export default function Courses() {
  return (
    <div className="bg-white dark:bg-[#071330]">
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-white to-white dark:from-[#0d2244] dark:via-[#071330] dark:to-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Courses & Training Programs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose from our comprehensive range of project management courses designed for all skill levels
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white dark:bg-[#050b1a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp Community</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Join dedicated course groups</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <Users className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Live Sessions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Interactive virtual training</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <Award className="h-10 w-10 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Certificate Included</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Professional recognition</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#071330] rounded-xl border border-gray-200 dark:border-gray-800">
              <CheckCircle className="h-10 w-10 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Practical Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Real-world experience</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-xs font-semibold rounded-full">
                      {course.level}
                    </span>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What you'll learn:</h4>
                    <ul className="space-y-2">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/signup"
                      className="block w-full px-4 py-3 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enroll Now
                    </Link>
                    <button className="w-full px-4 py-2 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Not Sure Which Course to Choose?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Our team is here to help you find the perfect course for your goals and experience level
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Course Advice
            </Link>
            <Link
              to="/pricing"
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
