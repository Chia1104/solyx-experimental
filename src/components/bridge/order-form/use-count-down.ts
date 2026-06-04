import { useEffect, useMemo, useState } from 'react';

import dayjs from 'dayjs';

const getRemainingMilliseconds = (expiresAt?: string | null) => {
  if (!expiresAt) {
    return 0;
  }

  const expiresAtDate = dayjs(expiresAt);
  if (!expiresAtDate.isValid()) {
    return 0;
  }

  return Math.max(expiresAtDate.diff(dayjs(), 'milliseconds'), 0);
};

export const useCountDown = (expiresAt?: string | null, interval = 1000) => {
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(() =>
    getRemainingMilliseconds(expiresAt),
  );

  useEffect(() => {
    setRemainingMilliseconds(getRemainingMilliseconds(expiresAt));

    if (!expiresAt) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingMilliseconds(getRemainingMilliseconds(expiresAt));
    }, interval);

    return () => clearInterval(timer);
  }, [expiresAt, interval]);

  return useMemo(
    () => ({
      isExpired: Boolean(expiresAt) && remainingMilliseconds <= 0,
      remainingMilliseconds,
      remainingSeconds: Math.ceil(remainingMilliseconds / 1000),
    }),
    [expiresAt, remainingMilliseconds],
  );
};
