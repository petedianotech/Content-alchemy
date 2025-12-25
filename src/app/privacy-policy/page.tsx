
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <article className="prose prose-invert mx-auto max-w-4xl">
          <h1>Privacy Policy for PeteAi</h1>

          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <p>
            Welcome to PeteAi. We are committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our application.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The
            information we may collect on the Service includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable
              information, such as your name, shipping address, email address,
              and telephone number, and demographic information, such as your
              age, gender, hometown, and interests, that you voluntarily give
              to us when you register with the Service.
            </li>
            <li>
              <strong>Usage Data:</strong> Information our servers automatically
              collect when you access the Service, such as your IP address,
              your browser type, your operating system, your access times, and
              the pages you have viewed directly before and after accessing the
              Service.
            </li>
            <li>
              <strong>Third-Party Data:</strong> Information from third parties,
              such as personal information or network friends, if you connect
              your account to the third party and grant the Service permission
              to access this information.
            </li>
          </ul>

          <h2>2. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with
            a smooth, efficient, and customized experience. Specifically, we may
            use information collected about you via the Service to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>
              Email you regarding your account or order.
            </li>
            <li>
              Enable user-to-user communications.
            </li>
            <li>
              Generate a personal profile about you to make future visits to the
              Service more personalized.
            </li>
            <li>
              Monitor and analyze usage and trends to improve your experience
              with the Service.
            </li>
          </ul>

          <h2>3. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain
            situations. Your information may be disclosed as follows:
          </p>
          <ul>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the
              release of information about you is necessary to respond to legal
              process, to investigate or remedy potential violations of our
              policies, or to protect the rights, property, and safety of
              others, we may share your information as permitted or required by
              any applicable law, rule, or regulation.
            </li>
            <li>
              <strong>Third-Party Service Providers:</strong> We may share your
              information with third parties that perform services for us or on
              our behalf, including payment processing, data analysis, email
              delivery, hosting services, customer service, and marketing
              assistance.
            </li>
          </ul>

          <h2>4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </p>

          <h2>5. Policy for Children</h2>
          <p>
            We do not knowingly solicit information from or market to children
            under the age of 13. If you become aware of any data we have
            collected from children under age 13, please contact us using the
            contact information provided below.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please
            contact us at: [Your Contact Email]
          </p>
        </article>
      </div>
    </main>
  );
}
