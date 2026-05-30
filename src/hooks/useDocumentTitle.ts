import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | StaffSync` : 'StaffSync';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
