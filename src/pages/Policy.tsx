import React from 'react';
import { ShieldCheck, User, Database, Shield, Users, UserCheck, Mail } from 'lucide-react';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'information-we-collect', title: 'Information We Collect', icon: User,
    intro: 'We collect personal information that you voluntarily provide to us when you contact us, request a site visit, enquire about a property or project, or submit a form on this website. This may include:',
    bullets: [
      <><strong>Contact details:</strong> name, email address, phone number and location.</>,
      <><strong>Enquiry details:</strong> the property, project or service you are interested in, and the message you send us.</>,
      <><strong>Land details (for sellers):</strong> information and documents you share about land you wish to sell or have valued.</>,
      <><strong>Basic usage data:</strong> pages visited and device or browser information, collected through standard website analytics.</>,
    ],
  },
  {
    id: 'how-we-use-your-data', title: 'How We Use Your Data', icon: Database,
    intro: 'We use your information to:',
    bullets: [
      'Respond to your enquiries and share relevant property and farm project details.',
      'Arrange site visits and connect you with our team.',
      'Provide the services you request, such as land valuation, legal documentation support or project guidance.',
      'Send updates about projects, offers and services, where you have agreed to receive them.',
      'Improve our website, services and user experience.',
    ],
  },
  {
    id: 'data-security-measures', title: 'Data Security Measures', icon: Shield,
    intro: 'We take reasonable steps to protect the personal information you share with us from unauthorised access, loss or misuse, and we limit access to those who need it to respond to your request. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
  },
  {
    id: 'third-party-disclosures', title: 'Third-Party Disclosures', icon: Users,
    intro: 'We do not sell your personal information. We may share it only where needed to serve you or where the law requires:',
    bullets: [
      'With IGO Group companies and partners involved in your enquiry, project or site visit.',
      'With legal, regulatory or government authorities when required by law.',
      'With service providers who help us operate the website and communicate with you, such as hosting, analytics or messaging services.',
    ],
  },
  {
    id: 'your-rights-and-choices', title: 'Your Rights and Choices', icon: UserCheck,
    intro: 'You can contact us to:',
    bullets: [
      'Ask what personal information we hold about you and request access to it.',
      'Request correction or deletion of your personal information.',
      'Opt out of marketing communications at any time.',
    ],
  },
  {
    id: 'contact-us', title: 'Contact Us', icon: Mail,
    intro: 'If you have any questions about this Privacy Policy or how we handle your data, write to us at bd2@igogroups.com or call +91 73977 89803. Our head office is at No. 17, Kovalan Street, 2nd Main Road, Uthandi Kanathur, Chennai – 600119, Tamil Nadu, India. You can also reach us through our contact page.',
  },
];

const Policy: React.FC = () => (
  <LegalLayout
    seoTitle="Privacy Policy & Data Security"
    seoDescription="How IGO Agri Estates collects, uses and protects your personal information when you enquire about agricultural land and farm projects."
    canonical="/policy"
    heroIcon={ShieldCheck}
    titleLead="Privacy Policy &"
    titleAccent="Data Security"
    description="At IGO Agri Estate, we value your privacy and are committed to protecting your personal information and data security."
    sections={sections}
  />
);

export default Policy;
