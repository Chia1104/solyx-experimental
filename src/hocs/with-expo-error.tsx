import { useEffect } from 'react';
import type { FC } from 'react';

import type { ErrorBoundaryProps } from 'expo-router';

export const withExpoError = (
  Component: FC<ErrorBoundaryProps>,
  options?: {
    onError?: (error: ErrorBoundaryProps) => void;
  },
) => {
  return function ErrorWrapper(props: ErrorBoundaryProps) {
    useEffect(() => {
      if (props.error && options?.onError) {
        options.onError(props);
      }
    }, [props]);
    return <Component {...props} />;
  };
};
