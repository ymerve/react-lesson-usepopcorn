import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
    const [value, setValue] = useState(function () {
        const storagedValue = localStorage.getItem(key);
        return storagedValue ? JSON.parse(storagedValue) : initialState;
    });
    useEffect(function () {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);
    return [value, setValue];
}