"use client";

export default function BackToPortalButton() {
  return (
    <div className="w-full flex justify-end mb-6">
      <button
        onClick={() => (window.location.href = "http://192.168.112.63:3001")}
        className="px-5 py-2.5 rounded-lg border border-border bg-muted hover:bg-accent text-foreground font-medium shadow-sm hover:shadow-md transition-all duration-300"
      >
        ← Back to Portal
      </button>
    </div>
  );
}
