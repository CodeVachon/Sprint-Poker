import { FC } from "react";

interface ICardProps {
    className?: string;
}

const Card: FC<ICardProps> = ({ className = "", children }) => {
    return <div className={className}>
        <svg width="100%" height="100%">
    <defs>
        <pattern id="polka-dots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">

            <circle fill="#bee9e8" cx="50" cy="50" r="25">
            </circle>

        </pattern>
    </defs>

    <rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)"></rect>
</svg>
    </div>;
};

export default Card;
export { Card };