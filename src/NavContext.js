import { createContext, useContext } from 'react';
export const NavContext = createContext(() => {});
export const useNav = () => useContext(NavContext);
