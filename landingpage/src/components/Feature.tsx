import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      className="card card-gradient p-5 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="w-12 h-12 rounded-lg bg-brand-600/10 dark:bg-brand-400/10 flex items-center justify-center text-brand-600 dark:text-brand-300 mb-4">
        <Icon aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Feature;
