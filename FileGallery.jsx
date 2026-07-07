import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';

const ImpactStoryCard = ({ story, index = 0 }) => {
  const imageUrl = story.story_image 
    ? pb.files.getUrl(story, story.story_image)
    : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          {story.featured && (
            <Badge className="absolute top-4 right-4 bg-primary">Featured</Badge>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2 leading-snug">{story.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{story.community_name}</p>
          <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {story.story_content}
          </p>
          {story.testimonial_quote && (
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground mt-4">
              "{story.testimonial_quote}"
              {story.testimonial_author && (
                <footer className="text-xs mt-2 not-italic font-medium">
                  — {story.testimonial_author}
                </footer>
              )}
            </blockquote>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ImpactStoryCard;