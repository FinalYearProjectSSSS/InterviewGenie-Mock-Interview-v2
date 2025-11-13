import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback bg-background text-foreground">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold text-foreground">
          Feedback on the Interview -{" "}
          <span className="capitalize text-primary-200">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5 flex-wrap justify-center">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p className="text-foreground">
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2 items-center bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p className="text-foreground">
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <p className="text-foreground leading-relaxed">{feedback?.finalAssessment}</p>
      </div>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2 className="text-foreground">Breakdown of the Interview:</h2>
        <div className="space-y-4">
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index} className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-primary-200/30 transition-colors">
              <p className="font-bold text-foreground mb-2">
                {index + 1}. {category.name}{" "}
                <span className="text-primary-200">({category.score}/100)</span>
              </p>
              <p className="text-foreground/80">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-foreground">Strengths</h3>
        <ul className="space-y-2">
          {feedback?.strengths?.map((strength, index) => (
            <li key={index} className="text-foreground/90 ml-4">{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-foreground">Areas for Improvement</h3>
        <ul className="space-y-2">
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index} className="text-foreground/90 ml-4">{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-white text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;