"use client";

export default function BackToPortalButton() {
  return (
    <div className="w-full flex justify-end mb-4">
      <button
        onClick={() => (window.location.href = "http://192.168.112.63:3001")}
        className="btn-secondary"
      >
        Back to Portal
      </button>
    </div>
  );
}
