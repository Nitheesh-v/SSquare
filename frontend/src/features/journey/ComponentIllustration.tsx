"use client";

import { useId } from "react";

/** Lightweight, always-available views of the same illustrative procedural parts. */
export function ComponentIllustration({
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
          x1="60"
          y1="40"
          x2="245"
          y2="270"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={type === 0 ? "#4b5150" : "#f3f6f7"} />
          <stop offset=".28" stopColor={type === 0 ? "#242c2a" : "#8e9da9"} />
          <stop offset=".5" stopColor={type === 0 ? "#161e1c" : "#dce4e9"} />
          <stop offset=".78" stopColor={type === 0 ? "#343b38" : "#71818e"} />
          <stop offset="1" stopColor={type === 0 ? "#0d1514" : "#e7edef"} />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#17202c" stopOpacity=".22" />
          <stop offset="1" stopColor="#17202c" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-holes`}>
          <rect width="300" height="300" fill="white" />
          <circle cx="150" cy="145" r={type === 0 ? 58 : 49} fill="black" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <circle
                key={i}
                cx={150 + Math.cos(a) * 87}
                cy={145 + Math.sin(a) * 87}
                r={type === 0 ? 9 : 11}
                fill="black"
              />
            );
          })}
        </mask>
      </defs>
      <ellipse cx="153" cy="261" rx="130" ry="28" fill={`url(#${id}-shadow)`} />
      {type < 2 ? (
        <g>
          <g mask={`url(#${id}-holes)`}>
            <circle
              cx="150"
              cy="152"
              r="117"
              fill={type === 0 ? "#111a18" : "#5f7281"}
            />
            <circle
              cx="150"
              cy="145"
              r="117"
              fill={`url(#${id}-metal)`}
              stroke={type === 0 ? "#505957" : "#eff3f7"}
              strokeWidth="2"
            />
            <circle
              cx="150"
              cy="145"
              r="108"
              stroke={type === 0 ? "#48514c" : "#eaf0f2"}
              strokeOpacity=".65"
              strokeWidth="1.5"
            />
            <circle
              cx="150"
              cy="145"
              r="70"
              fill={type === 0 ? "#1c2522" : `url(#${id}-metal)`}
              stroke={type === 0 ? "#515a55" : "#8294a2"}
              strokeWidth="3"
            />
            {type === 1 && (
              <>
                <circle
                  cx="150"
                  cy="145"
                  r="76"
                  stroke="#f2f6f7"
                  strokeWidth="1"
                />
                <circle
                  cx="150"
                  cy="145"
                  r="101"
                  stroke="#748592"
                  strokeWidth=".6"
                />
              </>
            )}
          </g>
          <circle
            cx="150"
            cy="145"
            r={type === 0 ? 58 : 49}
            stroke={type === 0 ? "#59615d" : "#566c7c"}
            strokeWidth="3"
          />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <circle
                key={i}
                cx={150 + Math.cos(a) * 87}
                cy={145 + Math.sin(a) * 87}
                r={type === 0 ? 9 : 11}
                stroke={type === 0 ? "#4d5853" : "#6b7d8a"}
                strokeWidth="1.5"
              />
            );
          })}
        </g>
      ) : (
        <g strokeLinejoin="round">
          <path
            d="M82 66 174 31 225 73 225 232 134 272 82 226Z"
            fill={`url(#${id}-metal)`}
            stroke="#dce7eb"
            strokeWidth="2"
          />
          <path
            d="M82 66 134 110 225 73 174 31Z"
            fill="#e0e9ec"
            stroke="#647e89"
          />
          <path d="m82 66 52 44v162l-52-46Z" fill="#829bA5" />
          <path d="m134 110 91-37v159l-91 40Z" fill={`url(#${id}-metal)`} />
          <path
            d="m100 80 13 11v147l-13-10Zm51 28 13-6v150l-13 6Zm40-16 13-6v151l-13 6Z"
            fill="#425d68"
          />
          <path
            d="m104 58 17-6 17 15-17 6Zm49-19 18-7 17 15-18 7Zm-2 29 18-7 18 16-18 7Zm-21 17 17-6 18 15-18 7Z"
            fill="#4b6872"
          />
          <path d="m142 57 12-5 12 10-12 5Z" fill="#526e78" />
          <path
            d="M134 111v161M83 67l50 44 91-38"
            stroke="#f2f6f7"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}

export function MaterialFragment({ type = 0 }: { type?: number }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {type === 0 ? (
        <>
          <ellipse
            cx="50"
            cy="52"
            rx="31"
            ry="26"
            stroke="#202f29"
            strokeWidth="13"
          />
          <ellipse
            cx="50"
            cy="48"
            rx="31"
            ry="26"
            stroke="#44554a"
            strokeWidth="3"
          />
        </>
      ) : type === 1 ? (
        <>
          <path d="m25 33 24-14 26 14v33L50 81 25 66Z" fill="#687d90" />
          <path d="m25 33 25 15 25-15-26-14Z" fill="#dbe3e9" />
          <ellipse cx="50" cy="34" rx="11" ry="7" fill="#536776" />
          <path d="M50 48v33" stroke="#e2eaf0" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="m20 39 34-18 25 16v31L46 84 20 67Z" fill="#b4d1d4" />
          <path d="m20 39 26 17 33-19-25-16Z" fill="#e4f2ee" />
          <path d="m46 56 33-19v31L46 84Z" fill="#658c94" />
          <path d="m33 40 21-11 12 8-21 12Z" fill="#567b80" />
        </>
      )}
    </svg>
  );
}
