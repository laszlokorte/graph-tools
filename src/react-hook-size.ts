import { useState, useEffect, useRef } from 'react';

export function useSize(ref, w, h) {
    const [size, setSize] = useState({ width: w, height: h });

    useEffect(() => {
        function observe() {
            const width = ref.current.clientWidth;
            const height = ref.current.clientHeight;
            setSize((s) => s.width !== width || s.height !== height ? { width, height } : s);
        }
        window.addEventListener('resize', observe)
        if(ref) {
            observe()
        }
        return () => window.removeEventListener('resize', observe)
    }, []);

    return size;
}
