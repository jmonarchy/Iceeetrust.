import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const TestimonialCard = ({ quote, author, role, community }) => {
  return (
    <Card className="h-full bg-muted">
      <CardContent className="p-6">
        <Quote className="w-10 h-10 text-primary/20 mb-4" />
        <blockquote className="text-lg leading-relaxed mb-6 italic">
          "{quote}"
        </blockquote>
        <div className="border-t border-border pt-4">
          <p className="font-semibold">{author}</p>
          {role && <p className="text-sm text-muted-foreground">{role}</p>}
          {community && <p className="text-sm text-primary mt-1">{community}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;