import { resendOTPAPI } from '../../api/resend-otp.api.js';
import { otpVerificationAPI } from '../../api/verify-otp.api.js';
import { navigate } from '../../router/navigate.js';
import { setPendingVerificationEmail } from '../../state/app.state.js';
import { getElement } from '../../utils/dom.utils.js';

let otpAbortListener: AbortController | null = null;

export async function handleOTPVerification(email: string) {
  otpAbortListener?.abort();
  otpAbortListener = new AbortController();

  const otpVerificationSection = getElement<HTMLFormElement>(
    '.auth--verify-otp',
  );
  const otpUIDesc = getElement<HTMLElement>('.auth__description-verify-otp');
  const userEmail = getElement<HTMLElement>('.auth__email-otp-target');
  const otpInput = getElement<HTMLInputElement>('.auth__input--otp');
  const otpErrorField = getElement<HTMLElement>('#otp-error');
  const otpErrorText = otpErrorField.querySelector<HTMLElement>('p');
  const otpVerificationBtn = getElement<HTMLButtonElement>(
    '.auth__btn--verify-otp',
  );
  const otpVerificationBtnText =
    otpVerificationBtn.querySelector('.auth__btn-text')!;

  const loadingSpinner = getElement<HTMLSpanElement>(
    '.auth__spinner--verify-otp',
  );

  const loadingSpinnerResend = getElement<HTMLSpanElement>(
    '.auth__spinner--otp-resend',
  );

  const otpResendLink = getElement<HTMLAnchorElement>(
    '.auth__link--otp-resend',
  );
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  const timerText = getElement<HTMLSpanElement>('.auth__resend-timer');

  if (!otpErrorText) return;

  otpUIDesc.textContent = 'We sent a 6-digit code to ';
  startTimer();

  function updateButtonState() {
    if (otpInput.value) {
      otpVerificationBtn.classList.add('auth__btn--active');
    } else {
      otpVerificationBtn.classList.remove('auth__btn--active');
    }
  }

  otpInput.addEventListener('input', () => {
    otpErrorField.classList.add('hidden');
    updateButtonState();
  });

  userEmail.textContent = email;

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      otpVerificationBtnText.classList.add('hidden');
      otpVerificationSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      otpVerificationBtnText.classList.remove('hidden');
      otpVerificationSection.removeAttribute('inert');
    }
  }

  function setLoadingStateResend(loading: boolean) {
    if (loading) {
      loadingSpinnerResend.classList.remove('hidden');
      otpVerificationSection.setAttribute('inert', '');
    } else {
      loadingSpinnerResend.classList.add('hidden');
      otpVerificationSection.removeAttribute('inert');
    }
  }

  otpVerificationBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();

      if (!otpVerificationBtn.classList.contains('auth__btn--active')) return;

      otpVerificationBtn.classList.remove('auth__btn--active');
      setLoadingState(true);

      const response = await otpVerificationAPI(email, otpInput.value);

      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          otpErrorField.classList.remove('hidden');
          otpErrorText.textContent = data.error;
        }
      } else {
        setPendingVerificationEmail(null);
        history.replaceState({}, '', '/home');
        navigate();
      }

      setLoadingState(false);
    },
    { signal: otpAbortListener.signal },
  );

  otpResendLink.addEventListener(
    'click',
    async () => {
      if (!otpResendLink.classList.contains('auth__link--otp-resend-active'))
        return;

      setLoadingStateResend(true);
      otpResendLink.classList.remove('auth__link--otp-resend-active');

      await resendOTPAPI(email);
      setLoadingStateResend(false);
      otpUIDesc.textContent = 'A new 6-digit code has been sent to';
      startTimer();
    },
    {
      signal: otpAbortListener.signal,
    },
  );

  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    let timeLeft = 60;

    otpResendLink.classList.remove('auth__link--otp-resend-active');
    timerText.classList.remove('hidden');
    timerText.textContent = `(${timeLeft}s)`;

    timerInterval = setInterval(() => {
      timeLeft--;

      timerText.textContent = `(${timeLeft}s)`;

      if (timeLeft <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;

        otpResendLink.classList.add('auth__link--otp-resend-active');
        timerText.textContent = '';
        timerText.classList.add('hidden');
      }
    }, 1000);
  }
}
