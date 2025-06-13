import { motion } from 'framer-motion';
import { Users, BookOpen } from 'lucide-react';

export const Footer = () => {
  const teamMembers = [
    { name: 'Akinleye Emmanuel', id: '1804002032' },
    { name: 'Saludeen Zainab', id: '2005002144' },
    { name: 'Solomon Oladimeji', id: '2005002146' },
    { name: 'Sorinola-Adebowale Wisdom', id: '2005002147' },
    { name: 'Udeh Precious', id: '2005002150' },
    { name: 'Peter Dayo', id: '2005002143' },
    { name: 'Shoroye Jaabir', id: '2005002145' },
    { name: 'Taiwo Oladipupo', id: '2005002149' },
    { name: 'Omotehinse Clinton Olaife', id: '210502041' },
    { name: 'Subuloye Adebowale', id: '2005002148' }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mt-8"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">CPE 525 - GROUP 11</h3>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm">Team Members</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:bg-gray-650 transition-colors"
            >
              <div className="text-white font-medium text-sm mb-1">
                {member.name}
              </div>
              <div className="text-gray-400 text-xs font-mono">
                {member.id}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs">
            © 2025 CPE 525 Group 11. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};