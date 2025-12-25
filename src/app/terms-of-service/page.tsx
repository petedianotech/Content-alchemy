
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1>Terms of Service for PeteAi</h1>

          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <p>
            Please read these Terms of Service ("Terms", "Terms of Service")
            carefully before using the PeteAi application (the "Service")
            operated by PeteAi ("us", "we", or "our").
          </p>

          <p>
            Your access to and use of the Service is conditioned upon your
            acceptance of and compliance with these Terms. These Terms apply to
            all visitors, users, and others who wish to access or use the
            Service. By accessing or using the Service you agree to be bound by
            these Terms. If you disagree with any part of the terms then you do
            not have permission to access the Service.
          </p>

          <h2>1. Accounts</h2>
          <p>
            When you create an account with us, you guarantee that you are above
            the age of 18, and that the information you provide us is accurate,
            complete, and current at all times. Inaccurate, incomplete, or
            obsolete information may result in the immediate termination of your
            account on the Service.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and password, including but not limited to the restriction
            of access to your computer and/or account. You agree to accept
            responsibility for any and all activities or actions that occur
            under your account and/or password.
          </p>
          
          <h2>2. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by
            users), features and functionality are and will remain the
            exclusive property of PeteAi and its licensors. The Service is
            protected by copyright, trademark, and other laws of both the
            United States and foreign countries.
          </p>

          <h2>3. User-Generated Content</h2>
          <p>
            Our Service allows you to create, post, and share content ("User Content").
            You are responsible for the User Content that you post on or through the Service,
            including its legality, reliability, and appropriateness. By posting User Content,
            you grant us the right and license to use, modify, publicly perform, publicly display,
            reproduce, and distribute such User Content on and through the Service. You retain any
            and all of your rights to any User Content you submit, post or display on or through
            the Service and you are responsible for protecting those rights.
          </p>

          <h2>4. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of the jurisdiction in which our company is established,
            without regard to its conflict of law provisions.
          </p>

          <h2>6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material we will provide
            at least 30 days' notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole
-            discretion.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            [Your Contact Email]
          </p>
        </article>
      </div>
    </main>
  );
}
