import { MutableRefObject, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openContextMenu } from 'app/store';

export function useContextMenu(ref: MutableRefObject<HTMLElement | null>, type: string, data: any): void {
  const dispatch = useDispatch();

  useEffect(() => {
    const element = ref.current;
    let touchTimer: NodeJS.Timeout | null = null;

    if (element) {
      const openContext = (position: number[]) => {
        dispatch(openContextMenu(position, type, data));
      };
      const clearTimer = () => {
        if (touchTimer) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      };
      const onContext = (e: MouseEvent) => {
        e.preventDefault();
        if (touchTimer === null) openContext([e.clientX, e.clientY]);
      };
      const touchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          touchTimer = setTimeout(() => {
            clearTimer();
            openContext([e.touches[0].clientX, e.touches[0].clientY]);
          }, 300);
        } else clearTimer();
      };
      const touchEnd = (e: TouchEvent) => {
        if (e.type !== 'touchmove' && e.cancelable && !touchTimer) e.preventDefault();
        clearTimer();
      };

      element.addEventListener('contextmenu', onContext);
      element.addEventListener('touchstart', touchStart, { passive: false });
      element.addEventListener('touchmove', touchEnd, { passive: true });
      element.addEventListener('touchend', touchEnd);
      element.addEventListener('touchcancel', touchEnd);

      return () => {
        if (touchTimer) clearTimeout(touchTimer);
        element.removeEventListener('contextmenu', onContext);
        element.removeEventListener('touchstart', touchStart);
        element.removeEventListener('touchmove', touchEnd);
        element.removeEventListener('touchend', touchEnd);
        element.removeEventListener('touchcancel', touchEnd);
      };
    }
  }, [dispatch, ref, type, data]);
}
