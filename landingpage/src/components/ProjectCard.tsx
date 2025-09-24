import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import React from 'react';
import type { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  return (
    <motion.article
      className="card card-gradient p-5 flex flex-col" role="region" aria-labelledby={`${project.id}-title`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <header className="mb-3">
        <h3 id={`${project.id}-title`} className="font-semibold text-lg tracking-tight text-slate-800 dark:text-slate-100">
          {project.title}
        </h3>
      </header>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 flex-1">
        {project.description}
      </p>
      <ul className="flex flex-wrap gap-2 mb-4" aria-label="technologies">
        {project.tech.slice(0, 4).map(t => (
          <li key={t}>
            <span className="badge" aria-label={t}>{t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-3" aria-label="project links">
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn focus-outline"
          aria-label={`Open demo for ${project.title}`}
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" /> Demo
        </a>
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline focus-outline"
            aria-label={`Open repository for ${project.title}`}
          >
            <Github className="w-4 h-4" aria-hidden="true" /> Repo
          </a>
        )}
      </div>
    </motion.article>
  );
};

export default ProjectCard;
