import React from 'react'

import { classMerge } from '@/lib/utils';

interface Props {
    children?: React.ReactNode;
    className?: string;
}

const NavBarContainer = ({children, className}: Props) => {
  return (
    <div className={classMerge('flex flex-row items-center justify-between w-full h-20 backdrop-blur-sm px-4 py-2 bg-background/80 sticky top-0 z-50' , className)}>
        {children}
    </div>
  )
}

export default NavBarContainer