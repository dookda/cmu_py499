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
    <motion.div
      className="card h-100 card-transparent"
      role="region"
      aria-labelledby={`${project.id}-title`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <div className="card-body d-flex flex-column">
        <header className="mb-3">
          <h3 id={`${project.id}-title`} className="card-title h5 fw-semibold font-thai">
            {project.title}
          </h3>
        </header>
        <p className="card-text text-muted flex-grow-1 font-thai">
          {project.description}
        </p>
        <div className="mt-auto d-flex gap-2" aria-label="project links">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            aria-label={`Open demo for ${project.title}`}
          >
            <ExternalLink size={16} aria-hidden="true" /> Demo
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
