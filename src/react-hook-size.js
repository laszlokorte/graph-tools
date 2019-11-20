import { useState, useEffect, useRef } from 'react';
import ResizeObserverPoyfill from 'resize-observer-polyfill';

export function useSize(ref) {

    const obs = useRef();
    const [ignored, setIgnored] = useState(0);
    const [size, setSize] = useState({ width: null, height: null });

    useEffect(() => {
        function observe(entries) {
            const width = entries[0].target.clientWidth;
            const height = entries[0].target.clientHeight;
            setSize((s) => s.width !== width || s.height !== height ? { width, height } : s);
        }
        const RObserver = window.ResizeObserver || require('').default;
        obs.current = new RObserver(observe);
        return () => obs.current.disconnect();
    }, []);

    useEffect(() => {
        const forceUpdate = () => setIgnored((c) => c + 1);
        const item = ref.current;
        if(item) {
            obs.current.observe(item);
            window.setTimeout(forceUpdate, 0);
        }
        return () => item && obs.current.unobserve(item);
    }, [obs, ref]);

    return size;

}
