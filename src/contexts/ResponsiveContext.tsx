import { createContext, useContext } from 'react';
export const ResponsiveContext = createContext({ desktop: false, sidebar: false, contentWidth: 0, columns: 1 });
export const useResponsive = () => useContext(ResponsiveContext);
