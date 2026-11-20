import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Sparkles,
  Target,
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Plan around your exams',
    description: 'Add subjects, topics, priorities, and exam dates in one simple place.',
  },
  {
    icon: CalendarDays,
    title: 'Know what to study today',
    description: 'Turn your goals into a clear schedule you can follow one session at a time.',
  },
  {
    icon: CheckCircle2,
    title: 'See your progress build',
    description: 'Mark sessions complete and keep your momentum visible on the calendar.',
  },
];

const steps = [
  { number: '01', title: 'Add your subjects', description: 'Enter your topics and exam dates.' },
  { number: '02', title: 'Create a study plan', description: 'Set your available time and generate a plan.' },
  { number: '03', title: 'Make steady progress', description: 'Follow your calendar and check off each session.' },
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-teal-100/80 bg-white/90 backdrop-blur">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-800">Scheduly</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-500 sm:flex">
            <a className="transition-colors hover:text-teal-700" href="#features">Features</a>
            <a className="transition-colors hover:text-teal-700" href="#how-it-works">How it works</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-teal-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 sm:px-4"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-100/70 blur-3xl" />
            <div className="absolute -bottom-48 left-1/4 h-80 w-80 rounded-full bg-teal-50 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="animate-fade-up">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1.5 text-sm font-medium text-teal-800">
                <Sparkles className="h-4 w-4" />
                A calmer way to prepare
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Make room for
                <span className="block text-teal-700">steady progress.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Organize your subjects, shape a study plan around your exams, and celebrate the small wins that get you there.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-teal-900/10 transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-100"
                >
                  Build my study plan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-teal-800"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-5 text-xs text-slate-400">
                Free to get started <span aria-hidden="true">·</span> Your planner data stays in your local app database
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-xl animate-fade-up lg:justify-self-end" style={{ animationDelay: '120ms' }}>
              <svg
                aria-hidden="true"
                className="absolute -left-8 top-4 h-20 w-20 animate-doodle-float text-teal-600 sm:-left-12 sm:h-24 sm:w-24"
                viewBox="0 0 100 100"
                fill="none"
              >
                <path d="M16 62c10-4 14-20 27-25 10-4 14 2 24-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
                <path d="m60 22 5 10 11 1-8 7 2 11-10-5-9 5 2-11-8-7 11-1 4-10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <svg
                aria-hidden="true"
                className="absolute -right-4 -top-8 h-16 w-16 animate-doodle-float text-teal-500 sm:-right-8 sm:h-20 sm:w-20"
                style={{ animationDelay: '800ms' }}
                viewBox="0 0 80 80"
                fill="none"
              >
                <path d="M18 45c10-2 17 2 24 11 5-10 10-15 19-17M40 11v9m22 3-6 7m-32-7 6 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="42" cy="42" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" />
              </svg>

              <div className="relative rounded-3xl border border-teal-100 bg-white p-5 shadow-[0_24px_70px_-35px_rgba(15,118,110,0.35)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">A little, every day</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">Your study week</h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
                  {[
                    ['M', '12'],
                    ['T', '13'],
                    ['W', '14'],
                    ['T', '15'],
                    ['F', '16'],
                    ['S', '17'],
                    ['S', '18'],
                  ].map(([day, date], index) => (
                    <div
                      key={`${day}-${date}`}
                      className={`rounded-xl py-2 ${index === 2 ? 'bg-teal-700 text-white' : 'text-slate-500'}`}
                    >
                      <span className={`block text-[10px] ${index === 2 ? 'text-teal-100' : 'text-slate-400'}`}>{day}</span>
                      <span className="mt-1 block text-sm font-semibold">{date}</span>
                      {index === 2 ? (
                        <Check className="mx-auto mt-1 h-3.5 w-3.5" />
                      ) : (
                        <span className="mx-auto mt-2 block h-1 w-1 rounded-full bg-teal-400" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-teal-50/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Today&apos;s focus</p>
                    <span className="text-xs font-medium text-teal-700">2 sessions</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3">
                      <span className="h-9 w-1 rounded-full bg-teal-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">Review key concepts</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <BookOpen className="h-3 w-3" /> Biology
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 className="h-3 w-3" /> 45m
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3">
                      <span className="h-9 w-1 rounded-full bg-teal-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">Practice problems</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <BookOpen className="h-3 w-3" /> Mathematics
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 className="h-3 w-3" /> 60m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Progress you can feel good about
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-y border-slate-100 bg-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-sm font-semibold text-teal-700">Made for real study days</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Less overwhelm. More direction.
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                The essentials to help you stay organized without making studying feel like another chore.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => (
                <article
                  key={title}
                  className="animate-fade-up rounded-2xl border border-slate-100 bg-[#fbfefd] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-800">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-teal-700">Simple by design</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Start small.
                  <span className="block text-teal-700">Keep going.</span>
                </h2>
                <p className="mt-4 max-w-md leading-7 text-slate-500">
                  A few details are all you need to get a plan that feels more manageable.
                </p>
              </div>
              <ol className="space-y-3">
                {steps.map((step) => (
                  <li key={step.number} className="flex gap-4 rounded-2xl border border-teal-100 bg-white p-5">
                    <span className="text-sm font-bold tracking-wide text-teal-700">{step.number}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800">{step.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-teal-800 px-6 py-10 text-center sm:px-12 sm:py-14">
            <svg aria-hidden="true" className="absolute left-5 top-4 h-20 w-20 text-teal-600/70" viewBox="0 0 100 100" fill="none">
              <path d="M20 50c15-20 30 20 45 0s20 0 25 4M36 28l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1 4-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-teal-100">One session at a time</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next study day can feel clearer.
            </h2>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 transition-all hover:-translate-y-0.5 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-400 sm:flex-row">
          <span className="font-semibold text-teal-800">Scheduly</span>
          <span>Small steps make progress.</span>
          <div className="flex gap-4">
            <Link href="/login" className="transition-colors hover:text-teal-700">Log in</Link>
            <Link href="/signup" className="transition-colors hover:text-teal-700">Sign up</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
