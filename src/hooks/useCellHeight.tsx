import { useEffect, useState } from 'react'

function useCellHeight() {
  const [height, setHeight] = useState(16)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 1280) setHeight(28)
      else if (width >= 1024) setHeight(24)
      else if (width >= 768) setHeight(20)
      else setHeight(16)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return height
}

export default useCellHeight