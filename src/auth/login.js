import { Client, Account, ID } from 'appwrite';

// Initialize Appwrite client
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const client = new Client();
if (ENDPOINT) client.setEndpoint(ENDPOINT);
if (PROJECT_ID) client.setProject(PROJECT_ID);

const account = new Account(client);

// UI elements
const authSection = document.getElementById('authSection');
const appMain = document.getElementById('appMain');
const logoutBtn = document.getElementById('logoutBtn');

const authForm = document.getElementById('authForm');
const emailEl = document.getElementById('authEmail');
const passEl = document.getElementById('authPassword');
const submitBtn = document.getElementById('authSubmit');
const toggleBtn = document.getElementById('toggleAuthMode');
const hintEl = document.getElementById('authHint');
const errorEl = document.getElementById('authError');

let isRegister = false;

function envOk(){
  return Boolean(ENDPOINT && PROJECT_ID);
}

function setLoading(loading){
  if(submitBtn){ submitBtn.disabled = loading; submitBtn.textContent = loading ? (isRegister ? 'Creating...' : 'Signing in...') : (isRegister ? 'Create account' : 'Sign in'); }
}
function showError(msg){ if(errorEl){ errorEl.textContent = msg || ''; errorEl.style.display = msg ? 'block' : 'none'; } }

function showApp(){
  if(authSection) authSection.style.display = 'none';
  if(appMain) appMain.style.display = 'block';
  if(logoutBtn) logoutBtn.style.display = 'inline-block';
}
function showAuth(){
  if(appMain) appMain.style.display = 'none';
  if(logoutBtn) logoutBtn.style.display = 'none';
  if(authSection) authSection.style.display = 'block';
}

async function getSession(){
  try{ return await account.get(); }catch(e){ return null; }
}

async function ensureLoggedIn(){
  if(!envOk()){
    showAuth();
    showError('App configuration missing. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID in .env and restart the dev server.');
    console.error('Missing env vars:', { ENDPOINT, PROJECT_ID });
    return;
  }
  
  // Check if there's an active session
  const user = await getSession();
  
  if(user){
    // User is logged in, show the app
    showApp();
  } else {
    // No session, show auth form
    showAuth();
  }
}

async function login(email, password){
  // Try modern SDK method first; fall back if needed
  try {
    // Appwrite v14+: createEmailPasswordSession
    if(typeof account.createEmailPasswordSession === 'function'){
      return await account.createEmailPasswordSession({ email, password });
    }
    // Older SDKs
    return await account.createEmailSession(email, password);
  } catch (err){
    // Fallback attempt for signature variations
    try { return await account.createEmailPasswordSession(email, password); } catch(e){ throw err; }
  }
}

async function register(email, password){
  try {
    if(typeof account.create === 'function'){
      // Prefer object signature; fall back to positional
      try {
        return await account.create({ userId: ID.unique(), email, password });
      } catch (e1){
        return await account.create(ID.unique(), email, password);
      }
    }
    throw new Error('Unsupported SDK version for registration');
  } catch(err){ throw err; }
}

async function logout(){
  try {
    // Clear the current session
    if(typeof account.deleteSession === 'function'){
      await account.deleteSession('current');
    } else if(typeof account.deleteSessions === 'function'){
      await account.deleteSessions();
    }
    
    // Clear any stored user data from localStorage if you're using it
    localStorage.clear(); // Or be more specific if you only want to clear certain keys
    
  } catch(e){ 
    console.log('Logout error (may be expected if no session):', e);
  }
}

// Wire UI
if(toggleBtn){
  toggleBtn.addEventListener('click', ()=>{
    isRegister = !isRegister;
    if(submitBtn) submitBtn.textContent = isRegister ? 'Create account' : 'Sign in';
    if(toggleBtn) toggleBtn.textContent = isRegister ? 'Have an account? Sign in' : 'Create account';
    if(hintEl) hintEl.textContent = isRegister ? 'Create a new account with email and password.' : 'Use your email and password to sign in.';
    showError('');
  });
}

if(authForm){
  authForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '').trim();
    if(!email || !password){ showError('Please enter your email and password.'); return; }
    setLoading(true); showError('');
    try{
      // If a session is already active, just show the app
      const existing = await getSession();
      if(existing){
        showApp();
        return;
      }
      if(isRegister){
          await register(email, password);
        // auto sign-in after register
          await login(email, password);
      } else {
        try{
          await login(email, password);
        } catch(err){
          // If the backend reports a session is already active, treat as success
          const msg = (err?.message || '').toLowerCase();
          const alreadyActive = err?.code === 409 || msg.includes('session') && msg.includes('active');
          if(!alreadyActive){ throw err; }
        }
      }
        // verify session
        const me = await getSession();
        if(me){
          window.dispatchEvent(new CustomEvent('appwrite-authenticated', { detail: { user: me } }));
          showApp();
        } else {
          showError('Signed in, but no session detected. Check Appwrite Platform origin settings (CORS).');
        }
        
      } catch(err){
        // try to surface structured SDK error
        const msg = err?.message || err?.response?.message || 'Authentication failed';
        showError(msg);
        console.error('Auth error:', err);
    } finally { setLoading(false); }
  });
}

if(logoutBtn){
  logoutBtn.addEventListener('click', async ()=>{
    await logout();
    showAuth();
  });
}

// On load, decide which UI to show
ensureLoggedIn();
