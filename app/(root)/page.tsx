import Image from "next/image";
import Link from "next/link";

import BackToPortalButton from "@/components/BackToPortalButton";
import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <BackToPortalButton />

      {/* ---------- HERO SECTION ---------- */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-10 p-10 rounded-2xl border border-border bg-gradient-to-br from-white via-sky-50 to-sky-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="gradient-title text-3xl md:text-4xl leading-tight">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h2>

          <p className="text-lg text-muted-foreground">
            Practice real interview questions & get instant feedback to grow with confidence.
          </p>

          <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white font-medium max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/banner.jpeg"
          alt="AI interview assistant"
          width={380}
          height={380}
          className="max-sm:hidden rounded-2xl shadow-md"
        />
      </section>

      {/* ---------- YOUR INTERVIEWS ---------- */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Your Interviews</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t taken any interviews yet.
            </p>
          )}
        </div>
      </section>

      {/* ---------- AVAILABLE INTERVIEWS ---------- */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Take Interviews</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              There are no interviews available.
            </p>
          )}
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-muted mt-20 py-10 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            Made with <span className="text-pink-500">💗</span> by 
            <span className="font-semibold text-foreground"> Shreyas</span>
          </p>
        </div>
      </footer>
    </>
  );
}

export default Home;
