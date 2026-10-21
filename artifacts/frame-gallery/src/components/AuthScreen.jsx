import { AlertCircle, ArrowUpRight, LoaderCircle, LockKeyhole } from "lucide-react";
import "./auth-screen.css";

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || "We couldn’t complete sign-in. Please try again.";
}

function AuthScreen({
  isLoading = false,
  isRedirecting = false,
  authError,
  actionError,
  onSignIn,
}) {
  const loading = isLoading || isRedirecting;
  const errorMessage = getErrorMessage(actionError) || getErrorMessage(authError);

  if (loading) {
    return (
      <main className="frame-auth" aria-busy="true">
        <div className="frame-auth__top">
          <a className="frame-auth__brand" href="/" aria-label="Frame home" data-testid="auth-home">
            <span className="frame-auth__mark" aria-hidden="true"><span /></span>
            <span>Frame</span>
          </a>
          <span className="frame-auth__top-note">A personal image archive</span>
        </div>
        <section className="frame-auth__loading" aria-live="polite" role="status" data-testid="auth-loading">
          <span className="frame-auth__loader" aria-hidden="true">
            <LoaderCircle />
          </span>
          <p className="frame-auth__eyebrow">One moment</p>
          <h1>{isRedirecting ? "Opening your sign-in." : "Preparing your collection."}</h1>
          <p className="frame-auth__loading-copy">
            {isRedirecting
              ? "Taking you to Frame’s hosted sign-in page."
              : "Getting everything ready."}
          </p>
        </section>
        <footer className="frame-auth__footer">
          <span>FRAME — PERSONAL IMAGE ARCHIVE</span>
          <span>Made for looking back</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="frame-auth">
      <div className="frame-auth__top">
        <a className="frame-auth__brand" href="/" aria-label="Frame home" data-testid="auth-home">
          <span className="frame-auth__mark" aria-hidden="true"><span /></span>
          <span>Frame</span>
        </a>
        <span className="frame-auth__top-note">A personal image archive</span>
      </div>

      <section className="frame-auth__content" aria-labelledby="frame-auth-title">
        <div className="frame-auth__art" aria-hidden="true">
          <div className="frame-auth__photo">
            <span className="frame-auth__sun" />
            <span className="frame-auth__ridge frame-auth__ridge--back" />
            <span className="frame-auth__ridge frame-auth__ridge--front" />
            <span className="frame-auth__print-edge" />
          </div>
          <span className="frame-auth__art-caption">Light, kept close</span>
        </div>

        <div className="frame-auth__copy">
          <p className="frame-auth__eyebrow">Your collection, in view</p>
          <h1 id="frame-auth-title">A place for the photographs you keep.</h1>
          <p className="frame-auth__description">
            Sign in to continue to your quiet corner of the gallery.
          </p>

          {errorMessage && (
            <div className="frame-auth__error" role="alert" data-testid="auth-error">
              <AlertCircle aria-hidden="true" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            className="frame-auth__button"
            type="button"
            onClick={onSignIn}
            disabled={!onSignIn}
            data-testid="sign-in"
          >
            <span>{errorMessage ? "Try sign-in again" : "Continue to sign in"}</span>
            <ArrowUpRight aria-hidden="true" />
          </button>

          <p className="frame-auth__hosted-note">
            <LockKeyhole aria-hidden="true" />
            <span>
              Sign-in is managed by Amazon Cognito. Create an account and verify your
              email on its hosted sign-in page.
            </span>
          </p>
        </div>
      </section>

      <aside className="frame-auth__disclosure" aria-label="Gallery access notice">
        <span className="frame-auth__disclosure-rule" aria-hidden="true" />
        <p>
          <strong>A note on access</strong>
          <span>
            Sign-in only gates this interface. The AWS gallery API is not yet
            authenticated or isolated by account.
          </span>
        </p>
      </aside>

      <footer className="frame-auth__footer">
        <span>FRAME — PERSONAL IMAGE ARCHIVE</span>
        <span>Made for looking back</span>
      </footer>
    </main>
  );
}

export default AuthScreen;
