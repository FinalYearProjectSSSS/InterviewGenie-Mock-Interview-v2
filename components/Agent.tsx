"use client";

import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(
        undefined,
        undefined,
        undefined,
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
        { variableValues: { username: userName, userid: userId } }
      );
    } else {
      const formattedQuestions = questions
        ? questions.map((q) => `- ${q}`).join("\n")
        : "";

      await vapi.start(interviewer, {
        variableValues: { questions: formattedQuestions },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            AI Interview Session
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Practice your interview skills with our AI interviewer. Get real-time feedback and improve your performance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column - Participants */}
          <div className="space-y-8">
            
            {/* AI Interviewer Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Avatar Container */}
                <div className="relative">
                  {/* Status Ring */}
                  <div className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg opacity-20 transition-all duration-500",
                    isSpeaking && "animate-pulse opacity-40"
                  )}></div>
                  
                  {/* Avatar */}
                  <div className={cn(
                    "relative w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg flex items-center justify-center transition-all duration-500",
                    isSpeaking && "border-blue-300 shadow-blue-200"
                  )}>
                    <Image
                      src="/ai-avatar.png"
                      alt="AI Interviewer"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                    
                    {/* Speaking Indicator */}
                    {isSpeaking && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
                        Speaking
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    AI Interviewer
                  </h3>
                  <p className="text-slate-600 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {callStatus === CallStatus.ACTIVE ? "Active" : "Ready"}
                  </p>
                </div>
              </div>
            </div>

            {/* User Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-slate-200 blur-lg opacity-50"></div>
                  <div className="relative w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-lg overflow-hidden">
                    <Image
                      src="/user-avatar.png"
                      alt="User Avatar"
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {userName}
                  </h3>
                  <p className="text-slate-600">Interviewee</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Transcript & Controls */}
          <div className="space-y-8">
            
            {/* Transcript Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 h-96 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-slate-800">Live Transcript</span>
                </div>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {messages.length} messages
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-slate-700 text-lg leading-relaxed animate-fadeIn">
                      {lastMessage}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">No conversation yet</p>
                        <p className="text-sm text-slate-500 mt-1">Start the interview to begin the conversation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                  <button
                    className={cn(
                      "relative group px-12 py-4 rounded-xl text-lg font-semibold text-white",
                      "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                      "shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95",
                      "transition-all duration-300 ease-out",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                      "border border-blue-300"
                    )}
                    onClick={handleCall}
                    disabled={callStatus === CallStatus.CONNECTING}
                  >
                    {/* Loading animation */}
                    {callStatus === CallStatus.CONNECTING && (
                      <span className="absolute inset-0 rounded-xl bg-blue-500 animate-ping opacity-75"></span>
                    )}
                    
                    <span className="relative z-10 flex items-center gap-3">
                      {callStatus === CallStatus.CONNECTING ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Start Interview
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="relative group px-12 py-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out border border-red-300"
                  >
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End Interview
                    </span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-700">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    callStatus === CallStatus.ACTIVE ? "bg-green-500 animate-pulse" :
                    callStatus === CallStatus.CONNECTING ? "bg-yellow-500 animate-pulse" :
                    "bg-slate-400"
                  )}></div>
                  <span>
                    {callStatus === CallStatus.ACTIVE ? "Interview in progress" :
                     callStatus === CallStatus.CONNECTING ? "Connecting to AI..." :
                     callStatus === CallStatus.FINISHED ? "Interview completed" :
                     "Ready to start"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Agent;