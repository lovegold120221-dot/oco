/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import React, { useEffect, useState } from 'react';

export interface ExtendedErrorType {
  code?: number;
  message?: string;
  status?: string;
}

export default function ErrorScreen() {
  const { client } = useLiveAPIContext();
  const [error, setError] = useState<{ message?: string } | null>(null);

  useEffect(() => {
    function onError(error: ErrorEvent) {
      const errMsg = error.message || '';
      const isKnownHandling = errMsg.toLowerCase().includes('prepayment') || 
                             errMsg.toLowerCase().includes('depleted') || 
                             errMsg.toLowerCase().includes('quota') || 
                             errMsg.toLowerCase().includes('resource_exhausted') || 
                             errMsg.toLowerCase().includes('goaway') ||
                             errMsg.toLowerCase().includes('go away');

      if (!isKnownHandling) {
        console.error(error);
      }
      setError(error);
    }

    client.on('error', onError);

    return () => {
      client.off('error', onError);
    };
  }, [client]);

  const quotaErrorMessage =
    'Gemini Live API in AI Studio has a limited free quota each day. Come back tomorrow to continue.';

  const prepaymentErrorMessage =
    'Your Google AI Studio prepayment credits are depleted. Please check billing at https://aistudio.google.com/ to reactivate the real-time Live API voice service.';

  let errorMessage = 'Something went wrong. Please try again.';
  let rawMessage: string | null = error?.message || null;
  let tryAgainOption = true;
  const isPrepayment = error?.message?.toLowerCase().includes('prepayment') ||
                      error?.message?.toLowerCase().includes('depleted') ||
                      error?.message?.toLowerCase().includes('credit');

  if (error?.message?.includes('RESOURCE_EXHAUSTED')) {
    errorMessage = quotaErrorMessage;
    rawMessage = null;
    tryAgainOption = false;
  } else if (isPrepayment) {
    errorMessage = prepaymentErrorMessage;
    rawMessage = null;
    tryAgainOption = false;
  }

  if (!error) {
    return <div style={{ display: 'none' }} />;
  }

  return (
    <div className="error-screen">
      <div
        style={{
          fontSize: 48,
        }}
      >
        💔
      </div>
      <div
        className="error-message-container"
        style={{
          fontSize: 22,
          lineHeight: 1.2,
          opacity: 0.5,
        }}
      >
        {errorMessage}
      </div>
      {tryAgainOption ? (
        <button
          className="close-button"
          onClick={() => {
            setError(null);
          }}
        >
          Close
        </button>
      ) : null}
      {rawMessage ? (
        <div
          className="error-raw-message-container"
          style={{
            fontSize: 15,
            lineHeight: 1.2,
            opacity: 0.4,
          }}
        >
          {rawMessage}
        </div>
      ) : null}
    </div>
  );
}
