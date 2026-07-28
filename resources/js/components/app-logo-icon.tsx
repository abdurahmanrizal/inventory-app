import type { SVGAttributes } from "react";

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg {...props} viewBox="0 0 430 430" xmlns="http://www.w3.org/2000/svg">
      <image
        href="/brand/bas-stockflow-mark.png"
        width="430"
        height="430"
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );
}
