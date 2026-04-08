import { type AppState } from '../types/app-state.types.js';
import {
  pendingVerificationEmail,
  setAppState,
  setPendingVerificationEmail,
} from '../state/app.state.js';
import { initPasswordToggle } from '../features/auth/password-toggle.js';
import { initCountryDropdown } from '../features/auth/country-dropdown.feature.js';
import {
  resetAuthState,
  revertResetPasswordUI,
} from '../features/auth/reset-auth.js';
import {
  initProfileEdit,
  resetProfile,
} from '../features/dashboard/profile-edit.js';
import { initInputCursor } from '../features/auth/input-cursor.js';
import { initDeleteAccount } from '../features/auth/delete-account.js';
import { resetDeleteModal } from '../features/auth/delete-account.js';
import { verifyTokenAPI } from '../api/verify-token.api.js';
import { handleResetPassword } from '../ui/form/reset-password.ui.js';
import { handleUpdatePassword } from '../ui/form/update-password.ui.js';
import { handlePasswordUpdated } from '../ui/form/password-updated.ui.js';
import { verifyAuthAPI } from '../api/verify-auth.api.js';
import { handleHome } from '../ui/form/home.ui.js';
import { handleProfile } from '../ui/form/profile.ui.js';
import { handleDeleteAccount } from '../ui/form/delete-account.ui.js';
import { handleSignOut } from '../ui/form/signout.ui.js';
import { getElement } from '../utils/dom.utils.js';

export async function navigate(): Promise<void> {
  resetAuthState();
  resetProfile();
  resetDeleteModal();

  const validStates: AppState[] = [
    '',
    'dashboard',
    'home',
    'profile',
    'signin',
    'signup',
    'verify',
    'reset',
    'update-password',
    'password-updated',
  ];

  let route = location.pathname.slice(1) as AppState;
  const protectedRoutes = ['home', 'profile'];
  const isNestedRoute = route.includes('/');
  const params = new URLSearchParams(window.location.search);

  if (!validStates.includes(route) || isNestedRoute) {
    setAppState('error');
    return;
  }

  if (
    params.toString() &&
    route !== 'reset' &&
    !(route === 'profile' && params.get('error') === 'wrong_account') &&
    !(
      route === 'signin' &&
      ['signout', 'expired', 'deleted'].includes(params.get('message') ?? '')
    )
  ) {
    setAppState('error');
    return;
  }

  if (route === 'update-password' || route === 'password-updated') {
    setAppState('error');
    return;
  }

  if (route === 'verify' && pendingVerificationEmail === null) {
    window.location.replace('/signup');
    return;
  }

  if (route !== 'verify') {
    setPendingVerificationEmail(null);
  }

  if (route === '') {
    const response = await verifyAuthAPI();
    if (!response?.ok) {
      window.location.replace('/dashboard');
      return;
    } else {
      const user = await response.json();
      window.appUser = user;
      handleHome(user);
      handleSignOut();
      window.location.replace('/home');
      return;
    }
  }

  if (protectedRoutes.includes(route)) {
    if (window.appUser) {
      if (route === 'home') {
        handleHome(window.appUser);
        handleSignOut();
      }
    }

    const response = await verifyAuthAPI();
    if (!response?.ok) {
      window.location.replace('/signin?message=expired');
      return;
    } else {
      const user = await response.json();
      window.appUser = user;

      if (route === 'home') {
        handleHome(user);
        handleSignOut();
      }
      if (route === 'profile') {
        handleProfile(user);
        initProfileEdit();
        initDeleteAccount(user);
        handleDeleteAccount();
        initPasswordToggle('dashboard');
      }
    }
  }

  if (route === 'reset') {
    if (params.toString()) {
      const allowedParams = ['mode', 'token', 'expired', 'status'];
      const hasInvalidParams = [...params.keys()].some(
        (key) => !allowedParams.includes(key),
      );

      const mode = params.get('mode');
      const token = params.get('token');
      const expired = params.get('expired');
      const status = params.get('status');

      const paramsCount = [mode, token, expired, status].filter(Boolean).length;
      const isValidMode = mode === 'reset' || mode === 'change';
      const isValidToken = token?.length === 64;
      const isValidExpired = expired === 'true';
      const isValidStatus = status === 'success';

      if (hasInvalidParams || paramsCount > 1) {
        setAppState('error');
        return;
      } else if (isValidMode) {
        if (mode === 'change') {
          const response = await verifyAuthAPI();
          if (!response?.ok) {
            window.location.replace('/signin');
            return;
          }
        }
        handleResetPassword();
      } else if (isValidStatus) {
        const storedEmail = sessionStorage.getItem('email');
        if (storedEmail) {
          handlePasswordUpdated(storedEmail);
          route = 'password-updated';
        } else {
          window.location.replace('/signin');
          return;
        }
      } else if (isValidToken) {
        sessionStorage.setItem('isTokenGenerated', 'true');

        const response = await verifyTokenAPI(token);
        if (response.ok) {
          route = 'update-password';
          handleUpdatePassword();
        } else {
          history.replaceState({}, '', '/reset?expired=true');
          route = 'reset';
        }
      } else if (isValidExpired) {
        let hasToken = sessionStorage.getItem('isTokenGenerated');

        if (!hasToken) {
          window.location.replace('/reset?mode=reset');
          return;
        }
      } else {
        setAppState('error');
        return;
      }
    } else {
      window.location.replace('/signin');
    }
  }

  setAppState(route);

  if (route === 'profile' && params.get('error') === 'wrong_account') {
    history.replaceState({}, '', '/profile');

    const modalOverlay = getElement<HTMLElement>('.dashboard__modal-overlay');
    const modalStep = getElement<HTMLElement>('.dashboard__modal-step');
    const googleError = getElement<HTMLElement>(
      '#dashboard-modal-error-google',
    );

    modalOverlay.classList.remove('hidden');
    modalStep.classList.remove('hidden');
    googleError.classList.remove('hidden');
  }

  if (
    route === 'signin' ||
    route === 'signup' ||
    route === 'reset' ||
    route === 'update-password'
  ) {
    initPasswordToggle('auth');
    initInputCursor();
  }

  if (route === 'reset') revertResetPasswordUI();

  if (route === 'signup') initCountryDropdown(route);
}
