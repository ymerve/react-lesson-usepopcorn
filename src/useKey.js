//  handle keyboard events and provide a simple way to listen for specific key presses within a React component.

import { useEffect } from "react";

export function useKey(key, action) {
    useEffect(function () {
        const callback = (e) => {
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
                console.log("CLOSING");
            }
        }
        document.addEventListener("keydown", callback);
        return () => {
            document.removeEventListener("keydown", callback); // If we do not clean up, the callback will be called again every escape.
        }
    }, [action, key]);
}