import { useCallback, useRef, useState } from 'react';

export default function useLongPress(onLongPress, onClick, { delay = 500 } = {}) {
    const timeout = useRef();
    const isLongPressActive = useRef(false);

    const start = useCallback((event) => {
        // Prevent context menu from appearing on long press
        if (event.contentEditable === 'false') {
            event.preventDefault();
        }
        
        isLongPressActive.current = false;
        timeout.current = setTimeout(() => {
            isLongPressActive.current = true;
            onLongPress(event);
        }, delay);
    }, [onLongPress, delay]);

    const stop = useCallback((event) => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        if (!isLongPressActive.current && onClick) {
            onClick(event);
        }
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
}
