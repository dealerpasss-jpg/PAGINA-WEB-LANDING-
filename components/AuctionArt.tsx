"use client";
import { useState } from "react";
/** Stylized auction scene: Ford F-150, bidder and lane. Not real inventory. */
export default function AuctionArt({ compact = false }: { compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  const paint = compact ? "truck-small" : "truck-main";
  return (
    <div
      className={`auction-art auction-lane-art ${compact ? "auction-art-compact" : ""} ${paused ? "art-paused" : ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 700"
        fill="none"
        className="auction-art-svg"
      >
        <defs>
          <linearGradient
            id={paint}
            x1="210"
            y1="280"
            x2="560"
            y2="500"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f0eee6" />
            <stop offset=".5" stopColor="#a3aaa6" />
            <stop offset="1" stopColor="#5c6a69" />
          </linearGradient>
        </defs>
        <g stroke="#d8e1da" strokeOpacity=".12">
          <path d="M60 650 330 140h170l270 510M190 650l190-510m250 510L450 140M100 560h630M155 455h520M210 350h410M270 245h295" />
          <path d="M90 75h650v490M130 110h570v440" />
        </g>
        <path
          className="lane-orange"
          d="m195 665 185-525m250 525L450 140"
          stroke="#FF4D00"
          strokeWidth="2"
        />
        <path
          className="lane-dashes"
          d="M415 130v540"
          stroke="#FF4D00"
          strokeOpacity=".65"
          strokeWidth="2"
          strokeDasharray="12 18"
        />
        <g className="lane-sign">
          <rect
            x="332"
            y="55"
            width="167"
            height="68"
            rx="5"
            fill="#202f32"
            stroke="#768582"
          />
          <text x="353" y="80" fill="#b5bfb8" fontSize="10" letterSpacing="3">
            AUCTION LANE
          </text>
          <text x="353" y="108" fill="#f1eee5" fontSize="25" letterSpacing="2">
            03
          </text>
          <path d="M345 123v42m142-42v42" stroke="#83908a" />
        </g>
        <g className="auction-bidder">
          <ellipse
            cx="662"
            cy="577"
            rx="65"
            ry="16"
            fill="#080e10"
            fillOpacity=".5"
          />
          <path
            d="m633 422-9 137 20 7 20-116 10 118 22-3-6-149Z"
            fill="#707d76"
            stroke="#bbc2b8"
          />
          <path
            d="m624 552-8 21 32 2 1-17m25-1 3 20 34-2-18-18"
            fill="#d7d6c7"
          />
          <path
            d="M624 292q33-22 64 0l22 126q-45 27-92 5Z"
            fill="#d5d5c6"
            stroke="#f0eee0"
            strokeWidth="1.5"
          />
          <path
            d="m625 302-23 71 22 35m63-108 32-42-12-53"
            stroke="#d5d5c6"
            strokeWidth="23"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m626 317 9 97m49-99-3 91" stroke="#9ca79d" strokeWidth="2" />
          <path d="m648 280 1 17q13 10 23 0l-2-20" fill="#9fafa4" />
          <ellipse cx="660" cy="256" rx="22" ry="29" fill="#b5c2b2" />
          <path
            d="M637 254q-8-35 24-34 28 0 22 29l-13-10-30 4Z"
            fill="#293d3c"
            stroke="#a1b3a7"
          />
          <path
            d="m704 212-4-23q-1-7 4-7l5 14 0-27q2-6 5-1l2 23 4-23q4-5 5 1l-1 26 6-17q5-3 5 3l-8 29-8 11Z"
            fill="#b5c2b2"
            stroke="#d6dfd0"
          />
          <g className="bid-paddle">
            <path d="m705 188-8-40" stroke="#e7e9db" strokeWidth="5" />
            <rect
              x="665"
              y="100"
              width="65"
              height="52"
              rx="7"
              fill="#e7e6d8"
              stroke="#fff9e8"
              transform="rotate(-10 697 126)"
            />
            <text
              x="677"
              y="135"
              fontSize="23"
              fill="#253435"
              fontWeight="500"
              transform="rotate(-10 697 126)"
            >
              027
            </text>
            <path d="m676 146 40-7" stroke="#FF4D00" strokeWidth="2" />
          </g>
          <path
            className="bid-signal"
            d="m740 119 15-8m-19-9 8-13m-2 47 17 1"
            stroke="#FF4D00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="auction-truck">
          <ellipse
            cx="394"
            cy="510"
            rx="181"
            ry="30"
            fill="#060b0d"
            fillOpacity=".55"
          />
          <rect
            x="224"
            y="423"
            width="51"
            height="90"
            rx="14"
            fill="#121d20"
            stroke="#8b9690"
          />
          <rect
            x="513"
            y="423"
            width="51"
            height="90"
            rx="14"
            fill="#121d20"
            stroke="#8b9690"
          />
          <path
            d="m250 305 27-97q8-20 33-22h168q24 1 31 23l28 96 29 39v133q-172 36-344 0V345Z"
            fill={`url(#${paint})`}
            stroke="#e6e9dc"
            strokeWidth="2"
          />
          <path
            d="m275 297 24-86h187l25 86Z"
            fill="#172a2e"
            stroke="#d8e2d7"
            strokeWidth="2"
          />
          <path
            d="m302 218-16 69h103v-69Zm97 0v69h100l-19-69Z"
            fill="#32494b"
          />
          <path
            d="m320 219 52 65m29-65 52 65"
            stroke="#6e8580"
            strokeWidth="15"
            strokeOpacity=".3"
          />
          <path
            d="M270 314q123-20 248 0l21 30H249Z"
            fill="#d1d9cf"
            stroke="#f5f3e8"
          />
          <path d="m282 319 25 20m199-20-25 20" stroke="#91a29b" />
          <path
            d="M252 303h-43v28h34m294-28h42v28h-33"
            fill="#889b92"
            stroke="#d8dfd0"
          />
          <rect
            x="292"
            y="350"
            width="204"
            height="95"
            rx="4"
            fill="#17292d"
            stroke="#c3d0c6"
            strokeWidth="4"
          />
          <path
            d="M306 368h176m-176 18h176m-176 18h176m-176 18h176"
            stroke="#819890"
            strokeWidth="3"
          />
          <path
            d="M320 359v76m34-76v76m80-76v76m34-76v76"
            stroke="#3c5553"
            strokeWidth="2"
          />
          <ellipse
            cx="394"
            cy="395"
            rx="32"
            ry="14"
            fill="#193b4b"
            stroke="#d3ddd3"
            strokeWidth="2"
          />
          <text
            x="373"
            y="401"
            fill="#f3f3e7"
            fontSize="17"
            fontStyle="italic"
            fontFamily="Georgia,serif"
          >
            Ford
          </text>
          <path
            d="M239 352h39v86h-39Zm271 0h39v86h-39Z"
            fill="#465b59"
            stroke="#e5e8db"
            strokeWidth="2"
          />
          <path
            d="M273 356h-30v31h21m9 44h-30v-31h21M515 356h30v31h-21m-9 44h30v-31h-21"
            stroke="#f5f3dc"
            strokeWidth="4"
          />
          <path
            d="M231 455h326v24q-164 28-326 0Z"
            fill="#a7b8ac"
            stroke="#e8ecdc"
          />
          <path d="M276 463h237v22H276Z" fill="#203439" />
          <rect x="366" y="461" width="57" height="23" rx="2" fill="#e0e3d5" />
          <text x="375" y="477" fill="#273d3d" fontSize="11" letterSpacing="1">
            LOT 01
          </text>
          <path
            className="truck-scan"
            d="M235 447h319"
            stroke="#FF4D00"
            strokeWidth="2"
          />
          <path d="M236 470h21m272 0h21" stroke="#f5f3dc" strokeWidth="3" />
        </g>
        <g fill="#9fafa7" fontSize="9" letterSpacing="2">
          <text x="65" y="610">
            ANALIZA / DEFINE / PUJA
          </text>
          <text x="270" y="670">
            FORD F-150 · ILUSTRACIÓN CONCEPTUAL
          </text>
        </g>
      </svg>
      <div className="art-halo" />
      <button
        className="art-pause"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? "Activar movimiento" : "Pausar movimiento"}
        <span aria-hidden>{paused ? "▷" : "Ⅱ"}</span>
      </button>
    </div>
  );
}
