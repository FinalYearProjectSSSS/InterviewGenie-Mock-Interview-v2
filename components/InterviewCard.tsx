import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import DisplayTechIcons from "./DisplayTechIcons";
import { Button } from "./ui/button";

import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { cn, getRandomInterviewCover } from "@/lib/utils";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  // Badge colors adjusted for soft theme
  const badgeColor =
    {
      Behavioral: "bg-sky-100 text-sky-700",
      Mixed: "bg-indigo-100 text-indigo-700",
      Technical: "bg-emerald-100 text-emerald-700",
    }[normalizedType] || "bg-sky-100 text-sky-700";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="relative bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
      {/* ---------- Top Section ---------- */}
      <div>
        {/* Badge */}
        <div
          className={cn(
            "absolute top-0 right-0 px-4 py-2 rounded-bl-2xl rounded-tr-2xl text-sm font-medium",
            badgeColor
          )}
        >
          {normalizedType}
        </div>

        {/* Cover Image */}
        <div className="flex justify-center mt-2">
          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={100}
            height={100}
            className="rounded-full object-cover shadow-sm"
          />
        </div>

        {/* Role */}
        <h3 className="mt-5 text-xl font-semibold text-foreground capitalize text-center">
          {role} Interview
        </h3>

        {/* Date & Score */}
        <div className="flex justify-center gap-8 mt-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/calendar.svg" width={20} height={20} alt="calendar" />
            <p className="text-sm">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-2">
            <Image src="/star.svg" width={20} height={20} alt="star" />
            <p className="text-sm">
              {feedback?.totalScore || "---"}/100
            </p>
          </div>
        </div>

        {/* Feedback */}
        <p className="mt-5 text-sm text-muted-foreground text-center line-clamp-2">
          {feedback?.finalAssessment ||
            "You haven't taken this interview yet. Take it now to improve your skills."}
        </p>
      </div>

      {/* ---------- Bottom Section ---------- */}
      <div className="flex justify-between items-center mt-6">
        <DisplayTechIcons techStack={techstack} />

        <Button
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          asChild
        >
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Check Feedback" : "View Interview"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard;