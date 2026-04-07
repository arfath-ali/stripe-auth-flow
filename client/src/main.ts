import { initLinkInterceptor } from './router/initLinkInterceptor.js';
import { navigate } from './router/navigate.js';
import { handleGoogleAuth } from './ui/form/google-auth.ui.js';
import { handleSignin } from './ui/form/signin.ui.js';
import { handleSignUp } from './ui/form/signup.ui.js';
  
function initApp(): void {
  handleGoogleAuth();
  initLinkInterceptor();
  window.addEventListener('popstate', navigate);
  navigate();
  handleSignin();
  handleSignUp();
}

window.addEventListener('DOMContentLoaded', initApp);
