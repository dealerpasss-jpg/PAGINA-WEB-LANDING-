type Direction = "up-right" | "right" | "left" | "up" | "down" | "down-right";
const paths: Record<Direction, string> = {
  "up-right": "M6 18 18 6M6 6h12v12",
  right: "M4 12h16M13 5l7 7-7 7",
  left: "M20 12H4M11 5l-7 7 7 7",
  up: "M12 20V4M5 11l7-7 7 7",
  down: "M12 4v16M5 13l7 7 7-7",
  "down-right": "M6 6l12 12M6 18h12V6",
};
export default function ArrowIcon({
  direction = "up-right",
}: {
  direction?: Direction;
}) {
  return (
    <svg
      className="dp-arrow"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={paths[direction]}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
