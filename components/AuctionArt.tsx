"use client";
import { useState } from "react";
/** Original code-native auction illustration. Decorative; no inventory or live bids. */
export default function AuctionArt({ compact = false }: { compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={`auction-art ${compact ? "auction-art-compact" : ""} ${paused ? "art-paused" : ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 700"
        fill="none"
        className="auction-art-svg"
      >
        <defs>
          <linearGradient
            id={compact ? "metal-small" : "metal-hero"}
            x1="270"
            y1="150"
            x2="550"
            y2="430"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#faf7f0" />
            <stop offset=".45" stopColor="#c9c5bb" />
            <stop offset="1" stopColor="#777b7c" />
          </linearGradient>
          <linearGradient
            id={compact ? "base-small" : "base-hero"}
            x1="200"
            y1="400"
            x2="570"
            y2="600"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#454d50" />
            <stop offset="1" stopColor="#151c20" />
          </linearGradient>
        </defs>
        <g
          className="art-grid"
          stroke="#a7b3b8"
          strokeOpacity=".12"
          strokeWidth="1"
        >
          <path d="M80 470 400 285 750 487 430 672Z" />
          <path d="m150 510 320-185m-250 225 320-185m-250 225 320-185m-250 225 320-185M150 430l350 202M220 390l350 202M290 350l350 202M360 310l350 202" />
        </g>
        <g className="art-orbits" stroke="#a5afb2" strokeOpacity=".2">
          <ellipse cx="420" cy="400" rx="292" ry="218" />
          <ellipse cx="420" cy="400" rx="245" ry="183" />
          <path d="M113 400h30m554 0h30M420 167v30m0 406v30" />
        </g>
        <path
          className="art-circuit"
          d="M60 500h130l100-58h70M640 190h68v160l-83 48M190 175v90l70 40"
          stroke="#FF4D00"
          strokeWidth="2"
          pathLength="1"
        />
        <circle
          className="art-signal"
          cx="640"
          cy="190"
          r="9"
          fill="none"
          stroke="#FF4D00"
        />
        <g className="art-pedestal">
          <ellipse
            cx="430"
            cy="558"
            rx="190"
            ry="46"
            fill="#060b0e"
            fillOpacity=".5"
          />
          <path
            d="M245 462 422 363 605 466v65L430 632 245 526Z"
            fill={`url(#${compact ? "base-small" : "base-hero"})`}
            stroke="#6e777a"
            strokeWidth="1.2"
          />
          <path
            d="m245 462 185 106 175-102M430 568v64"
            stroke="#8a9295"
            strokeOpacity=".5"
          />
          <path d="m269 483 161 92 152-88" stroke="#FF4D00" strokeWidth="2" />
          <ellipse cx="423" cy="461" rx="110" ry="58" fill="#68706e" />
          <path
            d="M313 452v20c0 32 49 58 110 58s110-26 110-58v-20"
            fill="#272f32"
            stroke="#929792"
          />
          <ellipse cx="423" cy="452" rx="110" ry="58" fill="#c7c5ba" />
          <ellipse
            cx="423"
            cy="452"
            rx="90"
            ry="46"
            fill="#424b4d"
            stroke="#ebe7da"
            strokeOpacity=".6"
          />
        </g>
        <g className="art-gavel">
          <path
            d="m414 263 145 136c17 17 4 39-14 28L387 293Z"
            fill={`url(#${compact ? "metal-small" : "metal-hero"})`}
            stroke="#f3f1e8"
            strokeWidth="1.5"
          />
          <path
            d="m424 281 124 119"
            stroke="#faf8ef"
            strokeOpacity=".7"
            strokeWidth="3"
          />
          <path
            d="m305 205 106-61 105 61v97l-106 61-105-61Z"
            fill={`url(#${compact ? "metal-small" : "metal-hero"})`}
            stroke="#f1eee4"
            strokeWidth="1.5"
          />
          <path
            d="m305 205 105 62 106-62M410 267v96"
            stroke="#555f63"
            strokeWidth="1.5"
          />
          <path
            d="m327 194 106 61v95m-85-168 106 61v95"
            stroke="#323b3e"
            strokeOpacity=".5"
            strokeWidth="5"
          />
          <path d="m305 289 105 62 106-61" stroke="#FF4D00" strokeWidth="3" />
          <path d="m304 205 106 62" stroke="#fffdf5" strokeWidth="3" />
        </g>
        <g className="art-lot-card">
          <path d="m85 293 146-39 1 138-147 40Z" fill="#f0ede5" stroke="#fff" />
          <path d="m104 321 107-29M105 381l82-23" stroke="#a6a59e" />
          <text
            x="103"
            y="309"
            fill="#555c5c"
            fontSize="10"
            letterSpacing="2"
            transform="rotate(-15 103 309)"
          >
            SUBASTA / LOTE
          </text>
          <text
            x="103"
            y="370"
            fill="#182024"
            fontSize="44"
            letterSpacing="-3"
            transform="rotate(-15 103 370)"
          >
            001
          </text>
          <path d="m106 403 56-15" stroke="#FF4D00" strokeWidth="3" />
        </g>
        <g className="art-check-card">
          <path
            d="m575 325 138 37v128l-138-37Z"
            fill="#273135"
            stroke="#707b7e"
          />
          <text
            x="594"
            y="360"
            fill="#e5e5dd"
            fontSize="10"
            letterSpacing="1.5"
            transform="rotate(15 594 360)"
          >
            ANTES DE PUJAR
          </text>
          <path
            d="m594 385 12 13 17-18m-29 38 12 13 17-18"
            stroke="#FF4D00"
            strokeWidth="2"
          />
          <path
            d="m635 397 57 15m-57 18 42 11"
            stroke="#e2e2da"
            strokeOpacity=".65"
            strokeWidth="2"
          />
        </g>
        <g fill="#9da8aa" fontSize="9" letterSpacing="2">
          <text x="500" y="130">
            CRITERIO / MÉTODO
          </text>
          <text x="500" y="658">
            DEALERPASS / EL SIGUIENTE PASO
          </text>
        </g>
        <circle cx="640" cy="190" r="5" fill="#FF4D00" />
        <circle cx="190" cy="175" r="3" fill="#FF4D00" />
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
