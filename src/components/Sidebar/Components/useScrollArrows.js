import { useEffect, useState } from "react";

export default function useScrollArrows(scrollRef, deps = []) {
    const [canScrollLeft, setLeft] = useState(false);
    const [canScrollRight, setRight] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const update = () => {
            setLeft(el.scrollLeft > 0);
            setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        };

        update();
        el.addEventListener("scroll", update);
        return () => el.removeEventListener("scroll", update);
    }, deps);

    return [canScrollLeft, canScrollRight];
}
