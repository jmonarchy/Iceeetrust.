import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const ProgramCard = ({ title, description, image, metrics, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3 leading-snug">{title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
          {metrics && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-primary">{metrics}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgramCard;