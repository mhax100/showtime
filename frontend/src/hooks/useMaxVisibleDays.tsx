import { useEffect, useState } from 'react';

function useMaxVisibleDays() {
  const [maxVisibleDays, setMaxVisibleDays] = useState(3); // default

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setMaxVisibleDays(7); // xl
      else if (window.innerWidth >= 1024) setMaxVisibleDays(5); // lg
      else if (window.innerWidth >= 768) setMaxVisibleDays(4); // md
      else setMaxVisibleDays(3); // sm and below
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return maxVisibleDays;
}

export default useMaxVisibleDays;
