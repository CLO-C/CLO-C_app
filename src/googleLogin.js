import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';

<GoogleOAuthProvider clientId="<790433028221-ldq09btprnnrd8uiiq2lgns0p2v505fg.apps.googleusercontent.com>">...</GoogleOAuthProvider>;

<GoogleLogin
    onSuccess={credentialResponse => {
        console.log(credentialResponse);
    }}
    onError={() => {
        console.log('Login Failed');
    }}
/>;

import { useGoogleOneTapLogin } from '@react-oauth/google';

useGoogleOneTapLogin({
    onSuccess: credentialResponse => {
        console.log(credentialResponse);
    },
    onError: () => {
        console.log('Login Failed');
    },
});

import { googleLogout } from '@react-oauth/google';

googleLogout();

<GoogleLogin
    
    auto_select
/>

useGoogleOneTapLogin({
    
    auto_select
});