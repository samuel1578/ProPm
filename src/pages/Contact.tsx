import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare, HelpCircle, Send } from 'lucide-react';
import contactImg from '../assets/contact.png';

function ScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    // if hash present, scroll to it; otherwise scroll to top
    if (location && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // small timeout to allow DOM to be ready
        setTimeout(() => el.scrollIntoView({ behavior: 'auto', block: 'start' }), 40);
        return;
      }
    }

    // no hash -> scroll to top of contact page
    if (location && location.pathname === '/contact') {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 40);
    }
  }, [location]);

  return null;
}

export default function Contact() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const faqs = [
    {
      question: 'How are the courses delivered?',
      answer: 'Our courses are delivered through a combination of WhatsApp community groups and live virtual sessions via Zoom or Google Meet. You\'ll receive course materials, participate in discussions, and attend scheduled live training sessions.',
    },
    {
      question: 'How do I access my certificate?',
      answer: 'Upon successful completion of your course, including all assignments and assessments, your certificate will be generated and sent to your registered email address. You can also download it from your student portal.',
    },
    {
      question: 'What is the duration of each course?',
      answer: 'Course durations vary from 4 to 10 weeks depending on the complexity and depth of content. Each course page clearly displays its duration. You\'ll have flexible scheduling with recorded sessions available for review.',
    },
    {
      question: 'What kind of support do I get during the course?',
      answer: 'You\'ll have access to instructor support through the WhatsApp community, live Q&A sessions during virtual meetings, email support, and peer-to-peer learning within your cohort. Professional and Complete Access plans include additional mentorship.',
    },
    {
      question: 'Do I need prior project management experience?',
      answer: 'No prior experience is required for beginner-level courses. We offer courses for all skill levels, from complete beginners to advanced practitioners. Each course clearly indicates its level and prerequisites.',
    },
    {
      question: 'Can I take courses at my own pace?',
      answer: 'While courses follow a structured timeline with live sessions and deadlines, we provide recordings of all live sessions and flexible submission windows for assignments to accommodate different schedules.',
    },
    {
      question: 'Are the certificates recognized?',
      answer: 'Yes, our certificates are professionally designed and include course details, completion date, and verification codes. Many of our graduates have successfully used them to enhance their CVs and LinkedIn profiles.',
    },
    {
      question: 'What if I miss a live session?',
      answer: 'All live sessions are recorded and made available to enrolled students. You can watch the recordings at your convenience and still participate in the course discussions and complete assignments.',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#071330]">
      <section id="contact-top" className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-white to-white dark:from-[#0d2244] dark:via-[#071330] dark:to-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Have questions? We're here to help. Reach out to us anytime.
          </p>
          <img src={contactImg} alt="Contact" className="mx-auto mt-6 w-full max-w-md rounded-lg shadow-lg object-cover" />
        </div>
      </section>

      {/* Scroll to hash (e.g. /contact#contact-top) or top on navigation */}
      <ScrollHandler />

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-[#0b1b36] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-[#0b1b36] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-[#0b1b36] text-gray-900 dark:text-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="course-inquiry">Course Inquiry</option>
                    <option value="enrollment">Enrollment Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-[#0b1b36] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                You can also reach us through any of these channels:
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1b36]">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">info@propm.com</p>
                    <p className="text-gray-600 dark:text-gray-300">support@propm.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1b36]">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+234 800 000 0000</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri, 9am-6pm WAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1b36]">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</h3>
                    <p className="text-gray-600 dark:text-gray-300">+234 800 000 0000</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quick response guaranteed</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1b36]">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Office</h3>
                    <p className="text-gray-600 dark:text-gray-300">Lagos, Nigeria</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Virtual consultations available</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/60 dark:via-[#071330] dark:to-green-950/40 rounded-lg p-6 border border-transparent dark:border-blue-900/40">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-300" />
                  Need Immediate Help?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Check out our FAQ section below for quick answers to common questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#050b1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Quick answers to common questions about ProPM
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-[#0b1b36] rounded-lg shadow-sm shadow-blue-500/5 p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
