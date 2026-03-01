import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function VerifyPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'signup') {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (sessionError) {
            setError('Failed to verify email. Please try again.');
          } else {
            setIsVerified(true);
            // Clear the hash after verification
            window.location.hash = '';
          }
        } else {
          setError('Invalid verification link.');
        }
      } catch (err) {
        setError('An error occurred during verification.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {!isVerified && !error && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
            <h1 className="text-3xl font-bold text-white">Verifying your email...</h1>
            <p className="text-dark-400">Please wait while we confirm your account.</p>
          </div>
        )}

        {isVerified && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Account Verified!</h1>
              <p className="text-dark-400 text-lg mb-6">
                Your email has been successfully confirmed. You can now close this window and return to the Devion app.
              </p>
              <p className="text-dark-500 text-sm">
                The app will automatically refresh and sign you in.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Verification Failed</h1>
              <p className="text-red-400 text-lg mb-6">{error}</p>
              <p className="text-dark-500 text-sm">
                Please try signing up again or contact support if the issue persists.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
