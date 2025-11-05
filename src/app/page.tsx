import Link from 'next/link';
import { ArrowRight, Sparkles, Target, TrendingUp, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Sales Automation</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-blue-600">
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
              AI-Powered LinkedIn Sales Automation
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Find the right prospects, send personalized messages, and sync
              everything to your Act! CRM—all on autopilot.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="rounded-lg border border-gray-300 px-6 py-3 text-lg font-medium hover:border-gray-400"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">
              Everything You Need to Scale Your Outreach
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed for modern sales teams
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Personalization</h3>
              <p className="text-gray-600">
                Claude AI generates personalized messages that feel human and
                get responses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Targeting</h3>
              <p className="text-gray-600">
                Find prospects by title, industry, location, and more with
                precision targeting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Act! CRM Sync</h3>
              <p className="text-gray-600">
                Seamlessly sync all prospects and interactions to your Act! CRM
                automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Team Collaboration</h3>
              <p className="text-gray-600">
                Multi-user support with role-based access for your entire sales
                team.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Campaign Analytics</h3>
              <p className="text-gray-600">
                Track performance, response rates, and ROI with detailed
                analytics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Safe & Compliant</h3>
              <p className="text-gray-600">
                LinkedIn-safe automation with human-like behavior patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Join sales teams using AI to book more meetings and close more deals.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-blue-600 hover:bg-gray-100"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 Sales Automation Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}