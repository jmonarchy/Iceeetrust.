import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import { useLanguage } from '@/contexts/LanguageContext';

const ContactFormComponent = ({ type = 'contact' }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    skills: '',
    availability: '',
    interests: '',
    organizationName: '',
    contactPerson: '',
    partnershipType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (type === 'contact') {
        endpoint = '/contact/submit';
        payload = {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        };
      } else if (type === 'volunteer') {
        endpoint = '/volunteer/signup';
        payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          skills: formData.skills,
          availability: formData.availability,
          interests: formData.interests
        };
      } else if (type === 'partnership') {
        endpoint = '/partnership/inquire';
        payload = {
          organization_name: formData.organizationName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          partnership_type: formData.partnershipType,
          message: formData.message
        };
      }

      const response = await apiServerClient.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      toast.success(t.contact.successMessage);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        skills: '',
        availability: '',
        interests: '',
        organizationName: '',
        contactPerson: '',
        partnershipType: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t.contact.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {type === 'partnership' ? (
        <>
          <div>
            <Label htmlFor="organizationName">{t.contact.organizationName}</Label>
            <Input
              id="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              required
              className="text-gray-900"
            />
          </div>
          <div>
            <Label htmlFor="contactPerson">{t.contact.contactPerson}</Label>
            <Input
              id="contactPerson"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              required
              className="text-gray-900"
            />
          </div>
        </>
      ) : (
        <div>
          <Label htmlFor="name">{t.contact.name}</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="text-gray-900"
          />
        </div>
      )}

      <div>
        <Label htmlFor="email">{t.contact.email}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          className="text-gray-900"
        />
      </div>

      {(type === 'volunteer' || type === 'partnership') && (
        <div>
          <Label htmlFor="phone">{t.contact.phone}</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className="text-gray-900"
          />
        </div>
      )}

      {type === 'contact' && (
        <div>
          <Label htmlFor="subject">{t.contact.subject}</Label>
          <Input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            required
            className="text-gray-900"
          />
        </div>
      )}

      {type === 'volunteer' && (
        <>
          <div>
            <Label htmlFor="skills">{t.contact.skills}</Label>
            <Textarea
              id="skills"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              rows={3}
              className="text-gray-900"
            />
          </div>
          <div>
            <Label htmlFor="availability">{t.contact.availability}</Label>
            <Select value={formData.availability} onValueChange={(value) => handleChange('availability', value)}>
              <SelectTrigger className="text-gray-900">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Weekends">Weekends</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="interests">{t.contact.interests}</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => handleChange('interests', e.target.value)}
              rows={3}
              placeholder="e.g., Youth Development, Environmental Conservation"
              className="text-gray-900"
            />
          </div>
        </>
      )}

      {type === 'partnership' && (
        <div>
          <Label htmlFor="partnershipType">{t.contact.partnershipType}</Label>
          <Select value={formData.partnershipType} onValueChange={(value) => handleChange('partnershipType', value)}>
            <SelectTrigger className="text-gray-900">
              <SelectValue placeholder="Select partnership type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Funding Partner">Funding Partner</SelectItem>
              <SelectItem value="Implementation Partner">Implementation Partner</SelectItem>
              <SelectItem value="Knowledge Partner">Knowledge Partner</SelectItem>
              <SelectItem value="Advocacy Partner">Advocacy Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="message">{t.contact.message}</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          required
          rows={5}
          className="text-gray-900"
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full"
        disabled={loading}
      >
        {loading ? t.contact.submitting : t.contact.submit}
      </Button>
    </form>
  );
};

export default ContactFormComponent;