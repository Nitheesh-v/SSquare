"use client";

import { useId } from "react";

/** Still views corresponding to the reference's bonded seal, nut and housing. */
export function ReferenceIllustration({
  type = 0,
  className = "",
}: {
  type?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`component-illustration ${className}`}
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-metal`}
          x1="45"
          y1="35"
          x2="248"
          y2="255"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f6f8fa" />
          <stop offset=".22" stopColor="#a2aab5" />
          <stop offset=".45" stopColor="#e3e7eb" />
          <stop offset=".7" stopColor="#737f8d" />
          <stop offset="1" stopColor="#dde2e7" />
        </linearGradient>
        <linearGradient
          id={`${id}-dark`}
          x1="52"
          y1="47"
          x2="250"
          y2="268"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5d626b" />
          <stop offset=".28" stopColor="#20252e" />
          <stop offset=".62" stopColor="#363c46" />
          <stop offset="1" stopColor="#101620" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#030712" stopOpacity=".38" />
          <stop offset="1" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-hole`}>
          <rect width="300" height="300" fill="white" />
          <ellipse
            cx="150"
            cy="139"
            rx={type === 0 ? 61 : 48}
            ry={type === 0 ? 58 : 46}
            fill="black"
          />
        </mask>
      </defs>
      <ellipse cx="155" cy="264" rx="130" ry="23" fill={`url(#${id}-shadow)`} />
      {type === 0 ? (
        <g mask={`url(#${id}-hole)`}>
          <ellipse cx="150" cy="155" rx="123" ry="117" fill="#646f7b" />
          <ellipse
            cx="150"
            cy="142"
            rx="123"
            ry="117"
            fill={`url(#${id}-metal)`}
            stroke="#e0e4e9"
            strokeWidth="2"
          />
          <ellipse
            cx="150"
            cy="139"
            rx="99"
            ry="94"
            fill={`url(#${id}-dark)`}
            stroke="#111821"
            strokeWidth="2"
          />
          <ellipse
            cx="150"
            cy="139"
            rx="79"
            ry="76"
            stroke="#747c86"
            strokeOpacity=".55"
            strokeWidth="2"
          />
          <ellipse
            cx="150"
            cy="139"
            rx="115"
            ry="109"
            stroke="#687480"
            strokeOpacity=".8"
          />
          <ellipse
            cx="150"
            cy="139"
            rx="63"
            ry="60"
            stroke="#939ba5"
            strokeWidth="4"
          />
        </g>
      ) : type === 1 ? (
        <g>
          <path d="m150 28 109 61v120l-109 62-109-62V89Z" fill="#6c7886" />
          <g mask={`url(#${id}-hole)`}>
            <path
              d="m150 17 109 61v120l-109 62-109-62V78Z"
              fill={`url(#${id}-metal)`}
              stroke="#cdd5dd"
              strokeWidth="3"
            />
            <path
              d="m150 32 94 53v105l-94 54-94-54V85Z"
              stroke="#f0f3f6"
              strokeWidth="2"
            />
            <ellipse
              cx="150"
              cy="139"
              rx="55"
              ry="53"
              stroke="#5d6e7c"
              strokeWidth="6"
            />
            <path
              d="m41 78 15 7M259 78l-15 7M150 244v16"
              stroke="#697b89"
              strokeWidth="2"
            />
          </g>
          <ellipse
            cx="150"
            cy="139"
            rx="48"
            ry="46"
            stroke="#a2b2bd"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g transform="rotate(-18 150 150)">
          <path
            d="M72 88c0-27 35-49 78-49s78 22 78 49v116c0 29-35 51-78 51s-78-22-78-51Z"
            fill={`url(#${id}-metal)`}
            stroke="#bac4cf"
            strokeWidth="2"
          />
          <ellipse
            cx="150"
            cy="88"
            rx="78"
            ry="49"
            fill={`url(#${id}-metal)`}
            stroke="#f2f5f8"
            strokeWidth="3"
          />
          <ellipse
            cx="150"
            cy="88"
            rx="36"
            ry="23"
            fill="#35434f"
            stroke="#8e9eaa"
            strokeWidth="5"
          />
          <path
            d="M72 117c0 27 35 49 78 49s78-22 78-49M72 130c0 27 35 49 78 49s78-22 78-49M72 191c0 27 35 49 78 49s78-22 78-49"
            stroke="#5d7181"
            strokeWidth="3"
          />
          <path
            d="M72 112c0 27 35 49 78 49s78-22 78-49M72 185c0 27 35 49 78 49s78-22 78-49"
            stroke="#e8eef3"
            strokeWidth="2"
          />
          <path
            d="M97 133v65M106 140v65M194 140v65M203 133v65"
            stroke="#dfe6ec"
            strokeOpacity=".65"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}

export function ReferenceGear({ className = "" }: { className?: string }) {
  const points = Array.from({ length: 80 }, (_, i) => {
    const a = (i / 80) * Math.PI * 2,
      r = i % 4 === 1 || i % 4 === 2 ? 44 : 36;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <polygon
        points={points}
        fill="#8997a4"
        stroke="#cbd5df"
        strokeWidth=".7"
      />
      <circle
        cx="50"
        cy="50"
        r="17"
        fill="#172534"
        stroke="#cbd5df"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="29" stroke="#b5c2cd" strokeWidth="1.5" />
    </svg>
  );
}
